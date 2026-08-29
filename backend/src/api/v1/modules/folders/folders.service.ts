import type { JsonValue } from "@prisma/client/runtime/client";
import NotFoundError from "../../../../common/errors/NotFoundError.ts";
import { prisma } from "../../../../common/lib/prisma.ts";
import type {
  BulkCreateFolderDto,
  CreateFolderDto,
  DeleteFolderDto,
  ListFolderContentsDto,
  RenameFolderDto,
  ShareFolderDto,
  ViewSharedFolderChildFileSchemaDto,
  ViewSharedFolderDto,
} from "./folders.dto.ts";
import {
  buildFileShareUrl,
  buildFolderShareUrl,
} from "../../../../common/lib/utils.ts";
import BadRequestError from "../../../../common/errors/BadRequestError.ts";
import S3StorageService from "../storage/services/S3StorageService.ts";

class FolderService {
  private readonly storageService;

  constructor() {
    this.storageService = new S3StorageService();
  }

  async createFolder(data: CreateFolderDto): Promise<void> {
    const parentFolder = data.parentFolderId
      ? await prisma.folder.findUnique({
          where: { id: data.parentFolderId, ownerId: data.ownerId },
          select: { id: true, name: true, path: true },
        })
      : null;

    if (data.parentFolderId && !parentFolder) {
      throw new NotFoundError("Parent folder not found");
    }

    await prisma.$transaction(async (tx) => {
      const newFolder = await tx.folder.create({
        data: {
          name: data.name,
          parentId: data.parentFolderId ?? null,
          ownerId: data.ownerId,
        },
      });

      const path = [
        ...(parentFolder
          ? (parentFolder.path as Array<{ name: string; id: string }>)
          : []),
        {
          name: data.name,
          id: newFolder.id, // Placeholder for the new folder ID
        },
      ];

      await tx.folder.update({
        data: { path },
        where: { id: newFolder.id },
      });
    });
  }

  async bulkCreateFolders({
    folderStructure,
    ownerId,
    parentFolderId,
  }: BulkCreateFolderDto) {
    const parentFolder = parentFolderId
      ? await prisma.folder.findFirst({
          where: {
            id: parentFolderId,
            ownerId,
          },
          select: {
            id: true,
            name: true,
            path: true,
          },
        })
      : null;

    if (parentFolderId && !parentFolder) {
      throw new NotFoundError("Parent folder not found");
    }

    type QueueItem = {
      name: string;
      parentId: string | null;
      path: JsonValue;
      objectIdx: string[];
    };

    let queue: QueueItem[] = [];
    let createdFolders: Record<string, string> = {};

    queue.push({
      name: Object.keys(folderStructure)[0], // root folder name
      parentId: parentFolderId ?? null,
      path: parentFolder ? parentFolder.path : [],
      objectIdx: [Object.keys(folderStructure)[0]],
    });

    while (queue.length > 0) {
      const parent = queue.shift()!;

      const newFolder = await prisma.folder.create({
        data: {
          name: parent.name,
          parentId: parent.parentId,
          ownerId,
        },
        select: { id: true, name: true, path: true },
      });

      const path = [
        ...(parent.path as any[]),
        {
          name: parent.name,
          id: newFolder.id,
        },
      ];

      createdFolders[parent.objectIdx.join("/")] = newFolder.id;

      await prisma.folder.update({
        data: { path },
        where: { id: newFolder.id },
      });

      let childrenFolders = folderStructure;

      for (const key of parent.objectIdx) {
        childrenFolders = childrenFolders[key];
      }

      for (const childName in childrenFolders) {
        queue.push({
          name: childName,
          parentId: newFolder.id,
          path,
          objectIdx: [...parent.objectIdx, childName],
        });
      }
    }

    return createdFolders;
  }

  async listFolderContents({ folderId, ownerId }: ListFolderContentsDto) {
    const folder = folderId
      ? await prisma.folder.findUnique({
          where: { id: folderId, ownerId },
          select: { id: true, path: true },
        })
      : null;

    if (folderId && !folder) {
      throw new NotFoundError("Folder not found");
    }

    const [folders, files] = await prisma.$transaction([
      prisma.folder.findMany({
        where: { ownerId, parentId: folderId ?? null },
        select: {
          id: true,
          name: true,
          path: true,
          createdAt: true,
          visibility: true,
          folderShare: { select: { token: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.file.findMany({
        where: { ownerId, folderId: folderId ?? null },
        select: {
          id: true,
          name: true,
          mimeType: true,
          size: true,
          createdAt: true,
          visibility: true,
          fileShare: {
            select: {
              token: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return {
      path: folderId ? folder?.path : [],
      folders: folders.map(({ folderShare, ...folder }) => ({
        ...folder,
        shareUrl: folderShare ? buildFolderShareUrl(folderShare.token) : null,
      })),
      files: files.map(({ fileShare, ...file }) => ({
        ...file,
        viewUrl: `/files/${file.id}/view`,
        downloadUrl: `/files/${file.id}/download`,
        shareUrl: fileShare ? buildFileShareUrl(fileShare.token) : null,
      })),
    };
  }

  async renameFolder({ folderId, newFolderName, ownerId }: RenameFolderDto) {
    const folder = await prisma.folder.findUnique({
      where: { id: folderId, ownerId },
      select: { id: true, name: true, path: true },
    });

    if (!folder) {
      throw new NotFoundError("Folder not found");
    }

    let newPath = folder.path as Array<{ name: string; id: string }>;

    newPath[newPath.length - 1] = {
      name: newFolderName,
      id: folder.id,
    };

    await prisma.folder.update({
      where: { id: folder.id },
      data: { name: newFolderName, path: newPath },
    });
  }

  async deleteFolder({ folderId, ownerId }: DeleteFolderDto) {
    const folder = await prisma.folder.findUnique({
      where: { id: folderId, ownerId },
      select: {
        id: true,
        _count: {
          select: {
            children: true,
            files: true,
          },
        },
      },
    });

    if (!folder) {
      throw new NotFoundError("Folder not found");
    }

    if (folder._count.children > 0 || folder._count.files > 0) {
      throw new BadRequestError("Cannot delete a non empty folder");
    }

    await prisma.folder.delete({
      where: { id: folderId },
    });
  }

  async shareFolder({ folderId, ownerId }: ShareFolderDto) {
    const folder = await prisma.folder.findUnique({
      where: { id: folderId, ownerId },
      select: { id: true, name: true, path: true, visibility: true },
    });

    if (!folder) {
      throw new NotFoundError("Folder not found");
    }

    if (folder.visibility === "PUBLIC") {
      throw new BadRequestError("Folder is already public");
    }

    const token = crypto.randomUUID();

    await prisma.$transaction([
      prisma.folderShare.create({
        data: {
          folderId: folder.id,
          token,
        },
      }),
      prisma.folder.update({
        where: { id: folder.id },
        data: { visibility: "PUBLIC" },
      }),
    ]);

    return {
      shareUrl: buildFolderShareUrl(token),
    };
  }

  async unshareFolder({ folderId, ownerId }: ShareFolderDto) {
    const folder = await prisma.folder.findUnique({
      where: { id: folderId, ownerId },
      select: { id: true, name: true, visibility: true },
    });

    if (!folder) {
      throw new NotFoundError("Folder not found");
    }

    if (folder.visibility === "PRIVATE") {
      throw new BadRequestError("Folder is already private");
    }

    await prisma.$transaction([
      prisma.folderShare.delete({
        where: { folderId },
      }),
      prisma.folder.update({
        where: { id: folder.id },
        data: { visibility: "PRIVATE" },
      }),
    ]);
  }

  async listSharedFolderContents({ folderIds, token }: ViewSharedFolderDto) {
    const folderShare = await prisma.folderShare.findUnique({
      where: { token },
      select: {
        folderId: true,
      },
    });

    if (!folderShare) {
      throw new NotFoundError("Shared folder not found");
    }

    if (folderIds.length === 0) {
      const folder = await prisma.folder.findUnique({
        where: { id: folderShare.folderId },
        select: {
          id: true,
          name: true,
          path: true,
          visibility: true,
          createdAt: true,
        },
      });

      return {
        path: [],
        files: [],
        folders: folder
          ? [
              {
                ...folder,
                shareUrl: buildFolderShareUrl(token),
              },
            ]
          : [],
      };
    }

    const lastChildFolderId = folderIds[folderIds.length - 1];

    const lastChildFolder = await prisma.folder.findUnique({
      where: { id: lastChildFolderId },
      select: {
        path: true,
      },
    });

    if (!lastChildFolder) {
      throw new NotFoundError("Folder not found");
    }

    const rootIdx = (lastChildFolder.path as FolderPath).findIndex(
      (item) => item.id === folderShare.folderId,
    );

    if (rootIdx === -1) {
      throw new BadRequestError("Folder not found");
    }

    const isDescendant = (lastChildFolder.path as FolderPath)
      .slice(rootIdx)
      .every((item, index) => item.id === folderIds[index]);

    if (!isDescendant) {
      throw new BadRequestError("Folder not found");
    }

    const [folders, files] = await prisma.$transaction([
      prisma.folder.findMany({
        where: { parentId: lastChildFolderId },
        select: {
          id: true,
          name: true,
          path: true,
          createdAt: true,
          visibility: true,
          folderShare: {
            select: {
              token: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.file.findMany({
        where: { folderId: lastChildFolderId },
        select: {
          id: true,
          name: true,
          mimeType: true,
          size: true,
          createdAt: true,
          visibility: true,
          fileShare: {
            select: {
              token: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return {
      path: (lastChildFolder.path as FolderPath).slice(rootIdx),
      folders: folders.map(({ folderShare, ...folder }) => ({
        ...folder,
        shareUrl: folderShare ? buildFolderShareUrl(folderShare.token) : null,
      })),
      files: files.map(({ fileShare, ...file }) => ({
        ...file,
        viewUrl:
          (lastChildFolder.path as FolderPath)
            .slice(rootIdx)
            .map((item) => item.id)
            .join("/") + `/file/${file.id}`,
        downloadUrl:
          (lastChildFolder.path as FolderPath)
            .slice(rootIdx)
            .map((item) => item.id)
            .join("/") + `/file/${file.id}`,
        shareUrl: fileShare ? buildFileShareUrl(fileShare.token) : null,
      })),
    };
  }

  async listSharedFolders({ ownerId }: { ownerId: number }) {
    const folders = await prisma.folder.findMany({
      where: { ownerId, visibility: "PUBLIC" },
      select: {
        id: true,
        name: true,
        visibility: true,
        path: true,
        createdAt: true,
        folderShare: { select: { token: true, createdAt: true } },
      },
    });

    return folders.map(({ folderShare, ...folder }) => ({
      ...folder,
      shareUrl: folderShare ? buildFolderShareUrl(folderShare.token) : null,
      sharedAt: folderShare?.createdAt ?? null,
    }));
  }

  async viewSharedFolderChildFile({
    fileId,
    folderIds,
    token,
  }: ViewSharedFolderChildFileSchemaDto) {
    const folderShare = await prisma.folderShare.findUnique({
      where: { token },
      select: {
        folderId: true,
      },
    });

    if (!folderShare) {
      throw new NotFoundError("Shared folder not found");
    }

    if (folderIds.length === 0) {
      throw new BadRequestError("Invalid folder path");
    }

    const lastChildFolderId = folderIds[folderIds.length - 1];

    const lastChildFolder = await prisma.folder.findUnique({
      where: { id: lastChildFolderId },
      select: {
        path: true,
      },
    });

    if (!lastChildFolder) {
      throw new NotFoundError("Folder not found");
    }

    const rootIdx = (lastChildFolder.path as FolderPath).findIndex(
      (item) => item.id === folderShare.folderId,
    );

    if (rootIdx === -1) {
      throw new BadRequestError("Folder not found");
    }

    const isDescendant = (lastChildFolder.path as FolderPath)
      .slice(rootIdx)
      .every((item, index) => item.id === folderIds[index]);

    if (!isDescendant) {
      throw new BadRequestError("Folder not found");
    }

    const file = await prisma.file.findUnique({
      where: { id: fileId },
      select: {
        id: true,
        name: true,
        mimeType: true,
        size: true,
        createdAt: true,
        visibility: true,
        storageKey: true,
      },
    });

    if (!file) {
      throw new NotFoundError("File not found");
    }

    const downloadUrl = await this.storageService.getDownloadUrl(
      file.storageKey,
    );

    return {
      file,
      downloadUrl,
    };
  }
}

export const folderService = new FolderService();

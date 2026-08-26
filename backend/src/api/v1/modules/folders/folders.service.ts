import type { JsonValue } from "@prisma/client/runtime/client";
import NotFoundError from "../../../../common/errors/NotFoundError";
import { prisma } from "../../../../common/lib/prisma";
import type {
  BulkCreateFolderDto,
  CreateFolderDto,
  ListFolderContentsDto,
} from "./folders.dto";
import { env } from "../../../../env";

class FolderService {
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
        select: { id: true, name: true, path: true, createdAt: true },
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
        },
      }),
    ]);

    return {
      path: folderId ? folder?.path : [],
      folders,
      files: files.map((file) => ({
        ...file,
        url: `/files/${file.id}/view`,
      })),
    };
  }
}

export const folderService = new FolderService();

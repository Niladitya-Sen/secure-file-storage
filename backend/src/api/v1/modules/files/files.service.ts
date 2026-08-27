import BadRequestError from "../../../../common/errors/BadRequestError";
import NotFoundError from "../../../../common/errors/NotFoundError";
import { prisma } from "../../../../common/lib/prisma";
import type StorageService from "../storage/interfaces/StorageService";
import LocalStorageService from "../storage/services/LocalStorageService";
import crypto from "node:crypto";
import type { BulkUploadFolderDTO, RenameFileDTO } from "./files.dto";
import { env } from "../../../../env";
import { buildShareUrl } from "../../../../common/lib/utils";

class FileService {
  private readonly storageService: StorageService;

  constructor() {
    this.storageService = new LocalStorageService();
  }

  async uploadFile({
    userId,
    folderId,
    file,
  }: {
    userId: number;
    folderId: string | null;
    file: { buffer: Buffer; fileName: string; contentType: string };
  }) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    const folder = folderId
      ? await prisma.folder.findUnique({
          where: { id: folderId },
          select: { id: true, ownerId: true },
        })
      : null;

    if (!user) {
      throw new BadRequestError("User not found");
    }

    if (folderId && folder?.ownerId !== userId) {
      throw new BadRequestError("Folder not found");
    }

    const key = crypto.randomUUID();

    await this.storageService.upload(file.buffer, key, file.contentType);

    await prisma.file.create({
      data: {
        name: file.fileName,
        storageKey: key,
        mimeType: file.contentType,
        size: file.buffer.length,
        ownerId: userId,
        folderId: folderId || null,
      },
    });
  }

  async bulkUploadFolder({ metadata, files, ownerId }: BulkUploadFolderDTO) {
    const failedUploads: { fileName: string; error: string }[] = [];

    for (const file of files) {
      const folderId = metadata[file.fileName];

      if (!folderId) {
        failedUploads.push({
          fileName: file.fileName,
          error: "No folder ID found for this file",
        });
        continue;
      }

      try {
        const key = crypto.randomUUID();

        await this.storageService.upload(file.buffer, key, file.contentType);

        await prisma.file.create({
          data: {
            name: file.fileName,
            storageKey: key,
            mimeType: file.contentType,
            size: file.buffer.length,
            ownerId,
            folderId: folderId,
          },
        });
      } catch (error) {
        console.log(error);
        failedUploads.push({
          fileName: file.fileName,
          error: (error as Error).message,
        });
      }

      if (failedUploads.length > 0) {
        throw new BadRequestError(
          `Failed to upload the following files: ${failedUploads
            .map((f) => `${f.fileName}`)
            .join(", ")}`,
        );
      }
    }
  }

  async renameFile({
    fileId,
    newFileName,
    userId,
  }: RenameFileDTO): Promise<void> {
    const file = await prisma.file.findUnique({
      where: { id: fileId, ownerId: userId },
      select: { id: true },
    });

    if (!file) {
      throw new NotFoundError("File not found");
    }

    await prisma.file.update({
      where: { id: fileId },
      data: { name: newFileName },
    });
  }

  async deleteFiles(fileIds: string[], userId: number): Promise<void> {
    const files = await prisma.file.findMany({
      where: { id: { in: fileIds }, ownerId: userId },
      select: { id: true, storageKey: true },
    });

    for (const file of files) {
      await this.storageService.delete(file.storageKey);
    }

    await prisma.file.deleteMany({
      where: { id: { in: fileIds }, ownerId: userId },
    });
  }

  async getFile(fileId: string, userId: number) {
    const file = await prisma.file.findUnique({
      where: { id: fileId, ownerId: userId },
      select: {
        id: true,
        name: true,
        storageKey: true,
        mimeType: true,
        size: true,
        createdAt: true,
        visibility: true,
      },
    });

    if (!file) {
      throw new NotFoundError("File not found");
    }

    const fileBuffer = await this.storageService.download(file.storageKey);

    return {
      file: file,
      buffer: fileBuffer,
    };
  }

  async shareFile(fileId: string, userId: number) {
    const file = await prisma.file.findUnique({
      where: { id: fileId, ownerId: userId },
      select: {
        id: true,
        name: true,
        visibility: true,
        fileShare: {
          select: {
            token: true,
          },
        },
      },
    });

    if (!file) {
      throw new NotFoundError("File not found");
    }

    if (file.visibility === "PUBLIC") {
      return {
        shareUrl: buildShareUrl(file.fileShare!.token),
      };
    }

    const token = crypto.randomUUID();

    await prisma.$transaction([
      prisma.fileShare.create({
        data: {
          fileId: file.id,
          token,
        },
      }),
      prisma.file.update({
        where: { id: file.id },
        data: { visibility: "PUBLIC" },
      }),
    ]);

    return {
      shareUrl: buildShareUrl(token),
    };
  }

  async unshareFile(fileId: string, userId: number) {
    const file = await prisma.file.findUnique({
      where: { id: fileId, ownerId: userId },
      select: {
        id: true,
        name: true,
        visibility: true,
      },
    });

    if (!file) {
      throw new NotFoundError("File not found");
    }

    if (file.visibility === "PRIVATE") {
      throw new BadRequestError("File is already private");
    }

    await prisma.$transaction([
      prisma.fileShare.delete({
        where: { fileId: file.id },
      }),
      prisma.file.update({
        where: { id: file.id },
        data: { visibility: "PRIVATE" },
      }),
    ]);
  }

  async getSharedFile(token: string) {
    const fileShare = await prisma.fileShare.findUnique({
      where: { token },
      select: {
        fileId: true,
      },
    });

    if (!fileShare) {
      throw new NotFoundError("Shared file not found");
    }

    const file = await prisma.file.findUnique({
      where: { id: fileShare.fileId },
      select: {
        id: true,
        name: true,
        storageKey: true,
        mimeType: true,
        size: true,
        createdAt: true,
        visibility: true,
      },
    });

    if (!file) {
      throw new NotFoundError("File not found");
    }

    const fileBuffer = await this.storageService.download(file.storageKey);

    return {
      file: file,
      buffer: fileBuffer,
    };
  }

  async getAllSharedFiles(userId: number) {
    const sharedFiles = await prisma.file.findMany({
      where: { ownerId: userId, visibility: "PUBLIC" },
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
            createdAt: true,
          },
        },
      },
    });

    return sharedFiles.map(({ fileShare, ...file }) => ({
      ...file,
      viewUrl: `/files/${file.id}/view`,
      downloadUrl: `/files/${file.id}/download`,
      shareUrl: fileShare ? buildShareUrl(fileShare.token) : null,
      sharedAt: fileShare?.createdAt || null,
    }));
  }
}

export const fileService = new FileService();

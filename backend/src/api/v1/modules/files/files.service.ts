import BadRequestError from "../../../../common/errors/BadRequestError";
import NotFoundError from "../../../../common/errors/NotFoundError";
import { prisma } from "../../../../common/lib/prisma";
import type StorageService from "../storage/interfaces/StorageService";
import LocalStorageService from "../storage/services/LocalStorageService";
import crypto from "node:crypto";

class FileService {
  private readonly storageService: StorageService;

  constructor() {
    this.storageService = new LocalStorageService();
  }

  async uploadFiles({
    userId,
    folderId,
    files,
  }: {
    userId: number;
    folderId: string | null;
    files: { buffer: Buffer; fileName: string; contentType: string }[];
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

    let failedUploads: { fileName: string; error: string }[] = [];

    for (const file of files) {
      try {
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
      } catch (error) {
        console.log(error);
        failedUploads.push({
          fileName: file.fileName,
          error: (error as Error).message,
        });
      }
    }

    if (failedUploads.length > 0) {
      throw new BadRequestError(
        `Failed to upload the following files: ${failedUploads
          .map((f) => `${f.fileName}`)
          .join(", ")}`,
      );
    }
  }

  async renameFile(
    fileId: string,
    newName: string,
    userId: number,
  ): Promise<void> {
    const file = await prisma.file.findUnique({
      where: { id: fileId, ownerId: userId },
      select: { id: true },
    });

    if (!file) {
      throw new NotFoundError("File not found");
    }

    await prisma.file.update({
      where: { id: fileId },
      data: { name: newName },
    });
  }

  async deleteFiles(fileIds: string[], userId: number): Promise<void> {
    const deletes = await prisma.file.deleteMany({
      where: { id: { in: fileIds }, ownerId: userId },
    });

    if (deletes.count === 0) {
      throw new NotFoundError("Files not found");
    }
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
}

export const fileService = new FileService();

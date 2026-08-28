import crypto from "node:crypto";
import BadRequestError from "../../../../common/errors/BadRequestError";
import NotFoundError from "../../../../common/errors/NotFoundError";
import { prisma } from "../../../../common/lib/prisma";
import { buildShareUrl } from "../../../../common/lib/utils";
import S3StorageService from "../storage/services/S3StorageService";
import type { RenameFileDTO, UploadFileDTO } from "./files.dto";

class FileService {
  private readonly storageService;

  constructor() {
    this.storageService = new S3StorageService();
  }

  async uploadFile({
    ownerId,
    folderId,
    fileName,
    contentType,
    size,
  }: UploadFileDTO) {
    const user = await prisma.user.findUnique({
      where: { id: ownerId },
      select: { id: true },
    });

    const folder = folderId
      ? await prisma.folder.findUnique({
          where: { id: folderId, ownerId },
          select: { id: true, ownerId: true },
        })
      : null;

    if (!user) {
      throw new BadRequestError("User not found");
    }

    if (folderId && !folder) {
      throw new BadRequestError("Folder not found");
    }

    const key = crypto.randomUUID();

    const upload = await this.storageService.getUploadUrl(key, contentType);

    await prisma.file.create({
      data: {
        name: fileName,
        storageKey: key,
        mimeType: contentType,
        size: size,
        ownerId: ownerId,
        folderId: folderId || null,
      },
    });

    return upload;
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

    const downloadUrl = await this.storageService.getDownloadUrl(
      file.storageKey,
    );

    return {
      file: file,
      downloadUrl: downloadUrl,
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

    const downloadUrl = await this.storageService.getDownloadUrl(
      file.storageKey,
    );

    return {
      file: file,
      downloadUrl: downloadUrl,
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

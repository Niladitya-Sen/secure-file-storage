import NotFoundError from "../../../../common/errors/NotFoundError";
import { prisma } from "../../../../common/lib/prisma";
import type { CreateFolderDto, ListFolderContentsDto } from "./folders.dto";

class FolderService {
  async createFolder(data: CreateFolderDto): Promise<void> {
    await prisma.folder.create({
      data: {
        name: data.name,
        ownerId: data.ownerId,
      },
    });
  }

  async listFolderContents({ folderId, ownerId }: ListFolderContentsDto) {
    if (folderId) {
      const folder = await prisma.folder.findUnique({
        where: { id: folderId, ownerId },
        select: { id: true },
      });

      if (!folder) {
        throw new NotFoundError("Folder not found");
      }

      const [folders, files] = await prisma.$transaction([
        prisma.folder.findMany({
          where: { ownerId, parentFolderId: folderId },
          select: { id: true, name: true, createdAt: true },
        }),
        prisma.file.findMany({
          where: { ownerId, folderId: folderId },
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

      return { folders, files };
    }

    const files = await prisma.file.findMany({
      where: { ownerId, folderId: null },
      select: {
        id: true,
        name: true,
        mimeType: true,
        size: true,
        createdAt: true,
        visibility: true,
      },
    });

    return { folders: [], files };
  }
}

export const folderService = new FolderService();

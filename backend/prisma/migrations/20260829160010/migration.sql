-- CreateEnum
CREATE TYPE "FolderVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- AlterTable
ALTER TABLE "Folder" ADD COLUMN     "visibility" "FolderVisibility" NOT NULL DEFAULT 'PRIVATE';

-- CreateTable
CREATE TABLE "FolderShare" (
    "id" UUID NOT NULL,
    "folderId" UUID NOT NULL,
    "token" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "FolderShare_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FolderShare_folderId_key" ON "FolderShare"("folderId");

-- CreateIndex
CREATE UNIQUE INDEX "FolderShare_token_key" ON "FolderShare"("token");

-- CreateIndex
CREATE INDEX "FolderShare_token_idx" ON "FolderShare"("token");

-- AddForeignKey
ALTER TABLE "FolderShare" ADD CONSTRAINT "FolderShare_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

import z from "zod";

export const CreateFolderSchema = z.object({
  name: z.string().min(1, "Folder name is required"),
  parentFolderId: z.string().optional(),
});

export const BulkCreateFolderSchema = z.object({
  folderStructure: z.record(z.string(), z.any()),
  parentFolderId: z.string().optional(),
});

export const ListFolderContentsSchema = z.object({
  folderId: z.string().optional(),
});

export const RenameFolderSchema = z.object({
  folderId: z.string(),
  newFolderName: z.string().min(1, "New folder name is required"),
});

export const DeleteFolderSchema = z.object({
  folderId: z.string(),
});

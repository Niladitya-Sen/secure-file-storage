import z from "zod";

export const UploadFilesSchema = z.object({
  folderId: z.string().optional(),
});

export const BulkUploadFolderSchema = z.object({
  metadata: z
    .string()
    .transform((val) => JSON.parse(val) as Record<string, string>),
});

export const ViewFileSchema = z.object({
  fileId: z.string(),
});

export const RenameFileSchema = z.object({
  fileId: z.string(),
  newFileName: z.string(),
});

export const DeleteFileSchema = z.object({
  fileId: z.string(),
});

export const ShareFileSchema = z.object({
  fileId: z.string(),
});

export const ViewSharedFileSchema = z.object({
  token: z.string(),
});

import z from "zod";

export const UploadFilesSchema = z.object({
  folderId: z.string().optional(),
});

import z from "zod";

export const CreateFolderSchema = z.object({
  name: z.string().min(1, "Folder name is required"),
});

export const ListFolderContentsSchema = z.object({
  folderId: z.string().optional(),
});

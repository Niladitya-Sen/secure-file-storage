import z from "zod";
import type { RenameFileSchema, UploadFileSchema } from "./files.validator";

export type UploadFileDTO = WithOwnerId<z.infer<typeof UploadFileSchema>>;

export type RenameFileDTO = z.infer<typeof RenameFileSchema> & {
  userId: number;
};

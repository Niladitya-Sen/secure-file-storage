import z from "zod";
import type {
  BulkUploadFolderSchema,
  RenameFileSchema,
  UploadFilesSchema,
} from "./files.validator";

export type UploadFilesDTO = z.infer<typeof UploadFilesSchema>;

export type BulkUploadFolderDTO = z.infer<typeof BulkUploadFolderSchema> & {
  files: { buffer: Buffer; fileName: string; contentType: string }[];
  ownerId: number;
};

export type RenameFileDTO = z.infer<typeof RenameFileSchema> & {
  userId: number;
};

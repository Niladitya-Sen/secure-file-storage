import z from "zod";
import type {
  BulkUploadFolderSchema,
  UploadFilesSchema,
} from "./files.validator";

export type UploadFilesDTO = z.infer<typeof UploadFilesSchema>;

export type BulkUploadFolderDTO = z.infer<typeof BulkUploadFolderSchema> & {
  files: { buffer: Buffer; fileName: string; contentType: string }[];
  ownerId: number;
};

import z from "zod";
import type { UploadFilesSchema } from "./files.validator";

export type UploadFilesDTO = z.infer<typeof UploadFilesSchema>;

import z from "zod";
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from "./constants";

export const UploadFileSchema = z
  .object({
    folderId: z.string().optional(),
    fileName: z.string().min(1, "File name is required"),
    contentType: z.string().min(1, "Content type is required"),
    size: z.number().positive(),
  })
  .superRefine((data, ctx) => {
    if (data.size > MAX_FILE_SIZE) {
      ctx.addIssue({
        code: "custom",
        message: `File size exceeds the maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB.`,
      });

      return z.NEVER;
    }

    const fileExtension = data.fileName.split(".").pop()?.toLowerCase();
    const allowedTypes = fileExtension
      ? ALLOWED_FILE_TYPES[fileExtension]
      : undefined;

    if (!fileExtension) {
      ctx.addIssue({
        code: "custom",
        message: `File type .${fileExtension} is not allowed.`,
      });

      return z.NEVER;
    }

    if (!allowedTypes?.includes(data.contentType)) {
      ctx.addIssue({
        code: "custom",
        message: `File type ${data.contentType} is not allowed for .${fileExtension} files.`,
      });

      return z.NEVER;
    }
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

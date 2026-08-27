import { Router } from "express";
import multer from "multer";
import { validateRequest } from "../../../../common/middleware/validate-request";
import type { ValidatedRequest } from "../../../../common/types/validated-request";
import { fileService } from "./files.service";
import {
  BulkUploadFolderSchema,
  DeleteFileSchema,
  RenameFileSchema,
  ShareFileSchema,
  UploadFilesSchema,
  ViewFileSchema,
  ViewSharedFileSchema,
} from "./files.validator";
import validateJwt from "../../../../common/middleware/validate-jwt";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // Limit file size to 100MB
});

const filesController = Router();

filesController.post(
  "/upload",
  validateJwt,
  upload.any(),
  validateRequest({
    body: UploadFilesSchema,
  }),
  async (
    req: ValidatedRequest<undefined, undefined, typeof UploadFilesSchema>,
    res,
  ) => {
    const userId = req.user?.id!;
    const { folderId } = req.validatedBody!;

    const files = (req.files as Express.Multer.File[]).map((file) => ({
      buffer: file.buffer,
      fileName: file.originalname,
      contentType: file.mimetype,
    }));

    await fileService.uploadFiles({
      userId: userId,
      folderId: folderId ?? null,
      files: files,
    });

    return res.status(201).json({ message: "Files uploaded successfully" });
  },
);

filesController.post(
  "/bulk-folder",
  validateJwt,
  upload.any(),
  validateRequest({
    body: BulkUploadFolderSchema,
  }),
  async (
    req: ValidatedRequest<undefined, undefined, typeof BulkUploadFolderSchema>,
    res,
  ) => {
    const userId = req.user?.id!;
    const { metadata } = req.validatedBody!;

    const files = (req.files as Express.Multer.File[]).map((file) => ({
      buffer: file.buffer,
      fileName: file.originalname,
      contentType: file.mimetype,
    }));

    await fileService.bulkUploadFolder({
      metadata,
      files,
      ownerId: userId,
    });

    return res.status(201).json({ message: "Files uploaded successfully" });
  },
);

filesController.put(
  "/:fileId/rename",
  validateJwt,
  validateRequest({
    params: RenameFileSchema.pick({ fileId: true }),
    body: RenameFileSchema.pick({ newFileName: true }),
  }),
  async (
    req: ValidatedRequest<
      typeof RenameFileSchema,
      undefined,
      typeof RenameFileSchema
    >,
    res,
  ) => {
    const userId = req.user?.id!;
    const { newFileName } = req.validatedBody!;
    const { fileId } = req.validatedParams!;

    await fileService.renameFile({
      fileId,
      newFileName,
      userId,
    });

    return res.status(200).json({ message: "File renamed successfully" });
  },
);

filesController.delete(
  "/:fileId",
  validateJwt,
  validateRequest({ params: DeleteFileSchema }),
  async (
    req: ValidatedRequest<typeof DeleteFileSchema, undefined, undefined>,
    res,
  ) => {
    const { fileId } = req.validatedParams!;
    const userId = req.user?.id!;

    await fileService.deleteFiles([fileId], userId);

    return res.status(200).json({ message: "File deleted successfully" });
  },
);

filesController.get(
  "/:fileId/view",
  validateJwt,
  validateRequest({ params: ViewFileSchema }),
  async (
    req: ValidatedRequest<typeof ViewFileSchema, undefined, undefined>,
    res,
  ) => {
    const { fileId } = req.validatedParams!;
    const userId = req.user?.id!;

    const file = await fileService.getFile(fileId, userId);

    res.setHeader("Content-Type", file.file.mimeType);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${file.file.name}"`,
    );
    res.send(file.buffer);
  },
);

filesController.get(
  "/:fileId/download",
  validateJwt,
  validateRequest({ params: ViewFileSchema }),
  async (
    req: ValidatedRequest<typeof ViewFileSchema, undefined, undefined>,
    res,
  ) => {
    const { fileId } = req.validatedParams!;
    const userId = req.user?.id!;

    const file = await fileService.getFile(fileId, userId);

    res.setHeader("Content-Type", file.file.mimeType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${file.file.name}"`,
    );
    res.send(file.buffer);
  },
);

filesController.post(
  "/:fileId/share",
  validateJwt,
  validateRequest({ params: ShareFileSchema }),
  async (
    req: ValidatedRequest<typeof ShareFileSchema, undefined, undefined>,
    res,
  ) => {
    const { fileId } = req.validatedParams!;
    const userId = req.user?.id!;

    const result = await fileService.shareFile(fileId, userId);
    return res.status(200).json(result);
  },
);

filesController.post(
  "/:fileId/unshare",
  validateJwt,
  validateRequest({ params: ShareFileSchema }),
  async (
    req: ValidatedRequest<typeof ShareFileSchema, undefined, undefined>,
    res,
  ) => {
    const { fileId } = req.validatedParams!;
    const userId = req.user?.id!;

    await fileService.unshareFile(fileId, userId);
    return res.status(200).json({ message: "File unshared successfully" });
  },
);

// No authentication required for viewing shared files
filesController.get(
  "/:token/shared",
  validateRequest({ params: ViewSharedFileSchema }),
  async (
    req: ValidatedRequest<typeof ViewSharedFileSchema, undefined, undefined>,
    res,
  ) => {
    const { token } = req.validatedParams!;

    const { file, buffer } = await fileService.getSharedFile(token);

    res.setHeader("Content-Type", file.mimeType);
    res.setHeader("file-name", file.name);
    res.setHeader("Content-Disposition", `inline; filename="${file.name}"`);
    res.send(buffer);
  },
);

export { filesController };

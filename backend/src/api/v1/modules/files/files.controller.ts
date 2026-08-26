import { Router } from "express";
import multer from "multer";
import { validateRequest } from "../../../../common/middleware/validate-request";
import type { ValidatedRequest } from "../../../../common/types/validated-request";
import { fileService } from "./files.service";
import {
  BulkUploadFolderSchema,
  UploadFilesSchema,
  ViewFileSchema,
} from "./files.validator";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
});

const filesController = Router();

filesController.post(
  "/upload",
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

filesController.get(
  "/:fileId/view",
  validateRequest({ params: ViewFileSchema }),
  async (
    req: ValidatedRequest<typeof ViewFileSchema, undefined, undefined>,
    res,
  ) => {
    const { fileId } = req.validatedParams!;
    const userId = req.user?.id!;

    const file = await fileService.getFile(fileId, userId);

    console.log(file.file);

    res.setHeader("Content-Type", file.file.mimeType);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${file.file.name}"`,
    );
    res.send(file.buffer);
  },
);

export { filesController };

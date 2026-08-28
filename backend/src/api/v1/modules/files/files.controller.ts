import { Router } from "express";
import multer from "multer";
import { validateRequest } from "../../../../common/middleware/validate-request";
import type { ValidatedRequest } from "../../../../common/types/validated-request";
import { fileService } from "./files.service";
import {
  DeleteFileSchema,
  RenameFileSchema,
  ShareFileSchema,
  UploadFileSchema,
  ViewFileSchema,
  ViewSharedFileSchema,
} from "./files.validator";
import validateJwt from "../../../../common/middleware/validate-jwt";
import { serializeBigInt } from "../../../../common/lib/utils";

const filesController = Router();

filesController.post(
  "/upload",
  validateJwt,
  validateRequest({
    body: UploadFileSchema,
  }),
  async (
    req: ValidatedRequest<undefined, undefined, typeof UploadFileSchema>,
    res,
  ) => {
    const userId = req.user?.id!;
    const { folderId, fileName, contentType, size } = req.validatedBody!;

    const upload = await fileService.uploadFile({
      ownerId: userId,
      folderId: folderId,
      fileName,
      contentType,
      size,
    });

    return res.status(200).json(upload);
  },
);

filesController.get("/shared", validateJwt, async (req, res) => {
  const userId = req.user?.id!;

  const sharedFiles = await fileService.getAllSharedFiles(userId);

  return res.status(200).json(serializeBigInt(sharedFiles));
});

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

    return res.status(200).json(serializeBigInt(file));
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

    return res.status(200).json(serializeBigInt(file));
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

    const file = await fileService.getSharedFile(token);

    return res.status(200).json(serializeBigInt(file));
  },
);

export { filesController };

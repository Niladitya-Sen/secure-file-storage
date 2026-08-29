import { Router } from "express";
import { serializeBigInt } from "../../../../common/lib/utils.ts";
import validateJwt from "../../../../common/middleware/validate-jwt.ts";
import { validateRequest } from "../../../../common/middleware/validate-request.ts";
import type { ValidatedRequest } from "../../../../common/types/validated-request.ts";
import { folderService } from "./folders.service.ts";
import {
  BulkCreateFolderSchema,
  CreateFolderSchema,
  DeleteFolderSchema,
  ListFolderContentsSchema,
  RenameFolderSchema,
  ShareFolderSchema,
  ViewSharedFolderChildFileSchema,
  ViewSharedFolderChildrenSchema,
  ViewSharedFolderSchema,
} from "./folders.validator.ts";

const foldersController = Router();

foldersController.post(
  "/",
  validateJwt,
  validateRequest({
    body: CreateFolderSchema,
  }),
  async (
    req: ValidatedRequest<undefined, undefined, typeof CreateFolderSchema>,
    res,
  ) => {
    const { name, parentFolderId } = req.validatedBody!;
    await folderService.createFolder({
      name,
      parentFolderId,
      ownerId: req.user!.id,
    });
    return res.status(201).json({ message: "Folder created successfully" });
  },
);

foldersController.post(
  "/bulk",
  validateJwt,
  validateRequest({
    body: BulkCreateFolderSchema,
  }),
  async (
    req: ValidatedRequest<undefined, undefined, typeof BulkCreateFolderSchema>,
    res,
  ) => {
    const { folderStructure, parentFolderId } = req.validatedBody!;
    const folders = await folderService.bulkCreateFolders({
      folderStructure,
      parentFolderId,
      ownerId: req.user!.id,
    });
    return res
      .status(201)
      .json({ message: "Folders created successfully", folders });
  },
);

foldersController.get("/", validateJwt, async (req, res) => {
  const contents = await folderService.listFolderContents({
    folderId: undefined,
    ownerId: req.user!.id,
  });

  return res.status(200).json(serializeBigInt(contents));
});

foldersController.get("/shared", validateJwt, async (req, res) => {
  const contents = await folderService.listSharedFolders({
    ownerId: req.user!.id,
  });
  return res.status(200).json(serializeBigInt(contents));
});

foldersController.get(
  "/:folderId",
  validateJwt,
  validateRequest({
    params: ListFolderContentsSchema,
  }),
  async (
    req: ValidatedRequest<
      typeof ListFolderContentsSchema,
      undefined,
      undefined
    >,
    res,
  ) => {
    const { folderId } = req.validatedParams!;
    const contents = await folderService.listFolderContents({
      folderId,
      ownerId: req.user!.id,
    });

    return res.status(200).json(serializeBigInt(contents));
  },
);

foldersController.put(
  "/:folderId/rename",
  validateJwt,
  validateRequest({
    params: RenameFolderSchema.pick({ folderId: true }),
    body: RenameFolderSchema.pick({ newFolderName: true }),
  }),
  async (
    req: ValidatedRequest<
      typeof RenameFolderSchema,
      undefined,
      typeof RenameFolderSchema
    >,
    res,
  ) => {
    const { folderId } = req.validatedParams!;
    const { newFolderName } = req.validatedBody!;
    await folderService.renameFolder({
      folderId,
      newFolderName,
      ownerId: req.user!.id,
    });
    return res.status(200).json({ message: "Folder renamed successfully" });
  },
);

foldersController.delete(
  "/:folderId",
  validateJwt,
  validateRequest({
    params: DeleteFolderSchema,
  }),
  async (
    req: ValidatedRequest<typeof DeleteFolderSchema, undefined, undefined>,
    res,
  ) => {
    const { folderId } = req.validatedParams!;
    await folderService.deleteFolder({
      folderId,
      ownerId: req.user!.id,
    });
    return res.status(200).json({ message: "Folder deleted successfully" });
  },
);

foldersController.post(
  "/:folderId/share",
  validateJwt,
  validateRequest({
    params: ShareFolderSchema,
  }),
  async (
    req: ValidatedRequest<typeof ShareFolderSchema, undefined, undefined>,
    res,
  ) => {
    const { folderId } = req.validatedParams!;
    const userId = req.user!.id;
    const result = await folderService.shareFolder({
      folderId,
      ownerId: userId,
    });
    return res.status(200).json(result);
  },
);

foldersController.post(
  "/:folderId/unshare",
  validateJwt,
  validateRequest({
    params: ShareFolderSchema,
  }),
  async (
    req: ValidatedRequest<typeof ShareFolderSchema, undefined, undefined>,
    res,
  ) => {
    const { folderId } = req.validatedParams!;
    const userId = req.user!.id;
    await folderService.unshareFolder({
      folderId,
      ownerId: userId,
    });
    return res.status(200).json({ message: "Folder unshared successfully" });
  },
);

foldersController.get(
  "/:token/shared",
  validateRequest({
    params: ViewSharedFolderSchema,
  }),
  async (
    req: ValidatedRequest<typeof ViewSharedFolderSchema, undefined, undefined>,
    res,
  ) => {
    const { token } = req.validatedParams!;
    const result = await folderService.listSharedFolderContents({
      token,
      folderIds: [],
    });

    return res.status(200).json(serializeBigInt(result));
  },
);

foldersController.get(
  "/:token/shared/*folderIds/file/:fileId",
  validateRequest({
    params: ViewSharedFolderChildFileSchema,
  }),
  async (
    req: ValidatedRequest<
      typeof ViewSharedFolderChildFileSchema,
      undefined,
      undefined
    >,
    res,
  ) => {
    const { token, folderIds, fileId } = req.validatedParams!;
    const result = await folderService.viewSharedFolderChildFile({
      token,
      folderIds,
      fileId,
    });

    return res.status(200).json(serializeBigInt(result));
  },
);

foldersController.get(
  "/:token/shared/*folderIds",
  validateRequest({
    params: ViewSharedFolderChildrenSchema,
  }),
  async (
    req: ValidatedRequest<
      typeof ViewSharedFolderChildrenSchema,
      undefined,
      undefined
    >,
    res,
  ) => {
    const { token, folderIds } = req.validatedParams!;
    const result = await folderService.listSharedFolderContents({
      token,
      folderIds,
    });

    return res.status(200).json(serializeBigInt(result));
  },
);

export { foldersController };

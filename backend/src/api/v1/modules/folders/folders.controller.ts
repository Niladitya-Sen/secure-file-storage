import { Router } from "express";
import { validateRequest } from "../../../../common/middleware/validate-request";
import type { ValidatedRequest } from "../../../../common/types/validated-request";
import {
  BulkCreateFolderSchema,
  CreateFolderSchema,
  DeleteFolderSchema,
  ListFolderContentsSchema,
  RenameFolderSchema,
} from "./folders.validator";
import { folderService } from "./folders.service";
import { serializeBigInt } from "../../../../common/lib/utils";
import validateJwt from "../../../../common/middleware/validate-jwt";

const foldersController = Router();

foldersController.use(validateJwt);

foldersController.post(
  "/",
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

foldersController.get("/", async (req, res) => {
  const contents = await folderService.listFolderContents({
    folderId: undefined,
    ownerId: req.user!.id,
  });

  return res.status(200).json(serializeBigInt(contents));
});

foldersController.get(
  "/:folderId",
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

export { foldersController };

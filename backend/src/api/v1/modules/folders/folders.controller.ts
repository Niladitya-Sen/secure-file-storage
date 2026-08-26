import { Router } from "express";
import { validateRequest } from "../../../../common/middleware/validate-request";
import type { ValidatedRequest } from "../../../../common/types/validated-request";
import {
  BulkCreateFolderSchema,
  CreateFolderSchema,
  ListFolderContentsSchema,
} from "./folders.validator";
import { folderService } from "./folders.service";
import { serializeBigInt } from "../../../../common/lib/utils";

const foldersController = Router();

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

export { foldersController };

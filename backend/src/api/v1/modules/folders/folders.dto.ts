import z from "zod";
import type {
  BulkCreateFolderSchema,
  CreateFolderSchema,
  DeleteFolderSchema,
  ListFolderContentsSchema,
  RenameFolderSchema,
} from "./folders.validator";

export type CreateFolderDto = WithOwnerId<z.infer<typeof CreateFolderSchema>>;

export type ListFolderContentsDto = WithOwnerId<
  z.infer<typeof ListFolderContentsSchema>
>;

export type BulkCreateFolderDto = WithOwnerId<
  z.infer<typeof BulkCreateFolderSchema>
>;

export type RenameFolderDto = WithOwnerId<z.infer<typeof RenameFolderSchema>>;

export type DeleteFolderDto = WithOwnerId<z.infer<typeof DeleteFolderSchema>>;

import z from "zod";
import type {
  BulkCreateFolderSchema,
  CreateFolderSchema,
  DeleteFolderSchema,
  ListFolderContentsSchema,
  RenameFolderSchema,
  ShareFolderSchema,
  ViewSharedFolderChildFileSchema,
  ViewSharedFolderChildrenSchema,
} from "./folders.validator.ts";

export type CreateFolderDto = WithOwnerId<z.infer<typeof CreateFolderSchema>>;

export type ListFolderContentsDto = WithOwnerId<
  z.infer<typeof ListFolderContentsSchema>
>;

export type BulkCreateFolderDto = WithOwnerId<
  z.infer<typeof BulkCreateFolderSchema>
>;

export type RenameFolderDto = WithOwnerId<z.infer<typeof RenameFolderSchema>>;

export type DeleteFolderDto = WithOwnerId<z.infer<typeof DeleteFolderSchema>>;

export type ShareFolderDto = WithOwnerId<z.infer<typeof ShareFolderSchema>>;

export type ViewSharedFolderDto = z.infer<
  typeof ViewSharedFolderChildrenSchema
>;

export type ViewSharedFolderChildFileSchemaDto = z.infer<
  typeof ViewSharedFolderChildFileSchema
>;

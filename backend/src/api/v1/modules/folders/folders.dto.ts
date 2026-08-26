import z from "zod";
import type {
  BulkCreateFolderSchema,
  CreateFolderSchema,
  ListFolderContentsSchema,
} from "./folders.validator";

export type CreateFolderDto = z.infer<typeof CreateFolderSchema> & {
  ownerId: number;
};

export type ListFolderContentsDto = z.infer<typeof ListFolderContentsSchema> & {
  ownerId: number;
};

export type BulkCreateFolderDto = z.infer<typeof BulkCreateFolderSchema> & {
  ownerId: number;
};

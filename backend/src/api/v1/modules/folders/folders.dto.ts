import z from "zod";
import type {
  CreateFolderSchema,
  ListFolderContentsSchema,
} from "./folders.validator";

export type CreateFolderDto = z.infer<typeof CreateFolderSchema> & {
  ownerId: number;
};

export type ListFolderContentsDto = z.infer<typeof ListFolderContentsSchema> & {
  ownerId: number;
};

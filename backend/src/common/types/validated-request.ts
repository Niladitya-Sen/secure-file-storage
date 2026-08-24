import type { Request } from "express";
import z from "zod";

export type ValidatedRequest<
  Params extends z.ZodType | undefined,
  Query extends z.ZodType | undefined,
  Body extends z.ZodType | undefined,
> = Request & {
  validatedParams?: Params extends z.ZodType ? z.infer<Params> : never;
  validatedQuery?: Query extends z.ZodType ? z.infer<Query> : never;
  validatedBody?: Body extends z.ZodType ? z.infer<Body> : never;
};

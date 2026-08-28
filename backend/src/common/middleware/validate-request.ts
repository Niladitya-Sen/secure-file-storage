import type { Request, Response, NextFunction } from "express";
import z from "zod";
import BadRequestError from "../errors/BadRequestError";

type ValidateRequestParams = Partial<
  Record<"params" | "query" | "body", z.ZodType>
>;

export function validateRequest(params: ValidateRequestParams) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (params.params) {
      const result = params.params.safeParse(req.params);

      if (!result.success) {
        const firstIssue = result.error.issues[0];
        throw new BadRequestError(firstIssue.message);
      } else {
        (req as any).validatedParams = result.data;
      }
    }

    if (params.query) {
      const result = params.query.safeParse(req.query);

      if (!result.success) {
        const firstIssue = result.error.issues[0];
        throw new BadRequestError(firstIssue.message);
      } else {
        (req as any).validatedQuery = result.data;
      }
    }

    if (params.body) {
      const result = params.body.safeParse(req.body);

      if (!result.success) {
        const firstIssue = result.error.issues[0];
        throw new BadRequestError(firstIssue.message);
      } else {
        (req as any).validatedBody = result.data;
      }
    }

    next();
  };
}

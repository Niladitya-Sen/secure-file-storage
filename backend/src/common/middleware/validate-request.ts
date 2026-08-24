import type { Request, Response, NextFunction } from "express";
import z from "zod";

type ValidateRequestParams = Partial<
  Record<"params" | "query" | "body", z.ZodType>
>;

export function validateRequest(params: ValidateRequestParams) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (params.params) {
      const result = params.params.safeParse(req.params);

      if (!result.success) {
        return res.status(400).json({
          error: "Invalid request parameters",
          details: result.error.issues.map((issue) => ({
            path: issue.path,
            message: issue.message,
          })),
        });
      } else {
        (req as any).validatedParams = result.data;
      }
    }

    if (params.query) {
      const result = params.query.safeParse(req.query);

      if (!result.success) {
        return res.status(400).json({
          error: "Invalid request parameters",
          details: result.error.issues.map((issue) => ({
            path: issue.path,
            message: issue.message,
          })),
        });
      } else {
        (req as any).validatedQuery = result.data;
      }
    }

    if (params.body) {
      const result = params.body.safeParse(req.body);

      if (!result.success) {
        return res.status(400).json({
          error: "Invalid request parameters",
          details: result.error.issues.map((issue) => ({
            path: issue.path,
            message: issue.message,
          })),
        });
      } else {
        (req as any).validatedBody = result.data;
      }
    }

    next();
  };
}

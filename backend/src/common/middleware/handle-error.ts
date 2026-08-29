import type { Request, Response, NextFunction } from "express";
import ApplicationError from "../errors/ApplicationError.ts";
import { env } from "../../env.ts";
import dayjs from "dayjs";

export default function handleErrors(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (env.NODE_ENV === "development") {
    console.error(dayjs().format("YYYY-MM-DD HH:mm:ss A"), err);
  }

  if (err instanceof ApplicationError) {
    return res.status(err.getStatusCode()).json(err.toJSON());
  }

  return res.status(500).json({ message: "Internal Server Error" });
}

import type { Request, Response, NextFunction } from "express";
import ApplicationError from "../errors/ApplicationError";

export default function handleErrors(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof ApplicationError) {
    console.log(err.name, err.toJSON());
    return res.status(err.getStatusCode()).json(err.toJSON());
  }

  console.error("Unknown error:", err);
  return res.status(500).json({ message: "Internal Server Error" });
}

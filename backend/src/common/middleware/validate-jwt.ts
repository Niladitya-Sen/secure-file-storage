import type { NextFunction, Request, Response } from "express";
import { errors as joseErrors } from "jose";
import BadRequestError from "../errors/BadRequestError.ts";
import { verifyToken } from "../lib/jwt.ts";
import ApplicationError from "../errors/ApplicationError.ts";
import UnauthorizedAccessError from "../errors/UnauthorizedAccessError.ts";
import type { RequestUser } from "../types/express.ts";

export default async function validateJwt(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new BadRequestError("Authorization header is missing");
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    throw new BadRequestError("Token is missing");
  }

  try {
    const data = await verifyToken<RequestUser>(token);

    req.user = data;
    return next();
  } catch (error) {
    if (error instanceof ApplicationError) {
      throw error;
    }

    if (error instanceof joseErrors.JWTExpired) {
      throw new UnauthorizedAccessError("Token has expired");
    }

    if (error instanceof joseErrors.JWTInvalid) {
      throw new UnauthorizedAccessError("Invalid token");
    }

    throw new UnauthorizedAccessError("Failed to authenticate token");
  }
}

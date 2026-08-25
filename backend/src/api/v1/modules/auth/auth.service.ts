import BadRequestError from "../../../../common/errors/BadRequestError";
import { generateToken } from "../../../../common/lib/jwt";
import { prisma } from "../../../../common/lib/prisma";
import { env } from "../../../../env";
import type {
  LoginUserDto,
  RefreshTokenDto,
  RegisterUserDto,
} from "./auth.dto";
import argon from "argon2";
import crypto from "node:crypto";

class AuthService {
  async register({ email, password }: RegisterUserDto) {
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      throw new BadRequestError("User with this email already exists");
    }

    const passwordHash = await argon.hash(password);

    const newUser = await prisma.user.create({
      data: { email, passwordHash },
      select: { id: true, email: true },
    });

    const accessToken = await generateToken(
      {
        id: newUser.id,
      },
      env.ACCESS_TOKEN_MAX_AGE,
    );

    const refreshToken = await generateToken(
      {
        id: newUser.id,
      },
      env.REFRESH_TOKEN_MAX_AGE,
    );

    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken.token)
      .digest("hex");

    await prisma.refreshToken.create({
      data: {
        userId: newUser.id,
        token: refreshTokenHash,
        expiresAt: refreshToken.expiryTime,
      },
    });

    return {
      user: newUser,
      accessToken: accessToken.token,
      refreshToken: refreshToken.token,
    };
  }

  async login({ email, password }: LoginUserDto) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, passwordHash: true },
    });

    if (!user) {
      throw new BadRequestError("Invalid email or password");
    }

    const isPasswordValid = await argon.verify(user.passwordHash, password);

    if (!isPasswordValid) {
      throw new BadRequestError("Invalid email or password");
    }

    const accessToken = await generateToken(
      {
        id: user.id,
      },
      env.ACCESS_TOKEN_MAX_AGE,
    );

    const refreshToken = await generateToken(
      {
        id: user.id,
      },
      env.REFRESH_TOKEN_MAX_AGE,
    );

    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken.token)
      .digest("hex");

    await prisma.$transaction([
      prisma.refreshToken.deleteMany({ where: { userId: user.id } }),
      prisma.refreshToken.create({
        data: {
          userId: user.id,
          token: refreshTokenHash,
          expiresAt: refreshToken.expiryTime,
        },
      }),
    ]);

    return {
      user: { id: user.id, email: user.email },
      accessToken: accessToken.token,
      refreshToken: refreshToken.token,
    };
  }

  async refreshToken(data: RefreshTokenDto) {
    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(data.refreshToken)
      .digest("hex");

    const existingToken = await prisma.refreshToken.findUnique({
      where: { token: refreshTokenHash },
      select: { userId: true, expiresAt: true },
    });

    if (!existingToken) {
      throw new BadRequestError("Session not found. Please log in again.");
    }

    if (existingToken.expiresAt < new Date()) {
      throw new BadRequestError("Session expired. Please log in again.");
    }

    const accessToken = await generateToken(
      {
        id: existingToken.userId,
      },
      env.ACCESS_TOKEN_MAX_AGE,
    );

    const refreshToken = await generateToken(
      {
        id: existingToken.userId,
      },
      env.REFRESH_TOKEN_MAX_AGE,
    );

    const newRefreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken.token)
      .digest("hex");

    await prisma.refreshToken.update({
      where: { token: refreshTokenHash },
      data: {
        token: newRefreshTokenHash,
        expiresAt: refreshToken.expiryTime,
      },
    });

    return {
      accessToken: accessToken.token,
      refreshToken: refreshToken.token,
    };
  }

  async logout(data: RefreshTokenDto) {
    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(data.refreshToken)
      .digest("hex");

    const deletedToken = await prisma.refreshToken.deleteMany({
      where: { token: refreshTokenHash },
    });

    if (deletedToken.count === 0) {
      throw new BadRequestError("Session not found. Please log in again.");
    }
  }

  async getUserById(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });

    if (!user) {
      throw new BadRequestError("User not found");
    }

    return { user };
  }
}

export const authService = new AuthService();

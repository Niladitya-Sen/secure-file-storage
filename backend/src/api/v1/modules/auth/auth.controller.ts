import { Router } from "express";
import { validateRequest } from "../../../../common/middleware/validate-request";
import { LoginUserSchema, RegisterUserSchema } from "./auth.validator";
import type { ValidatedRequest } from "../../../../common/types/validated-request";
import { authService } from "./auth.service";
import validateJwt from "../../../../common/middleware/validate-jwt";
import { env } from "../../../../env";

const authController = Router();

authController.post(
  "/signup",
  validateRequest({ body: RegisterUserSchema }),
  async (
    req: ValidatedRequest<undefined, undefined, typeof RegisterUserSchema>,
    res,
  ) => {
    const { email, password } = req.validatedBody!;
    const { refreshToken, ...result } = await authService.register({
      email,
      password,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV !== "development",
      sameSite: "strict",
      maxAge: env.REFRESH_TOKEN_MAX_AGE,
    });
    return res.status(201).json(result);
  },
);

authController.post(
  "/login",
  validateRequest({ body: LoginUserSchema }),
  async (
    req: ValidatedRequest<undefined, undefined, typeof LoginUserSchema>,
    res,
  ) => {
    const { email, password } = req.validatedBody!;
    const { refreshToken, ...result } = await authService.login({
      email,
      password,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV !== "development",
      sameSite: "strict",
      maxAge: env.REFRESH_TOKEN_MAX_AGE,
    });
    return res.status(200).json(result);
  },
);

authController.get("/me", validateJwt, async (req, res) => {
  const userId = req.user!.id;
  const user = await authService.getUserById(userId);
  return res.status(200).json(user);
});

authController.post("/logout", validateJwt, async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token is required" });
  }

  await authService.logout(refreshToken);
  res.clearCookie("refreshToken");
  return res.status(200).json({ message: "Logged out successfully" });
});

authController.post("/refresh-token", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  console.log(refreshToken);

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token is required" });
  }

  const { accessToken, refreshToken: newRefreshToken } =
    await authService.refreshToken({ refreshToken });

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV !== "development",
    sameSite: "strict",
    maxAge: env.REFRESH_TOKEN_MAX_AGE,
  });

  return res.status(200).json({ accessToken });
});

export { authController };

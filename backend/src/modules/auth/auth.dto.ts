import type z from "zod";
import type {
  LoginUserSchema,
  RefreshTokenSchema,
  RegisterUserSchema,
} from "./auth.validator";

export type RegisterUserDto = z.infer<typeof RegisterUserSchema>;
export type LoginUserDto = z.infer<typeof LoginUserSchema>;
export type RefreshTokenDto = z.infer<typeof RefreshTokenSchema>;

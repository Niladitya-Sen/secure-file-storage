import z from "zod";

const envSchema = z.object({
  PORT: z.string().default("3000"),
  FRONTEND_URL: z.url(),
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  JWT_ALGORITHM: z.string(),
  ACCESS_TOKEN_MAX_AGE: z.preprocess(Number, z.number()),
  REFRESH_TOKEN_MAX_AGE: z.preprocess(Number, z.number()),
});

export const env = envSchema.parse(process.env);

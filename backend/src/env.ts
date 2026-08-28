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
  AWS_REGION: z.string(),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  AWS_S3_BUCKET: z.string(),
});

export const env = envSchema.parse(process.env);

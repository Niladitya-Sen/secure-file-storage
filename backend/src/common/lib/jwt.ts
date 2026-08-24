import { env } from "../../env.js";
import dayjs from "dayjs";
import { SignJWT, type JWTPayload, jwtVerify } from "jose";

export async function generateToken(payload: JWTPayload, expiry_ms: number) {
  const secret = new TextEncoder().encode(env.JWT_SECRET);
  const expiryTime = dayjs().add(expiry_ms, "milliseconds").toDate();

  const token = await new SignJWT(payload)
    .setProtectedHeader({
      alg: env.JWT_ALGORITHM,
    })
    .setExpirationTime(expiryTime)
    .sign(secret);

  return { token, expiryTime };
}

export async function verifyToken<T>(token: string) {
  const secret = new TextEncoder().encode(env.JWT_SECRET);
  const { payload } = await jwtVerify(token, secret, {
    algorithms: [env.JWT_ALGORITHM],
  });
  return payload as T;
}

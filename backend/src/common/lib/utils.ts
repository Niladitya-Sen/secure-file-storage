import { env } from "../../env";

export function serializeBigInt<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_, value) =>
      typeof value === "bigint" ? value.toString() : value,
    ),
  );
}

export function buildShareUrl(token: string): string {
  return `${env.FRONTEND_URL}/share/${token}`;
}

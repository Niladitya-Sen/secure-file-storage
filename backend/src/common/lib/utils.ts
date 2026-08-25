export function serializeBigInt<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_, value) =>
      typeof value === "bigint" ? value.toString() : value,
    ),
  );
}
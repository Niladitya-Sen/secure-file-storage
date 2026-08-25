import { env } from "@/env";
import { useAuth } from "@/store/auth-store";

export default async function authFetch<T>(
  uri: string,
  options: RequestInit,
): Promise<[T | null, null | Record<string, any>]> {
  const accessToken = useAuth.getState().accessToken;

  const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${uri}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: "include", // Include cookies in the request
  });

  if (response.status === 401) {
    const success = await useAuth.getState().refreshToken();
    if (success) {
      return authFetch(uri, options);
    } else {
      return [null, { message: "Unauthorized" }];
    }
  }

  if (!response.ok) {
    const errorData = await response.json();
    return [null, errorData];
  }

  const data = await response.json();

  return [data as T, null];
}

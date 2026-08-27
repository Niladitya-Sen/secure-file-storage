import { env } from "@/env";
import { useAuth } from "@/store/auth-store";

export default async function authFetch<T>(
  uri: string,
  options?: RequestInit,
): Promise<[T | null, null | Record<string, any>]> {
  const accessToken = useAuth.getState().accessToken;

  const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${uri}`, {
    ...options,
    headers: {
      ...options?.headers,
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: "include", // Include cookies in the request
  });

  if (response.status === 401) {
    const success = await useAuth.getState().refreshToken();

    if (success === null) {
      return [
        null,
        { code: "REFRESH_IN_PROGRESS", message: "Refresh in progress" },
      ];
    }

    if (success) {
      return authFetch(uri, options);
    } else {
      if (!window.location.pathname.startsWith("/auth")) {
        window.location.href = "/auth/login";
      }
      return [null, { code: "REFRESH_FAILED", message: "Unauthorized" }];
    }
  }

  if (!response.ok) {
    const errorData = await response.json();
    return [null, errorData];
  }

  const data = await response.json();

  return [data as T, null];
}

export async function authFetchBlob(
  uri: string,
  options?: RequestInit,
): Promise<[Blob | null, null | Record<string, any>]> {
  const accessToken = useAuth.getState().accessToken;

  const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${uri}`, {
    ...options,
    headers: {
      ...options?.headers,
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: "include", // Include cookies in the request
  });

  if (response.status === 401) {
    const success = await useAuth.getState().refreshToken();

    if (success === null) {
      return [
        null,
        { code: "REFRESH_IN_PROGRESS", message: "Refresh in progress" },
      ];
    }

    if (success) {
      return authFetchBlob(uri, options);
    } else {
      if (!window.location.pathname.startsWith("/auth")) {
        window.location.href = "/auth/login";
      }
      return [null, { code: "REFRESH_FAILED", message: "Unauthorized" }];
    }
  }

  if (!response.ok) {
    const errorData = await response.json();
    return [null, errorData];
  }

  const data = await response.blob();

  return [data as Blob, null];
}

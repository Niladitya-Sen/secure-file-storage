import { env } from "@/env";
import { useAuth } from "@/store/auth-store";

export default async function authFetch<T>(
  uri: string,
  options?: RequestInit,
): Promise<[T, null] | [null, Error]> {
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
      return [null, new Error("Refresh in progress. Please try again later.")];
    }

    if (success) {
      return authFetch(uri, options);
    } else {
      if (!window.location.pathname.startsWith("/auth")) {
        window.location.href = "/auth/login";
      }
      return [null, new Error("Refresh failed. Please try again later.")];
    }
  }

  if (!response.ok) {
    const errorData = await response.json();
    return [
      null,
      new Error(errorData.message || "An error occurred during the request."),
    ];
  }

  const data = await response.json();

  return [data as T, null];
}
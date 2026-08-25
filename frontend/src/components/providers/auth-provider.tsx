"use client";

import { useAuth } from "@/store/auth-store";
import React, { useEffect } from "react";

export default function AuthProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const getCurrentUser = useAuth((state) => state.getCurrentUser);
  const user = useAuth((state) => state.user);
  const isAuthLoading = useAuth((state) => state.isAuthLoading);

  useEffect(() => {
    if (!user) {
      getCurrentUser();
    }
  }, [getCurrentUser, user]);

  if (isAuthLoading || !user) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}

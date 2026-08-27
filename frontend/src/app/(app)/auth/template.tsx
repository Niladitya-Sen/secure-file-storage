"use client";

import { useAuth } from "@/store/auth-store";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

export default function AuthTemplate({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const getCurrentUser = useAuth((state) => state.getCurrentUser);
  const user = useAuth((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      getCurrentUser();
    } else {
      router.replace("/drive");
    }
  }, [getCurrentUser, user]);

  return <>{children}</>;
}

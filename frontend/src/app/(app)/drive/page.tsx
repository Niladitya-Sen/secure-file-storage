"use client";

import FolderView from "@/components/drive/folder-view";
import { toast } from "@/components/ui/toast";
import authFetch from "@/lib/auth-fetch";
import { useAuth } from "@/store/auth-store";
import { useQuery } from "@tanstack/react-query";
import { th } from "date-fns/locale";
import React from "react";

export default function DrivePage() {
  const user = useAuth((state) => state.user);

  const {
    data: folderContents,
    isFetching,
    error,
  } = useQuery({
    queryKey: ["root-folder"],
    queryFn: async () => {
      const [data, error] = await authFetch<FolderContents>("/folders", {
        method: "GET",
      });

      console.log(data, error);

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
  });

  return (
    <div className="px-6 py-4">
      {isFetching && <p>Loading...</p>}
      {error && <p>Error: {(error as Error).message}</p>}
      {folderContents && <FolderView {...folderContents} />}
    </div>
  );
}

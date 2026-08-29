"use client";

import ShareFolderView from "@/components/share/share-folder-view";
import { Spinner } from "@/components/ui/spinner";
import { env } from "@/env";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { useParams } from "next/navigation";

export default function FolderPage() {
  const params = useParams();

  const folderIds =
    typeof params.folderIds === "string"
      ? [params.folderIds]
      : params.folderIds;

  const { data, isLoading, error } = useQuery({
    queryKey: ["shared-folder-contents", params.token, { folderIds }],
    queryFn: async () => {
      const response = await fetch(
        `${env.NEXT_PUBLIC_API_URL}/folders/${params.token}/shared/${folderIds ? folderIds.join("/") : ""}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch shared folder contents",
        );
      }

      return data as FolderContents;
    },
  });

  if (isLoading) {
    return (
      <div className="h-dvh flex items-center justify-center">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="h-dvh flex flex-col gap-2 text-lg items-center justify-center">
        <AlertCircle size={24} />
        Error: {error?.message || "Failed to fetch shared folder contents"}
      </div>
    );
  }

  return (
    <main className="max-h-dvh h-dvh flex flex-col p-4 bg-popover">
      <ShareFolderView
        files={data.files}
        folders={data.folders}
        path={data.path}
      />
    </main>
  );
}

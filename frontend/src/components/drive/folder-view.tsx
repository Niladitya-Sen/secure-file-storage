"use client";

import authFetch from "@/lib/auth-fetch";
import { cn } from "@/lib/utils";
import { useDrive } from "@/store/drive-store";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useEffect } from "react";
import { Spinner } from "../ui/spinner";
import FileCard from "./cards/file-card";
import FolderCard from "./cards/folder-card";
import Navbar from "./navbar";
import UploadsProgressViewer from "./uploads-progress-viewer";

export default function FolderView({
  folderId,
}: Readonly<{ folderId?: string }>) {
  const setCurrentFolderId = useDrive((state) => state.setCurrentFolderId);

  useEffect(() => {
    if (folderId) {
      setCurrentFolderId(folderId);
    } else {
      setCurrentFolderId(null);
    }
  }, [folderId, setCurrentFolderId]);

  const {
    data: folderContents,
    isLoading,
    error,
  } = useQuery({
    queryKey: folderId ? ["folder", folderId] : ["folder"],
    queryFn: async () => {
      const [data, error] = await authFetch<FolderContents>(
        "/folders" + (folderId ? `/${folderId}` : ""),
        {
          method: "GET",
        },
      );

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
  });

  return (
    <div className="flex flex-1 flex-col relative overflow-hidden">
      <Navbar path={folderContents?.path || []} />
      {(() => {
        if (isLoading) {
          return (
            <div className="flex flex-1 items-center justify-center">
              <Spinner className="size-10" />
            </div>
          );
        }

        if (error) {
          return (
            <div className="flex flex-1 items-center justify-center">
              <p>Error: {(error as Error).message}</p>
            </div>
          );
        }

        return (
          <div className="px-6 py-4 flex flex-col flex-1 overflow-y-auto">
            {folderContents && (
              <div
                className={cn(
                  "flex flex-col flex-1 gap-6",
                  folderContents.files.length === 0 &&
                    folderContents.folders.length === 0 &&
                    "items-center justify-center",
                )}
              >
                {folderContents.files.length === 0 &&
                  folderContents.folders.length === 0 && (
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Image
                        src="/assets/icons/file/empty-folder.png"
                        alt="Empty folder"
                        width={100}
                        height={100}
                      />
                      <p className="text-center font-medium text-muted-foreground max-w-sm">
                        This folder is empty. Upload files or create new folders
                        to get started.
                      </p>
                    </div>
                  )}

                {folderContents.folders.length > 0 && (
                  <div className="flex flex-row flex-wrap gap-4">
                    {folderContents.folders.map((folder) => (
                      <FolderCard key={folder.id} {...folder} />
                    ))}
                  </div>
                )}
                {folderContents.files.length > 0 && (
                  <div className="flex flex-row flex-wrap gap-4">
                    {folderContents.files.map((file) => (
                      <FileCard key={file.id} {...file} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })()}
      <UploadsProgressViewer />
    </div>
  );
}

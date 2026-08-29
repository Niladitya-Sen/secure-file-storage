"use client";

import authFetch from "@/lib/auth-fetch";
import { cn } from "@/lib/utils";
import { useDrive } from "@/store/drive-store";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useEffect } from "react";
import { Spinner } from "../ui/spinner";
import FileCard from "./cards/file-card";
import FolderCard from "./cards/folder-card";
import Navbar from "./navbar";
import UploadsProgressViewer from "./uploads-progress-viewer";
import { useDropzone } from "react-dropzone";
import { uploadFiles } from "@/actions/file-actions";

export default function FolderView({
  folderId,
}: Readonly<{ folderId?: string }>) {
  const setCurrentFolderId = useDrive((state) => state.setCurrentFolderId);
  const queryClient = useQueryClient();

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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      uploadFiles({
        files: acceptedFiles,
        folderId: folderId,
        onConcurrentUploadComplete: () => {
          queryClient.invalidateQueries({
            queryKey: folderId ? ["folder", folderId] : ["folder"],
          });
        },
      });
    },
    multiple: true,
    noClick:
      folderContents?.files.length !== 0 ||
      folderContents?.folders.length !== 0,
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
          <div
            {...getRootProps()}
            className="px-6 py-4 flex flex-col flex-1 overflow-y-auto"
          >
            <input {...getInputProps()} />
            {isDragActive && (
              <div className="absolute inset-0 bg-black/70 z-10 flex flex-col items-center justify-center">
                <Image
                  src={"/assets/icons/dropzone.png"}
                  alt="dropzone"
                  width={250}
                  height={250}
                />
                <p className="text-white text-lg font-medium max-w-xs mx-auto text-center">
                  Drop files here to upload them to this folder
                </p>
              </div>
            )}
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
                      <p className="text-center font-medium text-muted-foreground max-w-sm select-none pointer-events-none">
                        This folder is empty. Click to upload files or Drag and drop files into this
                        folder or create a new folder to get started.
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

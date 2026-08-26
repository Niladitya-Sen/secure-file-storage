"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { authFetchBlob } from "@/lib/auth-fetch";
import { mimeTypeToIcon } from "@/lib/utils";
import { useDrive } from "@/store/drive-store";
import { useQuery } from "@tanstack/react-query";
import { FileWarning } from "lucide-react";
import Image from "next/image";

export default function PreviewDialog() {
  const isPreviewDialogOpen = useDrive((state) => state.isPreviewDialogOpen);
  const closePreviewDialog = useDrive((state) => state.closePreviewDialog);
  const previewFile = useDrive((state) => state.previewFile);

  const { data, isFetching, error } = useQuery({
    queryKey: ["file", previewFile?.id],
    queryFn: async () => {
      if (!previewFile) {
        throw new Error("No file selected");
      }

      const [data, error] = await authFetchBlob(previewFile.url);

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("No data received");
      }

      const blobUrl = URL.createObjectURL(data);

      return { blobUrl };
    },
    enabled: !!previewFile,
  });

  if (!previewFile) {
    return null;
  }

  return (
    <Dialog
      open={isPreviewDialogOpen}
      onOpenChange={(val) => {
        if (!val) {
          closePreviewDialog();
        }
      }}
    >
      <DialogContent
        className={
          "sm:max-w-dvw h-dvh rounded-none bg-black/80 grid grid-rows-[auto_1fr]"
        }
      >
        <DialogHeader>
          <DialogTitle className={"text-lg font-semibold"}>
            <div className="flex flex-row items-center gap-4 justify-start">
              <Image
                src={mimeTypeToIcon(previewFile.mimeType)}
                width={32}
                height={32}
                alt={previewFile.mimeType}
              />
              {previewFile.name}
            </div>
          </DialogTitle>
          <DialogDescription className={"sr-only"}>
            Viewing {previewFile.name}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col flex-2 items-center justify-center overflow-y-auto">
          {isFetching && <p>Loading...</p>}
          {data && (
            <ViewFile mimeType={previewFile.mimeType} url={data.blobUrl} />
          )}
          {error && <p>Error occurred while fetching the file.</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ViewFile({
  mimeType,
  url,
}: Readonly<{ mimeType: string; url: string }>) {
  if (mimeType.startsWith("image/")) {
    return (
      <div className="relative w-full h-full">
        <Image src={url} alt="Preview" fill className="object-contain" />
      </div>
    );
  } else if (mimeType.startsWith("video/")) {
    return <video src={url} controls width={800} height={600} />;
  } else if (mimeType.startsWith("audio/")) {
    return <audio src={url} controls />;
  } else if (mimeType === "application/pdf") {
    return <iframe title="pdf-viewer" src={url} className="w-full h-full" />;
  } else if (mimeType.startsWith("text/")) {
    return <iframe title="text-viewer" src={url} width={800} height={600} />;
  } else if (
    mimeType === "application/msword" ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return <iframe title="word-viewer" src={url} width={800} height={600} />;
  } else if (
    mimeType === "application/vnd.ms-excel" ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    return <iframe title="excel-viewer" src={url} width={800} height={600} />;
  } else if (
    mimeType === "application/vnd.ms-powerpoint" ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  ) {
    return (
      <iframe title="powerpoint-viewer" src={url} width={800} height={600} />
    );
  } else {
    return (
      <div className="w-full h-full text-center text-xl">
        <FileWarning className="mx-auto mb-4" size={48} />
        Preview not available for this file type.
      </div>
    );
  }
}

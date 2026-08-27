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
import Image from "next/image";
import ViewFile from "../view-file";

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

      const [data, error] = await authFetchBlob(previewFile.viewUrl);

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
          "sm:max-w-dvw h-dvh rounded-none bg-black/80 grid grid-rows-[auto_1fr] dark"
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

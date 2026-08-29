"use client";

import { env } from "@/env";
import { mimeTypeToIcon } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import ViewFile from "../drive/view-file";
import { useParams } from "next/navigation";

type SharePreviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileToPreview: File_ | null;
};

export default function SharePreviewDialog({
  open,
  onOpenChange,
  fileToPreview,
}: Readonly<SharePreviewDialogProps>) {
  const params = useParams();

  const { data, isFetching, error } = useQuery({
    queryKey: ["share-file", fileToPreview?.id],
    queryFn: async () => {
      if (!fileToPreview) {
        throw new Error("No file selected");
      }

      const response = await fetch(
        `${env.NEXT_PUBLIC_API_URL}/folders/${params.token}/shared/${fileToPreview.viewUrl}`,
      );

      if (!response.ok) {
        const err = await response.json();

        throw new Error(err.message || "Failed to fetch file preview");
      }

      const data = (await response.json()) as {
        file: File_;
        downloadUrl: string;
      };

      if (!data) {
        throw new Error("No data received");
      }

      return { url: data.downloadUrl };
    },
    enabled: !!fileToPreview,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  if (!fileToPreview) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={
          "sm:max-w-dvw h-dvh rounded-none bg-black/80 grid grid-rows-[auto_1fr] dark"
        }
      >
        <DialogHeader>
          <DialogTitle className={"text-lg font-semibold"}>
            <div className="flex flex-row items-center gap-4 justify-start">
              <Image
                src={mimeTypeToIcon(fileToPreview.mimeType)}
                width={32}
                height={32}
                alt={fileToPreview.mimeType}
              />
              {fileToPreview.name}
            </div>
          </DialogTitle>
          <DialogDescription className={"sr-only"}>
            Viewing {fileToPreview.name}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col flex-2 items-center justify-center overflow-y-auto">
          {isFetching && <p>Loading...</p>}
          {data && (
            <ViewFile mimeType={fileToPreview.mimeType} url={data.url} />
          )}
          {error && <p>Error occurred while fetching the file.</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}

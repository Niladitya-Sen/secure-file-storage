"use client";

import ViewFile from "@/components/drive/view-file";
import { Spinner } from "@/components/ui/spinner";
import { env } from "@/env";
import { mimeTypeToIcon } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";

export default function SharedWithMe() {
  const params = useParams();
  const token = params.token;

  const { data, isFetching, error } = useQuery({
    queryKey: ["shared-file", token],
    queryFn: async () => {
      const response = await fetch(
        `${env.NEXT_PUBLIC_API_URL}/files/${token}/shared`,
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to fetch shared file");
      }

      const data: {
        file: File_;
        downloadUrl: string;
      } = await response.json();

      return {
        downloadUrl: data.downloadUrl,
        contentType: data.file.mimeType,
        fileName: data.file.name,
      };
    },
    retry: false,
    enabled: !!token,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  if (isFetching) {
    return (
      <div className="h-dvh flex items-center justify-center">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="h-dvh flex flex-col gap-2 text-lg items-center justify-center">
        <AlertCircle />
        Error loading file: {(error as Error).message}
      </div>
    );
  }

  return (
    <main className="max-h-dvh h-dvh flex flex-col p-6">
      <div className="flex flex-row items-center gap-4 justify-start">
        <Image
          src={mimeTypeToIcon(data?.contentType || "")}
          width={32}
          height={32}
          alt={data?.contentType || "file icon"}
        />
        {data?.fileName}
      </div>
      <div className="flex flex-1 mt-4">
        <ViewFile mimeType={data?.contentType || ""} url={data?.downloadUrl} />
      </div>
    </main>
  );
}

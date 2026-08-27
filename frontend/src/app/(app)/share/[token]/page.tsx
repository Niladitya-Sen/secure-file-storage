"use client";

import ViewFile from "@/components/drive/view-file";
import { env } from "@/env";
import { mimeTypeToIcon } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
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

      const contentType = response.headers.get("Content-Type");
      const fileName = response.headers.get("file-name");

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to fetch shared file");
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      return { blobUrl, contentType, fileName };
    },
    retry: false,
    enabled: !!token,
  });

  if (isFetching) {
    return <div>Loading file...</div>;
  }

  if (error) {
    return <div>Error loading file: {(error as Error).message}</div>;
  }

  if (!data) {
    return <div>No file data available</div>;
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
      <div className="flex flex-1">
        <ViewFile mimeType={data?.contentType || ""} url={data?.blobUrl} />
      </div>
    </main>
  );
}

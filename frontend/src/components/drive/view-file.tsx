import { cn } from "@/lib/utils";
import { FileWarning } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Spinner } from "../ui/spinner";

export default function ViewFile({
  mimeType,
  url,
}: Readonly<{ mimeType: string; url: string }>) {
  if (mimeType.startsWith("image/")) {
    return (() => {
      const [isLoading, setIsLoading] = useState(true);

      return (
        <div className="relative w-full h-full">
          <Image
            src={url}
            alt="Preview"
            fill
            className={cn(
              "object-contain transition-opacity",
              isLoading && "opacity-0 z-0",
            )}
            onLoad={() => setIsLoading(false)}
          />
          <Spinner
            className={cn(
              "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-8",
              !isLoading && "hidden",
            )}
          />
        </div>
      );
    })();
  } else if (mimeType.startsWith("video/")) {
    return <video src={url} controls className="object-contain" />;
  } else if (mimeType.startsWith("audio/")) {
    return <audio src={url} controls />;
  } else if (mimeType === "application/pdf") {
    return <iframe title="pdf-viewer" src={url} className="w-full h-full" />;
  } else if (mimeType.startsWith("text/") || mimeType === "application/json") {
    return (() => {
      const [text, setText] = useState<string | null>(null);

      useEffect(() => {
        fetch(url)
          .then((response) => response.text())
          .then((data) => setText(data))
          .catch((error) => {
            setText("Error loading file.");
          });
      }, [url]);

      return (
        <div className="w-full h-full overflow-auto p-4 bg-card text-foreground">
          <pre className="whitespace-pre-wrap wrap-break-word">{text}</pre>
        </div>
      );
    })();
  } // word
  else if (
    mimeType === "application/msword" ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return (
      <iframe
        title="word-viewer"
        src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`}
        className="w-full h-full"
      />
    );
  } // excel
  else if (
    mimeType === "application/vnd.ms-excel" ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    return (
      <iframe
        title="excel-viewer"
        src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`}
        className="w-full h-full"
      />
    );
  } // powerpoint
  else if (
    mimeType === "application/vnd.ms-powerpoint" ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  ) {
    return (
      <iframe
        title="powerpoint-viewer"
        src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`}
        className="w-full h-full"
      />
    );
  } else {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center text-xl">
        <FileWarning className="mx-auto mb-4" size={48} />
        Preview not available for this file type.
      </div>
    );
  }
}

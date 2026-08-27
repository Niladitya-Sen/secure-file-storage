import { FileWarning } from "lucide-react";
import Image from "next/image";

export default function ViewFile({
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
    return <video src={url} controls className="object-contain" />;
  } else if (mimeType.startsWith("audio/")) {
    return <audio src={url} controls />;
  } else if (mimeType === "application/pdf") {
    return <iframe title="pdf-viewer" src={url} className="w-full h-full" />;
  } else {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center text-xl">
        <FileWarning className="mx-auto mb-4" size={48} />
        Preview not available for this file type.
      </div>
    );
  }
}

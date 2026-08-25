import {
  Copy,
  Download,
  Edit3,
  EllipsisVertical,
  ExternalLink,
  Eye,
  Folder,
  Share2,
  Trash2,
} from "lucide-react";
import { Button } from "../ui/button";
import Image from "next/image";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function mimeTypeToIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) {
    return "/assets/icons/file/image.png";
  } else if (mimeType.startsWith("video/")) {
    return "/assets/icons/file/video.png";
  } else if (mimeType.startsWith("audio/")) {
    return "/assets/icons/file/audio.png";
  } else if (mimeType === "application/pdf") {
    return "/assets/icons/file/pdf.png";
  } else if (
    mimeType === "application/msword" ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return "/assets/icons/file/word.png";
  } else if (
    mimeType === "application/vnd.ms-excel" ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    return "/assets/icons/file/excel.png";
  } else if (
    mimeType === "application/vnd.ms-powerpoint" ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  ) {
    return "/assets/icons/file/powerpoint.png";
  } else {
    return "/assets/icons/file/file.png";
  }
}

export default function FolderView({
  folders,
  files,
}: Readonly<FolderContents>) {
  return (
    <div className="flex flex-col flex-1 gap-6">
      {folders.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
          {folders.map((folder) => (
            <div
              key={folder.id}
              className="bg-card rounded-lg flex items-center justify-start gap-4 p-3 border border-border overflow-hidden"
            >
              <Folder className="min-w-6" />
              <span className="truncate">{folder.name}</span>
              <Button size={"icon-lg"} variant="ghost" className="ml-auto">
                <EllipsisVertical />
              </Button>
            </div>
          ))}
        </div>
      )}
      {files.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
          {files.map((file) => (
            <div
              key={file.id}
              className="bg-card rounded-lg border border-border overflow-hidden"
            >
              <div className="flex items-center justify-start gap-4 pl-4 py-2 pr-2">
                <Image
                  src={mimeTypeToIcon(file.mimeType)}
                  alt={file.name}
                  width={24}
                  height={24}
                />
                <span className="truncate">{file.name}</span>

                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        size={"icon-lg"}
                        variant="ghost"
                        className="ml-auto"
                      >
                        <EllipsisVertical />
                      </Button>
                    }
                  ></DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className={"min-w-50"}>
                    <DropdownMenuGroup>
                      <DropdownMenuItem>
                        <Eye />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <ExternalLink />
                        Open in new tab
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem>
                        <Download />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit3 />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy />
                        Make a copy
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem>
                        <Share2 />
                        Share
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Trash2 />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="min-h-50 flex-1 mx-4 mb-4 bg-muted rounded-lg overflow-hidden"></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

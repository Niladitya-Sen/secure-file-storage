"use client";

import { mimeTypeToIcon } from "@/lib/utils";
import { useDrive } from "@/store/drive-store";
import Image from "next/image";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import FileDropdownMenu from "../dropdowns/file-dropdown-menu";

type FileCardProps = File_ & {
  shared?: boolean;
  handlePreview?: (file: File_) => void;
};

export default function FileCard({
  name,
  mimeType,
  shared = false,
  handlePreview,
  ...rest
}: Readonly<FileCardProps>) {
  const openPreviewDialog = useDrive((state) => state.openPreviewDialog);

  function handleOpenPreviewDialog() {
    if (shared && handlePreview) {
      handlePreview({
        name,
        mimeType,
        ...rest,
      });

      return;
    }

    openPreviewDialog({
      name,
      mimeType,
      ...rest,
    });
  }

  return (
    <div className="bg-card rounded-lg flex items-center justify-start gap-4 border border-border overflow-hidden w-full max-w-auto md:max-w-75">
      <button
        className="flex items-center justify-start overflow-hidden gap-4 w-full cursor-pointer p-4 pr-0"
        type="button"
        onDoubleClick={handleOpenPreviewDialog}
      >
        <Image
          src={mimeTypeToIcon(mimeType)}
          alt={name}
          width={24}
          height={24}
        />
        <Tooltip>
          <TooltipTrigger
            render={<span className="truncate">{name}</span>}
          ></TooltipTrigger>
          <TooltipContent>
            <p className="break-all">{name}</p>
          </TooltipContent>
        </Tooltip>
      </button>
      <FileDropdownMenu
        file={{
          name,
          mimeType,
          ...rest,
        }}
        shared={shared}
      />
    </div>
  );
}

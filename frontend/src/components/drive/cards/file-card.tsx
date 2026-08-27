"use client";

import { mimeTypeToIcon } from "@/lib/utils";
import { useDrive } from "@/store/drive-store";
import Image from "next/image";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import FileDropdownMenu from "../dropdowns/file-dropdown-menu";

export default function FileCard({ name, mimeType, ...rest }: Readonly<File_>) {
  const openPreviewDialog = useDrive((state) => state.openPreviewDialog);

  function handleOpenPreviewDialog() {
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
            <p>{name}</p>
          </TooltipContent>
        </Tooltip>
      </button>
      <FileDropdownMenu
        file={{
          name,
          mimeType,
          ...rest,
        }}
      />
    </div>
  );
}

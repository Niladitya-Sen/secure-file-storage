import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { mimeTypeToIcon } from "@/lib/utils";
import {
  Copy,
  Download,
  Edit3,
  EllipsisVertical,
  ExternalLink,
  Eye,
  Share2,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { useDrive } from "@/store/drive-store";

export default function FileCard({
  id,
  name,
  size,
  mimeType,
  createdAt,
  visibility,
  url,
}: Readonly<File_>) {
  const openPreviewDialog = useDrive((state) => state.openPreviewDialog);

  return (
    <div className="bg-card rounded-lg flex items-center justify-start gap-4 border border-border overflow-hidden w-full max-w-auto md:max-w-75">
      <button
        className="flex items-center justify-start overflow-hidden gap-4 w-full cursor-pointer p-4 pr-0"
        type="button"
        onDoubleClick={() => {
          openPreviewDialog({
            name,
            size,
            mimeType,
            createdAt,
            visibility,
            id,
            url,
          });
        }}
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
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button size={"icon-lg"} variant="ghost" className="ml-auto mr-2">
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
  );
}

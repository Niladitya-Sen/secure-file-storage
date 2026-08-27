"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { copyToClipboard, mimeTypeToIcon } from "@/lib/utils";
import { useDrive } from "@/store/drive-store";
import {
  CircleOff,
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
import {
  useShareFileMutation,
  useUnshareFileMutation,
} from "@/actions/file-actions";
import { Spinner } from "../ui/spinner";
import { authFetchBlob } from "@/lib/auth-fetch";

export default function FileCard({ name, mimeType, ...rest }: Readonly<File_>) {
  const openPreviewDialog = useDrive((state) => state.openPreviewDialog);
  const currentFolderId = useDrive((state) => state.currentFolderId);
  const openFileDeleteDialog = useDrive((state) => state.openFileDeleteDialog);
  const openFileRenameDialog = useDrive((state) => state.openFileRenameDialog);

  const shareFileMutation = useShareFileMutation();
  const unshareFileMutation = useUnshareFileMutation();

  function handleOpenPreviewDialog() {
    openPreviewDialog({
      name,
      mimeType,
      ...rest,
    });
  }

  function handleRename() {
    openFileRenameDialog({
      name,
      mimeType,
      ...rest,
    });
  }

  function handleDelete() {
    openFileDeleteDialog({
      name,
      mimeType,
      ...rest,
    });
  }

  async function handleShare() {
    await shareFileMutation.mutateAsync({
      fileId: rest.id,
      folderId: currentFolderId || undefined,
    });
  }

  async function handleUnshare() {
    await unshareFileMutation.mutateAsync({
      fileId: rest.id,
      folderId: currentFolderId || undefined,
    });
  }

  function handleCopyShareLink() {
    if (rest.shareUrl) {
      copyToClipboard(rest.shareUrl);
    }
  }

  async function handleFileDownload() {
    const [data, error] = await authFetchBlob(rest.downloadUrl);

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error("No data received");
    }

    const blobUrl = URL.createObjectURL(data);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
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
            <DropdownMenuItem onClick={handleOpenPreviewDialog}>
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
            <DropdownMenuItem onClick={handleFileDownload}>
              <Download />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleRename}>
              <Edit3 />
              Rename
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {rest.visibility === "PRIVATE" ? (
              <DropdownMenuItem
                disabled={shareFileMutation.isPending}
                onClick={handleShare}
              >
                {shareFileMutation.isPending ? <Spinner /> : <Share2 />}
                Share
              </DropdownMenuItem>
            ) : (
              <>
                <DropdownMenuItem
                  disabled={unshareFileMutation.isPending}
                  onClick={handleCopyShareLink}
                >
                  <Copy />
                  Copy share link
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={unshareFileMutation.isPending}
                  onClick={handleUnshare}
                >
                  {unshareFileMutation.isPending ? <Spinner /> : <CircleOff />}
                  Revoke share link
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuItem onClick={handleDelete}>
              <Trash2 />
              Delete
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

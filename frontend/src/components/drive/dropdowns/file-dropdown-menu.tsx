"use client";

import {
  useShareFileMutation,
  useUnshareFileMutation,
} from "@/actions/file-actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { authFetchBlob } from "@/lib/auth-fetch";
import { copyToClipboard } from "@/lib/utils";
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

export default function FileDropdownMenu({ file }: Readonly<{ file: File_ }>) {
  const openPreviewDialog = useDrive((state) => state.openPreviewDialog);
  const currentFolderId = useDrive((state) => state.currentFolderId);
  const openFileDeleteDialog = useDrive((state) => state.openFileDeleteDialog);
  const openFileRenameDialog = useDrive((state) => state.openFileRenameDialog);

  const shareFileMutation = useShareFileMutation();
  const unshareFileMutation = useUnshareFileMutation();

  function handleOpenPreviewDialog() {
    openPreviewDialog(file);
  }

  function handleRename() {
    openFileRenameDialog(file);
  }

  function handleDelete() {
    openFileDeleteDialog(file);
  }

  async function handleShare() {
    await shareFileMutation.mutateAsync({
      fileId: file.id,
      folderId: currentFolderId || undefined,
    });
  }

  async function handleUnshare() {
    await unshareFileMutation.mutateAsync({
      fileId: file.id,
      folderId: currentFolderId || undefined,
    });
  }

  function handleCopyShareLink() {
    if (file.shareUrl) {
      copyToClipboard(file.shareUrl);
    }
  }

  async function handleFileDownload() {
    const [data, error] = await authFetchBlob(file.downloadUrl);

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error("No data received");
    }

    const blobUrl = URL.createObjectURL(data);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
  return (
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
          {file.visibility === "PRIVATE" ? (
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
  );
}

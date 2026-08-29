import {
  useShareFolderMutation,
  useUnshareFolderMutation,
} from "@/actions/folder-actions";
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
import { copyToClipboard } from "@/lib/utils";
import { useDrive } from "@/store/drive-store";
import {
  CircleOff,
  Copy,
  Edit3,
  EllipsisVertical,
  ExternalLink,
  Eye,
  Share2,
  Trash2,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";

type FolderDropdownMenuProps = {
  folder: Folder;
  shared?: boolean;
};

export default function FolderDropdownMenu({
  folder,
  shared = false,
}: Readonly<FolderDropdownMenuProps>) {
  const router = useRouter();
  const openFolderDeleteDialog = useDrive(
    (state) => state.openFolderDeleteDialog,
  );
  const openFolderRenameDialog = useDrive(
    (state) => state.openFolderRenameDialog,
  );

  const params = useParams();

  const currentFolderId = useDrive((state) => state.currentFolderId);

  const shareFolderMutation = useShareFolderMutation();
  const unshareFolderMutation = useUnshareFolderMutation();

  async function handleShare() {
    if (shared) {
      return;
    }

    await shareFolderMutation.mutateAsync({
      folderId: folder.id,
      parentFolderId: currentFolderId || undefined,
    });
  }

  async function handleUnshare() {
    if (shared) {
      return;
    }

    await unshareFolderMutation.mutateAsync({
      folderId: folder.id,
      parentFolderId: currentFolderId || undefined,
    });
  }

  function handleCopyShareLink() {
    if (folder.shareUrl) {
      copyToClipboard(folder.shareUrl);
    }
  }

  function getFolderOpenPath() {
    if (shared) {
      const folderIds =
        typeof params.folderIds === "string"
          ? [params.folderIds]
          : params.folderIds;
      const newFolderIds = folderIds ? [...folderIds, folder.id] : [folder.id];
      const newPath = `/share/${params.token}/folder/${newFolderIds.join("/")}`;
      return newPath;
    } else {
      return `/drive/folders/${folder.id}`;
    }
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
          <DropdownMenuItem onClick={() => router.push(getFolderOpenPath())}>
            <Eye />
            Open
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => window.open(getFolderOpenPath(), "_blank")}
          >
            <ExternalLink />
            Open in new tab
          </DropdownMenuItem>
        </DropdownMenuGroup>
        {shared ? (
          folder.visibility === "PUBLIC" && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={handleCopyShareLink}>
                  <Copy />
                  Copy share link
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </>
          )
        ) : (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {folder.visibility === "PRIVATE" ? (
                <DropdownMenuItem
                  disabled={shareFolderMutation.isPending}
                  onClick={handleShare}
                >
                  {shareFolderMutation.isPending ? <Spinner /> : <Share2 />}
                  Share
                </DropdownMenuItem>
              ) : (
                <>
                  <DropdownMenuItem
                    disabled={unshareFolderMutation.isPending}
                    onClick={handleCopyShareLink}
                  >
                    <Copy />
                    Copy share link
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={unshareFolderMutation.isPending}
                    onClick={handleUnshare}
                  >
                    {unshareFolderMutation.isPending ? (
                      <Spinner />
                    ) : (
                      <CircleOff />
                    )}
                    Revoke share link
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => openFolderRenameDialog(folder)}>
                <Edit3 />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => openFolderDeleteDialog(folder)}
              >
                <Trash2 />
                Delete
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

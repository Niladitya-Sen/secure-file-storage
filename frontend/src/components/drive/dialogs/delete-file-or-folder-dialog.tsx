"use client";

import { useDeleteFileMutation } from "@/actions/file-actions";
import { useDeleteFolderMutation } from "@/actions/folder-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDrive } from "@/store/drive-store";

export default function DeleteFileOrFolderDialog() {
  const open = useDrive((state) => state.isDeleteDialogOpen);
  const fileToDelete = useDrive((state) => state.fileToDelete);
  const folderToDelete = useDrive((state) => state.folderToDelete);
  const closeDeleteDialog = useDrive((state) => state.closeDeleteDialog);
  const currentFolderId = useDrive((state) => state.currentFolderId);

  const deleteFileMutation = useDeleteFileMutation();
  const deleteFolderMutation = useDeleteFolderMutation();

  async function handleDelete() {
    if (fileToDelete) {
      await deleteFileMutation.mutateAsync(
        {
          fileId: fileToDelete.id,
          folderId: currentFolderId ?? undefined,
        },
        {
          onSettled: () => {
            closeDeleteDialog();
          },
        },
      );

      return;
    }

    if (folderToDelete) {
      await deleteFolderMutation.mutateAsync(
        {
          folderId: folderToDelete.id,
          parentFolderId: currentFolderId ?? undefined,
        },
        {
          onSettled: () => {
            closeDeleteDialog();
          },
        },
      );
    }
  }

  if (fileToDelete === null && folderToDelete === null) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) {
          closeDeleteDialog();
        }
      }}
    >
      <DialogContent className={"sm:max-w-lg"}>
        <DialogHeader>
          <DialogTitle className={"text-lg max-w-sm"}>
            Delete{" "}
            <span className="break-all">
              &apos;
              {fileToDelete ? fileToDelete.name : folderToDelete?.name}&apos;
            </span>{" "}
            ?
          </DialogTitle>
          <DialogDescription className={"text-base"}>
            Are you sure you want to delete this{" "}
            {fileToDelete ? "file" : "folder"}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant={"outline"} onClick={closeDeleteDialog}>
            Cancel
          </Button>
          <Button variant={"destructive"} onClick={handleDelete}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

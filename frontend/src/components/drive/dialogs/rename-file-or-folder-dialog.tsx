"use client";

import { useRenameFileMutation } from "@/actions/file-actions";
import { useRenameFolderMutation } from "@/actions/folder-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useDrive } from "@/store/drive-store";
import { useState } from "react";

export default function RenameFileOrFolderDialog() {
  const open = useDrive((state) => state.isRenameDialogOpen);
  const fileToRename = useDrive((state) => state.fileToRename);
  const folderToRename = useDrive((state) => state.folderToRename);
  const closeRenameDialog = useDrive((state) => state.closeRenameDialog);
  const currentFolderId = useDrive((state) => state.currentFolderId);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const renameFileMutation = useRenameFileMutation();
  const renameFolderMutation = useRenameFolderMutation();

  async function handleRename() {
    if (!newName.trim()) {
      setError("New name cannot be empty");
      return;
    }

    if (newName.trim() === (fileToRename?.name || folderToRename?.name)) {
      setError("New name cannot be the same as the old name");
      return;
    }

    if (fileToRename) {
      await renameFileMutation.mutateAsync(
        {
          fileId: fileToRename.id,
          folderId: currentFolderId ?? undefined,
          newFileName: newName,
        },
        {
          onSettled: () => {
            setNewName("");
            closeRenameDialog();
          },
        },
      );

      return;
    }

    if (folderToRename) {
      await renameFolderMutation.mutateAsync(
        {
          folderId: folderToRename.id,
          parentFolderId: currentFolderId ?? undefined,
          newFolderName: newName,
        },
        {
          onSettled: () => {
            setNewName("");
            closeRenameDialog();
          },
        },
      );
    }
  }

  if (fileToRename === null && folderToRename === null) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setNewName("");
        if (!val) {
          closeRenameDialog();
        }
      }}
    >
      <DialogContent className={"sm:max-w-md"}>
        <DialogHeader>
          <DialogTitle className={"text-lg"}>
            Rename {fileToRename ? "File" : "Folder"}
          </DialogTitle>
          <DialogDescription className={"sr-only"}>
            Renaming {fileToRename ? fileToRename.name : folderToRename?.name}
          </DialogDescription>
        </DialogHeader>
        <div>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Enter new name"
            aria-invalid={error ? true : undefined}
          />
          {error && (
            <p className="text-sm text-destructive pl-0.5 mt-2">{error}</p>
          )}
        </div>
        <DialogFooter>
          <Button variant={"outline"} onClick={closeRenameDialog}>
            Cancel
          </Button>
          <Button disabled={!newName.trim()} onClick={handleRename}>
            Rename
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

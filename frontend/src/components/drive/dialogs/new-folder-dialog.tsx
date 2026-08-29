"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React, { useState } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { useDrive } from "@/store/drive-store";
import { useCreateFolderMutation } from "@/actions/folder-actions";
import { Spinner } from "../../ui/spinner";
import { useHandleEnterPress } from "@/hooks/use-handle-enter-press";

export default function NewFolderDialog() {
  const open = useDrive((state) => state.openNewFolderDialog);
  const currentFolderId = useDrive((state) => state.currentFolderId);
  const onOpenChange = useDrive((state) => state.setOpenNewFolderDialog);
  const createFolderMutation = useCreateFolderMutation();
  const [folderName, setFolderName] = useState("");

  useHandleEnterPress(() => {
    if (open) {
      handleCreateFolder();
    }
  });

  async function handleCreateFolder() {
    if (!folderName) {
      return;
    }

    await createFolderMutation.mutateAsync(
      {
        folderName,
        parentFolderId: currentFolderId ?? undefined,
      },
      {
        onSuccess: () => {
          setFolderName("");
          onOpenChange(false);
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className={"text-xl"}>New folder</DialogTitle>
          <DialogDescription className={"sr-only"}>
            New Folder
          </DialogDescription>
        </DialogHeader>
        <Input
          placeholder="Folder name"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
        />
        <DialogFooter>
          <Button
            disabled={createFolderMutation.isPending}
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setFolderName("");
            }}
          >
            Cancel
          </Button>
          <Button
            disabled={!folderName || createFolderMutation.isPending}
            onClick={handleCreateFolder}
          >
            {createFolderMutation.isPending && <Spinner />}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

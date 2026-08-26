import { create } from "zustand";

type DriveStore = {
  openNewFolderDialog: boolean;
  currentFolderId: string | null;
  isPreviewDialogOpen: boolean;
  previewFile: File_ | null;
  setOpenNewFolderDialog: (open: boolean) => void;
  setCurrentFolderId: (folderId: string | null) => void;
  openPreviewDialog: (file: File_) => void;
  closePreviewDialog: () => void;
};

export const useDrive = create<DriveStore>((set) => ({
  openNewFolderDialog: false,
  currentFolderId: null,
  isPreviewDialogOpen: false,
  previewFile: null,
  setOpenNewFolderDialog: (open: boolean) => set({ openNewFolderDialog: open }),
  setCurrentFolderId: (folderId: string | null) =>
    set({ currentFolderId: folderId }),
  openPreviewDialog: (file: File_) =>
    set({ isPreviewDialogOpen: true, previewFile: file }),
  closePreviewDialog: () =>
    set({ isPreviewDialogOpen: false, previewFile: null }),
}));

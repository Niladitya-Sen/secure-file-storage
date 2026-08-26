import { create } from "zustand";

type DriveStore = {
  openNewFolderDialog: boolean;
  currentFolderId: string | null;
  setOpenNewFolderDialog: (open: boolean) => void;
  setCurrentFolderId: (folderId: string | null) => void;
};

export const useDrive = create<DriveStore>((set) => ({
  openNewFolderDialog: false,
  currentFolderId: null,
  setOpenNewFolderDialog: (open: boolean) => set({ openNewFolderDialog: open }),
  setCurrentFolderId: (folderId: string | null) =>
    set({ currentFolderId: folderId }),
}));

import { create } from "zustand";

type DriveStore = {
  openNewFolderDialog: boolean;
  currentFolderId: string | null;
  setOpenNewFolderDialog: (open: boolean) => void;
  setCurrentFolderId: (folderId: string | null) => void;

  isPreviewDialogOpen: boolean;
  previewFile: File_ | null;
  openPreviewDialog: (file: File_) => void;
  closePreviewDialog: () => void;

  isDeleteDialogOpen: boolean;
  fileToDelete: File_ | null;
  folderToDelete: Folder | null;
  openFileDeleteDialog: (file: File_) => void;
  openFolderDeleteDialog: (folder: Folder) => void;
  closeDeleteDialog: () => void;

  isRenameDialogOpen: boolean;
  fileToRename: File_ | null;
  folderToRename: Folder | null;
  openFileRenameDialog: (file: File_) => void;
  openFolderRenameDialog: (folder: Folder) => void;
  closeRenameDialog: () => void;

  uploadFileState: Record<string, "uploading" | "success" | "error">;
  setUploadFileState: (
    state: Record<string, "uploading" | "success" | "error">,
  ) => void;
  updateUploadFileState: (
    fileName: string,
    state: "uploading" | "success" | "error",
  ) => void;
};

export const useDrive = create<DriveStore>((set) => ({
  openNewFolderDialog: false,
  currentFolderId: null,
  setOpenNewFolderDialog: (open: boolean) => set({ openNewFolderDialog: open }),
  setCurrentFolderId: (folderId: string | null) =>
    set({ currentFolderId: folderId }),

  isPreviewDialogOpen: false,
  previewFile: null,
  openPreviewDialog: (file: File_) =>
    set({ isPreviewDialogOpen: true, previewFile: file }),
  closePreviewDialog: () =>
    set({ isPreviewDialogOpen: false, previewFile: null }),

  isDeleteDialogOpen: false,
  fileToDelete: null,
  folderToDelete: null,
  openFileDeleteDialog: (file: File_) =>
    set({ isDeleteDialogOpen: true, fileToDelete: file, folderToDelete: null }),
  openFolderDeleteDialog: (folder: Folder) =>
    set({
      isDeleteDialogOpen: true,
      fileToDelete: null,
      folderToDelete: folder,
    }),
  closeDeleteDialog: () =>
    set({
      isDeleteDialogOpen: false,
      fileToDelete: null,
      folderToDelete: null,
    }),

  isRenameDialogOpen: false,
  fileToRename: null,
  folderToRename: null,
  openFileRenameDialog: (file: File_) =>
    set({ isRenameDialogOpen: true, fileToRename: file, folderToRename: null }),
  openFolderRenameDialog: (folder: Folder) =>
    set({
      isRenameDialogOpen: true,
      fileToRename: null,
      folderToRename: folder,
    }),
  closeRenameDialog: () =>
    set({
      isRenameDialogOpen: false,
      fileToRename: null,
      folderToRename: null,
    }),

  uploadFileState: {},
  setUploadFileState: (
    state: Record<string, "uploading" | "success" | "error">,
  ) => set({ uploadFileState: state }),
  updateUploadFileState: (
    fileName: string,
    state: "uploading" | "success" | "error",
  ) =>
    set((prevState) => ({
      uploadFileState: {
        ...prevState.uploadFileState,
        [fileName]: state,
      },
    })),
}));

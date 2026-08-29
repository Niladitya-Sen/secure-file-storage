import { toast } from "@/components/ui/toast";
import authFetch from "@/lib/auth-fetch";
import { buildTreeFromPaths, copyToClipboard } from "@/lib/utils";
import { useDrive } from "@/store/drive-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadFile } from "./file-actions";
import { MAX_CONCURRENT_UPLOADS } from "@/constants";

export function useCreateFolderMutation() {
  const queryClient = useQueryClient();

  const createFolderMutation = useMutation({
    mutationFn: async ({
      folderName,
      parentFolderId,
    }: {
      folderName: string;
      parentFolderId?: string;
    }) => {
      const [data, error] = await authFetch("/folders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: folderName,
          parentFolderId,
        }),
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: vars.parentFolderId
          ? ["folder", vars.parentFolderId]
          : ["folder"],
      });
    },
    onError: (error) => {
      toast.add({
        title: "Error creating folder",
        description: error.message,
        type: "error",
      });
    },
  });

  return createFolderMutation;
}

export function useUploadFolderMutation() {
  const queryClient = useQueryClient();

  const uploadFolderMutation = useMutation({
    mutationFn: async ({
      files,
      folderId,
    }: {
      files: File[];
      folderId?: string;
    }) => {
      const folderStructure = buildTreeFromPaths(
        files.map((file) => file.webkitRelativePath),
      );

      const [data, error] = await authFetch<{
        folders: Record<string, string>;
        message: string;
      }>("/folders/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          folderStructure,
          parentFolderId: folderId,
        }),
      });

      if (error) {
        throw new Error(error.message);
      }

      let currentIndex = 0;

      useDrive.getState().setUploadFileState(
        files.reduce(
          (acc, file) => {
            acc[file.name] = "uploading";
            return acc;
          },
          {} as Record<string, "uploading" | "success" | "error">,
        ),
      );

      for (
        let i = 0;
        i < Math.ceil(files.length / MAX_CONCURRENT_UPLOADS);
        i++
      ) {
        const uploadBatch = files.slice(
          currentIndex,
          currentIndex + MAX_CONCURRENT_UPLOADS,
        );

        const uploadPromises = uploadBatch.map((file) =>
          uploadFile({
            file,
            folderId:
              data?.folders[
                file.webkitRelativePath.substring(
                  0,
                  file.webkitRelativePath.lastIndexOf("/"),
                )
              ],
          }),
        );

        await Promise.allSettled(uploadPromises);

        currentIndex += MAX_CONCURRENT_UPLOADS;
      }
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: vars.folderId ? ["folder", vars.folderId] : ["folder"],
      });
    },
    onError: (error) => {
      toast.add({
        title: "Error creating folder",
        description: error.message,
        type: "error",
      });
    },
  });

  return uploadFolderMutation;
}

export function useDeleteFolderMutation() {
  const queryClient = useQueryClient();

  const deleteFileMutation = useMutation({
    mutationFn: async ({
      folderId,
    }: {
      folderId: string;
      parentFolderId?: string;
    }) => {
      const [_, error] = await authFetch(`/folders/${folderId}`, {
        method: "DELETE",
      });

      if (error) {
        throw error;
      }
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: vars.folderId ? ["folder", vars.parentFolderId] : ["folder"],
      });

      toast.add({
        title: "Folder deleted successfully",
        type: "success",
      });
    },
    onError: (error) => {
      toast.add({
        title: "Error deleting folder",
        description: error.message,
        type: "error",
      });
    },
  });

  return deleteFileMutation;
}

export function useRenameFolderMutation() {
  const queryClient = useQueryClient();

  const renameFolderMutation = useMutation({
    mutationFn: async ({
      folderId,
      newFolderName,
    }: {
      folderId: string;
      newFolderName: string;
      parentFolderId?: string;
    }) => {
      const [_, error] = await authFetch(`/folders/${folderId}/rename`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newFolderName }),
      });

      if (error) {
        throw error;
      }
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: vars.parentFolderId
          ? ["folder", vars.parentFolderId]
          : ["folder"],
      });
    },
    onError: (error) => {
      toast.add({
        title: "Error renaming folder",
        description: error.message,
        type: "error",
      });
    },
  });

  return renameFolderMutation;
}

export function useShareFolderMutation() {
  const queryClient = useQueryClient();

  const shareFolderMutation = useMutation({
    mutationFn: async ({
      folderId,
      parentFolderId,
    }: {
      folderId: string;
      parentFolderId?: string;
    }) => {
      const [data, error] = await authFetch<{ shareUrl: string }>(
        `/folders/${folderId}/share`,
        {
          method: "POST",
        },
      );

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: (data, vars) => {
      if (data) {
        copyToClipboard(data.shareUrl);

        queryClient.invalidateQueries({
          queryKey: vars.parentFolderId
            ? ["folder", vars.parentFolderId]
            : ["folder"],
        });
      }
    },
    onError: (error) => {
      toast.add({
        title: "Error sharing folder",
        description: error.message,
        type: "error",
      });
    },
  });

  return shareFolderMutation;
}

export function useUnshareFolderMutation() {
  const queryClient = useQueryClient();

  const unshareFolderMutation = useMutation({
    mutationFn: async ({
      folderId,
    }: {
      folderId: string;
      parentFolderId?: string;
    }) => {
      const [_, error] = await authFetch(`/folders/${folderId}/unshare`, {
        method: "POST",
      });

      if (error) {
        throw error;
      }
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: vars.parentFolderId
          ? ["folder", vars.parentFolderId]
          : ["folder"],
      });
      queryClient.invalidateQueries({
        queryKey: ["shared-folders"],
      });

      toast.add({
        title: "Public access revoked",
        description: "The folder is no longer publicly accessible.",
        type: "success",
      });
    },
    onError: (error) => {
      toast.add({
        title: "Error revoking public access",
        description: error.message,
        type: "error",
      });
    },
  });

  return unshareFolderMutation;
}

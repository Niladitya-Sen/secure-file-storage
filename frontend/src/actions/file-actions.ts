import { toast } from "@/components/ui/toast";
import authFetch from "@/lib/auth-fetch";
import { copyToClipboard } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUploadFilesMutation() {
  const queryClient = useQueryClient();

  const fileUploadMutation = useMutation({
    mutationFn: async ({
      files,
      folderId,
    }: {
      files: File[];
      folderId?: string;
    }) => {
      const formData = new FormData();

      if (folderId) {
        formData.append("folderId", folderId);
      }

      files.forEach((file) => {
        formData.append("files", file);
      });

      const [data, error] = await authFetch("/files/upload", {
        method: "POST",
        body: formData,
      });

      console.log(data, error);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: vars.folderId ? ["folder", vars.folderId] : ["folder"],
      });
      toast.add({
        title: "Files uploaded successfully",
        type: "success",
      });
    },
    onError: (error) => {
      toast.add({
        title: "Error uploading files",
        description: error.message,
        type: "error",
      });
    },
  });

  return fileUploadMutation;
}

export function useShareFileMutation() {
  const queryClient = useQueryClient();

  const shareFileMutation = useMutation({
    mutationFn: async ({
      fileId,
      folderId,
    }: {
      fileId: string;
      folderId?: string;
    }) => {
      const [data, error] = await authFetch<{ shareUrl: string }>(
        `/files/${fileId}/share`,
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
          queryKey: vars.folderId ? ["folder", vars.folderId] : ["folder"],
        });
      }
    },
    onError: (error) => {
      toast.add({
        title: "Error sharing file",
        description: error.message,
        type: "error",
      });
    },
  });

  return shareFileMutation;
}

export function useUnshareFileMutation() {
  const queryClient = useQueryClient();

  const unshareFileMutation = useMutation({
    mutationFn: async ({
      fileId,
      folderId,
    }: {
      fileId: string;
      folderId?: string;
    }) => {
      const [_, error] = await authFetch(`/files/${fileId}/unshare`, {
        method: "POST",
      });

      if (error) {
        throw error;
      }
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: vars.folderId ? ["folder", vars.folderId] : ["folder"],
      });

      toast.add({
        title: "Public access revoked",
        description: "The file is no longer publicly accessible.",
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

  return unshareFileMutation;
}

export function useDeleteFileMutation() {
  const queryClient = useQueryClient();

  const deleteFileMutation = useMutation({
    mutationFn: async ({ fileId }: { fileId: string; folderId?: string }) => {
      const [_, error] = await authFetch(`/files/${fileId}`, {
        method: "DELETE",
      });

      if (error) {
        throw error;
      }
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: vars.folderId ? ["folder", vars.folderId] : ["folder"],
      });

      toast.add({
        title: "File deleted successfully",
        type: "success",
      });
    },
    onError: (error) => {
      toast.add({
        title: "Error deleting file",
        description: error.message,
        type: "error",
      });
    },
  });

  return deleteFileMutation;
}

export function useRenameFileMutation() {
  const queryClient = useQueryClient();

  const renameFileMutation = useMutation({
    mutationFn: async ({
      fileId,
      newFileName,
    }: {
      fileId: string;
      newFileName: string;
      folderId?: string;
    }) => {
      const [_, error] = await authFetch(`/files/${fileId}/rename`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newFileName }),
      });

      if (error) {
        throw error;
      }
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: vars.folderId ? ["folder", vars.folderId] : ["folder"],
      });
    },
    onError: (error) => {
      toast.add({
        title: "Error renaming file",
        description: error.message,
        type: "error",
      });
    },
  });

  return renameFileMutation;
}

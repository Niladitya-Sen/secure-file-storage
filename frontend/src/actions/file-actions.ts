import { toast } from "@/components/ui/toast";
import authFetch from "@/lib/auth-fetch";
import { copyToClipboard } from "@/lib/utils";
import { useDrive } from "@/store/drive-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type UploadOptions = {
  file: File;
  folderId?: string;
};

export async function uploadFile({ file, folderId }: UploadOptions) {
  const [data, error] = await authFetch<{
    url: string;
    fields: {
      [x: string]: string;
    };
  }>("/files/upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type,
      size: file.size,
      folderId: folderId,
    }),
  });

  if (error || !data) {
    useDrive.getState().updateUploadFileState(file.name, "error");
    return;
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("POST", data.url);

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        useDrive.getState().updateUploadFileState(file.name, "success");
        resolve(xhr.responseText);
      } else {
        useDrive.getState().updateUploadFileState(file.name, "error");
        reject(new Error(xhr.responseText));
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network error"));
    };

    xhr.onabort = () => {
      reject(new Error("Upload cancelled"));
    };

    const formData = new FormData();

    for (const [key, value] of Object.entries(data.fields)) {
      formData.append(key, value);
    }

    formData.append("file", file);

    xhr.send(formData);
  });
}

export async function uploadFiles({
  files,
  folderId,
  onConcurrentUploadComplete,
}: {
  files: File[];
  folderId?: string;
  onConcurrentUploadComplete?: () => void;
}) {
  const MAX_CONCURRENT_UPLOADS = 3;
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

  for (let i = 0; i < Math.ceil(files.length / MAX_CONCURRENT_UPLOADS); i++) {
    const uploadBatch = files.slice(
      currentIndex,
      currentIndex + MAX_CONCURRENT_UPLOADS,
    );

    const uploadPromises = uploadBatch.map((file) =>
      uploadFile({
        file,
        folderId,
      }),
    );

    await Promise.allSettled(uploadPromises);

    onConcurrentUploadComplete?.();
    currentIndex += MAX_CONCURRENT_UPLOADS;
  }
}

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
      queryClient.invalidateQueries({
        queryKey: ["shared-files"],
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
      queryClient.invalidateQueries({
        queryKey: ["shared-files"],
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
      queryClient.invalidateQueries({
        queryKey: ["shared-files"],
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

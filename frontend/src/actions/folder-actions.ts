import { toast } from "@/components/ui/toast";
import authFetch from "@/lib/auth-fetch";
import { buildTreeFromPaths } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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
      // 1. read the folder structure from the files and send to the backend
      // 2. backend will create the folder structure and upload the files to the respective folders

      const folderStructure = buildTreeFromPaths(
        files.map((file) => file.webkitRelativePath),
      );

      console.log(files);
      console.log(folderStructure);

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

      console.log(data);

      const formData = new FormData();

      let metadata: Record<string, string> = {};

      for (const file of files) {
        const fileFolderPath = file.webkitRelativePath.substring(
          0,
          file.webkitRelativePath.lastIndexOf("/"),
        );
        const folderId = data?.folders[fileFolderPath];

        if (folderId) {
          formData.append("files", file);
          metadata[file.name] = folderId;
        }
      }

      formData.append("metadata", JSON.stringify(metadata));

      const [_, uploadError] = await authFetch<{
        message: string;
      }>("/files/bulk-folder", {
        method: "POST",
        body: formData,
      });

      if (uploadError) {
        throw new Error(uploadError.message);
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

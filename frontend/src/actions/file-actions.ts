import { toast } from "@/components/ui/toast";
import authFetch from "@/lib/auth-fetch";
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

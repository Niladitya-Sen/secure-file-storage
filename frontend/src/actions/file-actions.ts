import authFetch from "@/lib/auth-fetch";
import { useMutation } from "@tanstack/react-query";

export function useUploadFilesMutation() {
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
    },
  });

  return fileUploadMutation;
}

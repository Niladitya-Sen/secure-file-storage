"use client";

import FolderView from "@/components/drive/folder-view";
import { useParams } from "next/navigation";

export default function Folder() {
  const params = useParams();
  const folderId = params.folderId as string;

  return <FolderView folderId={folderId} />;
}

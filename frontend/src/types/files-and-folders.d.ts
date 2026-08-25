type Folder = {
  name: string;
  id: string;
  createdAt: string;
};

type FileVisibility = "PRIVATE" | "PUBLIC";

type File_ = {
  name: string;
  id: string;
  createdAt: string;
  size: number;
  mimeType: string;
  visibility: FileVisibility;
};

type FolderContents = {
  folders: Folder[];
  files: File_[];
};

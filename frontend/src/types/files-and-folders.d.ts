type PathSegment = { name: string; id: string };

type Folder = {
  name: string;
  id: string;
  path: PathSegment[];
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
  path: PathSegment[];
  folders: Folder[];
  files: File_[];
};

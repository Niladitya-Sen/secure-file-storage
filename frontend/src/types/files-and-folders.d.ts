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
  viewUrl: string;
  downloadUrl: string;
  shareUrl: string | null;
};

type FolderContents = {
  path: PathSegment[];
  folders: Folder[];
  files: File_[];
};

type SharedFile = File_ & {
  sharedAt: string;
};

type PathSegment = { name: string; id: string };

type Folder = {
  name: string;
  id: string;
  path: PathSegment[];
  createdAt: string;
  visibility: Visibility;
  shareUrl: string | null;
};

type Visibility = "PRIVATE" | "PUBLIC";

type File_ = {
  name: string;
  id: string;
  createdAt: string;
  size: number;
  mimeType: string;
  visibility: Visibility;
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

type SharedFolder = Folder & {
  sharedAt: string;
};

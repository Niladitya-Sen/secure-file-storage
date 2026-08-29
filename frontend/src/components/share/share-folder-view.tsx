import { MAX_BREADCRUMB_ITEMS } from "@/constants";
import { cn } from "@/lib/utils";
import { Ellipsis } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useState } from "react";
import FileCard from "../drive/cards/file-card";
import FolderCard from "../drive/cards/folder-card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import SharePreviewDialog from "./share-preview-dialog";

export default function ShareFolderView({
  files,
  folders,
  path,
}: Readonly<FolderContents>) {
  const segmentsToShow = path.slice(-MAX_BREADCRUMB_ITEMS + 1);
  const params = useParams();
  const router = useRouter();

  const [isSharePreviewDialogOpen, setIsSharePreviewDialogOpen] =
    useState(false);
  const [fileToPreview, setFileToPreview] = useState<File_ | null>(null);

  function handleFilePreview(file: File_) {
    setFileToPreview(file);
    setIsSharePreviewDialogOpen(true);
  }

  function handleBreadcrumbClick(index: number) {
    const newFolderIds = path.slice(0, index + 1).map((segment) => segment.id);
    const token = params.token;
    const newPath = `/share/${token}/folder/${newFolderIds.join("/")}`;
    router.push(newPath);
  }

  return (
    <div className="flex flex-1 flex-col relative overflow-hidden bg-background rounded-lg border border-border">
      <SharePreviewDialog
        open={isSharePreviewDialogOpen}
        onOpenChange={(val) => {
          setIsSharePreviewDialogOpen(val);
          if (!val) {
            setFileToPreview(null);
          }
        }}
        fileToPreview={fileToPreview}
      />
      <nav className="flex items-center gap-2 p-4 border-b border-border">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                className="text-foreground"
                render={<Link href={`/share/${params.token}/folder`} />}
              >
                Shared Folder
              </BreadcrumbLink>
            </BreadcrumbItem>
            {path.length > 0 && (
              <BreadcrumbSeparator className="text-foreground" />
            )}
            {path.length >= MAX_BREADCRUMB_ITEMS && (
              <>
                <BreadcrumbItem className="cursor-pointer">
                  <BreadcrumbLink
                    className="text-foreground"
                    onClick={() =>
                      handleBreadcrumbClick(path.length - MAX_BREADCRUMB_ITEMS)
                    }
                  >
                    <Ellipsis />
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-foreground" />
              </>
            )}
            {segmentsToShow.map((segment, index) => (
              <React.Fragment key={segment.id}>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    className="text-foreground cursor-pointer"
                    onClick={() => handleBreadcrumbClick(index)}
                  >
                    {segment.name}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {index < segmentsToShow.length - 1 && (
                  <BreadcrumbSeparator className="text-foreground" />
                )}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </nav>
      <div
        className={cn(
          "flex flex-col flex-1 gap-6 p-4 overflow-y-auto",
          files.length === 0 &&
            folders.length === 0 &&
            "items-center justify-center",
        )}
      >
        {files.length === 0 && folders.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2">
            <Image
              src="/assets/icons/file/empty-folder.png"
              alt="Empty folder"
              width={100}
              height={100}
            />
            <p className="text-center font-medium text-muted-foreground max-w-sm">
              This folder is empty.
            </p>
          </div>
        )}

        {folders.length > 0 && (
          <div className="flex flex-row flex-wrap gap-4">
            {folders.map((folder) => (
              <FolderCard key={folder.id} {...folder} shared />
            ))}
          </div>
        )}
        {files.length > 0 && (
          <div className="flex flex-row flex-wrap gap-4">
            {files.map((file) => (
              <FileCard
                key={file.id}
                {...file}
                shared
                handlePreview={(file) => {
                  handleFilePreview(file);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

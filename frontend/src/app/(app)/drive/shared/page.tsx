"use client";

import Navbar from "@/components/drive/navbar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import authFetch from "@/lib/auth-fetch";
import { mimeTypeToIcon } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import dayjs from "dayjs";
import FileDropdownMenu from "@/components/drive/dropdowns/file-dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Folder } from "lucide-react";
import FolderDropdownMenu from "@/components/drive/dropdowns/folder-dropdown-menu";

export default function SharedFiles() {
  const {
    data: filesData,
    isLoading: isFilesLoading,
    error: filesError,
  } = useQuery({
    queryKey: ["shared-files"],
    queryFn: async () => {
      const [data, error] = await authFetch<SharedFile[]>("/files/shared");

      if (error) {
        throw error;
      }

      return data;
    },
  });

  const {
    data: foldersData,
    isLoading: isFoldersLoading,
    error: foldersError,
  } = useQuery({
    queryKey: ["shared-folders"],
    queryFn: async () => {
      const [data, error] = await authFetch<SharedFolder[]>("/folders/shared");

      if (error) {
        throw error;
      }

      return data;
    },
  });

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Navbar component={<p className="text-base">Shared Files</p>} />
      <Tabs
        defaultValue="shared-files"
        className="flex flex-col flex-1 overflow-hidden px-4 pt-4"
      >
        <TabsList>
          <TabsTrigger value="shared-files">Shared Files</TabsTrigger>
          <TabsTrigger value="shared-folders">Shared Folders</TabsTrigger>
        </TabsList>
        <TabsContent
          value="shared-files"
          className={"w-full flex flex-1 flex-col pb-4 pt-2"}
        >
          <div className="w-full flex flex-1 overflow-hidden">
            <div className="border border-border rounded-lg flex flex-col flex-1 overflow-hidden">
              <Table className="rounded-lg">
                <TableHeader className="bg-secondary sticky top-0 z-10">
                  <TableRow>
                    <TableHead>File Name</TableHead>
                    <TableHead>Date shared</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isFilesLoading && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  )}
                  {filesError && (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center text-destructive"
                      >
                        Error: {(filesError as Error).message}
                      </TableCell>
                    </TableRow>
                  )}
                  {filesData?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">
                        No shared files found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filesData?.map((file) => (
                      <TableRow key={file.id}>
                        <TableCell className="flex items-center gap-2">
                          <Image
                            src={mimeTypeToIcon(file.mimeType)}
                            alt={file.name}
                            width={24}
                            height={24}
                          />
                          <p className="max-w-md truncate">{file.name}</p>
                        </TableCell>
                        <TableCell>
                          {dayjs(file.sharedAt).format("MMM D, YYYY h:mm A")}
                        </TableCell>
                        <TableCell className="text-right">
                          <FileDropdownMenu file={file} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
        <TabsContent
          value="shared-folders"
          className={"w-full flex flex-1 flex-col pb-4 pt-2"}
        >
          <div className="w-full flex flex-1 overflow-hidden">
            <div className="border border-border rounded-lg flex flex-col flex-1 overflow-hidden">
              <Table className="rounded-lg">
                <TableHeader className="bg-secondary sticky top-0 z-10">
                  <TableRow>
                    <TableHead>Folder Name</TableHead>
                    <TableHead>Date shared</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isFoldersLoading && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  )}
                  {foldersError && (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center text-destructive"
                      >
                        Error: {(foldersError as Error).message}
                      </TableCell>
                    </TableRow>
                  )}
                  {foldersData?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">
                        No shared folders found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    foldersData?.map((folder) => (
                      <TableRow key={folder.id}>
                        <TableCell className="flex items-center gap-2">
                          <Folder className="w-6 h-6" />
                          <p className="max-w-md truncate">{folder.name}</p>
                        </TableCell>
                        <TableCell>
                          {dayjs(folder.sharedAt).format("MMM D, YYYY h:mm A")}
                        </TableCell>
                        <TableCell className="text-right">
                          <FolderDropdownMenu folder={folder} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

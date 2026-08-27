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

export default function SharedFiles() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["shared-files"],
    queryFn: async () => {
      const [data, error] = await authFetch<SharedFile[]>("/files/shared");

      if (error) {
        throw error;
      }

      return data;
    },
  });

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Navbar title="Shared Files" />
      <div className="px-4 py-4 flex flex-1 overflow-hidden">
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
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              )}
              {error && (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center text-destructive"
                  >
                    Error: {(error as Error).message}
                  </TableCell>
                </TableRow>
              )}
              {data?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    No shared files found.
                  </TableCell>
                </TableRow>
              ) : (
                data?.map((file) => (
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
    </div>
  );
}

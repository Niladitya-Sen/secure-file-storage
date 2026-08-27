"use client";

import { useUploadFilesMutation } from "@/actions/file-actions";
import {
  useCreateFolderMutation,
  useUploadFolderMutation,
} from "@/actions/folder-actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { fi } from "date-fns/locale";
import {
  FileUp,
  FolderPlus,
  FolderUp,
  Home,
  LinkIcon,
  PlusCircle,
} from "lucide-react";
import NewFolderDialog from "./dialogs/new-folder-dialog";
import { useDrive } from "@/store/drive-store";
import { toast } from "../ui/toast";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

const items = [
  {
    title: "Home",
    icon: Home,
    href: "/drive",
  },
  {
    title: "Shared",
    icon: LinkIcon,
    href: "/drive/shared",
  },
];

export default function DriveSidebar() {
  const { open } = useSidebar();
  const openNewFolderDialog = useDrive((state) => state.setOpenNewFolderDialog);
  const currentFolderId = useDrive((state) => state.currentFolderId);

  const fileUploadMutation = useUploadFilesMutation();
  const folderUploadMutation = useUploadFolderMutation();

  async function handleFileUpload() {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.multiple = true;

    fileInput.addEventListener("change", async (event) => {
      const target = event.target as HTMLInputElement;
      if (target.files) {
        const files = Array.from(target.files);

        if (files.length === 0) {
          toast.add({
            title: "No files selected",
            description: "Please select at least one file to upload.",
            type: "error",
          });
          return;
        }

        await fileUploadMutation.mutateAsync({
          files,
          folderId: currentFolderId ?? undefined,
        });
      }

      fileInput.remove();
    });

    fileInput.click();
  }

  async function handleFolderUpload() {
    const folderInput = document.createElement("input");
    folderInput.type = "file";
    folderInput.multiple = true;
    folderInput.webkitdirectory = true;

    folderInput.addEventListener("change", async (event) => {
      const target = event.target as HTMLInputElement;
      if (target.files) {
        const files = Array.from(target.files);

        if (files.length === 0) {
          toast.add({
            title: "No files selected",
            description:
              "Cannot upload an empty folder. Please select a folder with files.",
            type: "error",
          });
          return;
        }

        await folderUploadMutation.mutateAsync({
          files,
          folderId: currentFolderId ?? undefined,
        });
      }
    });

    folderInput.click();
  }

  return (
    <Sidebar collapsible="icon" className="group-data-[side=left]:border-r-0">
      <SidebarHeader className="overflow-hidden mt-2">
        <div className="flex gap-2 items-center justify-start">
          <Image src={"/assets/logo.png"} alt="Logo" width={50} height={50} />
          <p className={cn("text-2xl font-semibold", !open && "hidden")}>
            Upfold
          </p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              <SidebarMenuItem className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      open ? (
                        <SidebarMenuButton
                          variant={"outline"}
                          size={"lg"}
                          tooltip="New"
                          className="min-w-8 w-full px-4 [&_svg]:scale-125 gap-4"
                        >
                          <PlusCircle />
                          <span className="font-medium text-base">New</span>
                        </SidebarMenuButton>
                      ) : (
                        <SidebarMenuButton
                          variant={"outline"}
                          tooltip="New"
                          className="[&_svg]:scale-125"
                        >
                          <PlusCircle />
                        </SidebarMenuButton>
                      )
                    }
                  ></DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="min-w-40">
                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        onClick={() => openNewFolderDialog(true)}
                      >
                        <FolderPlus />
                        New Folder
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem onClick={handleFileUpload}>
                        <FileUp />
                        File Upload
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleFolderUpload}>
                        <FolderUp />
                        Folder Upload
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    render={<Link href={item.href} />}
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
    </Sidebar>
  );
}

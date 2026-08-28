"use client";

import { uploadFiles } from "@/actions/file-actions";
import { useUploadFolderMutation } from "@/actions/folder-actions";
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
import { cn } from "@/lib/utils";
import { useDrive } from "@/store/drive-store";
import { useQueryClient } from "@tanstack/react-query";
import {
  FileUp,
  FolderPlus,
  FolderUp,
  Home,
  LinkIcon,
  PlusCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "../ui/toast";

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
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const folderUploadMutation = useUploadFolderMutation();

  async function handleFileUpload() {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.multiple = true;

    fileInput.addEventListener("change", async (event) => {
      const target = event.target as HTMLInputElement;
      if (target.files) {
        const files = Array.from(target.files);

        console.log(files);

        if (files.length === 0) {
          toast.add({
            title: "No files selected",
            description: "Please select at least one file to upload.",
            type: "error",
          });
          return;
        }

        await uploadFiles({
          files,
          folderId: currentFolderId ?? undefined,
          onConcurrentUploadComplete: () => {
            queryClient.invalidateQueries({
              queryKey: currentFolderId
                ? ["folder", currentFolderId]
                : ["folder"],
            });
          },
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
            <SidebarMenu className="gap-2 mt-1">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    render={<Link href={item.href} />}
                    isActive={pathname === item.href}
                    className="data-active:bg-primary data-active:hover:bg-primary/80 data-active:text-primary-foreground"
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

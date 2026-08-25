"use client";

import { useUploadFilesMutation } from "@/actions/file-actions";
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
  Link,
  PlusCircle,
} from "lucide-react";

const items = [
  {
    title: "Home",
    icon: Home,
  },
  {
    title: "Shared",
    icon: Link,
  },
];

export default function DriveSidebar() {
  const { open } = useSidebar();

  const fileUploadMutation = useUploadFilesMutation();

  async function handleFileUpload() {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.multiple = true;

    fileInput.addEventListener("change", async (event) => {
      const target = event.target as HTMLInputElement;
      if (target.files) {
        const files = Array.from(target.files);
        await fileUploadMutation.mutateAsync({ files });
      }
    });

    fileInput.click();
  }

  return (
    <Sidebar collapsible="icon" className="group-data-[side=left]:border-r-0">
      <SidebarHeader className="overflow-hidden">
        <p className="text-2xl font-semibold">Drive</p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              <SidebarMenuItem className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <SidebarMenuButton
                        variant={"outline"}
                        size={"lg"}
                        tooltip="New"
                        className="min-w-8 w-full px-4"
                      >
                        <PlusCircle />
                        <span>New</span>
                      </SidebarMenuButton>
                    }
                  ></DropdownMenuTrigger>
                  <DropdownMenuContent align="center">
                    <DropdownMenuGroup>
                      <DropdownMenuItem className={"flex items-center gap-2"}>
                        <FolderPlus />
                        New Folder
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        className={"flex items-center gap-2"}
                        onClick={handleFileUpload}
                      >
                        <FileUp />
                        File Upload
                      </DropdownMenuItem>
                      <DropdownMenuItem className={"flex items-center gap-2"}>
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
                  <SidebarMenuButton tooltip={item.title}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}

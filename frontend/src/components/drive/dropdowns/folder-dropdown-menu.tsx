import { useDrive } from "@/store/drive-store";
import {
  Edit3,
  EllipsisVertical,
  ExternalLink,
  Eye,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function FolderDropdownMenu({
  folder,
}: Readonly<{ folder: Folder }>) {
  const router = useRouter();
  const openFolderDeleteDialog = useDrive(
    (state) => state.openFolderDeleteDialog,
  );
  const openFolderRenameDialog = useDrive(
    (state) => state.openFolderRenameDialog,
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button size={"icon-lg"} variant="ghost" className="ml-auto mr-2">
            <EllipsisVertical />
          </Button>
        }
      ></DropdownMenuTrigger>
      <DropdownMenuContent align="start" className={"min-w-50"}>
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => router.push(`/drive/folders/${folder.id}`)}
          >
            <Eye />
            Open
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => window.open(`/drive/folders/${folder.id}`, "_blank")}
          >
            <ExternalLink />
            Open in new tab
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => openFolderRenameDialog(folder)}>
            <Edit3 />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => openFolderDeleteDialog(folder)}
          >
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

import {
  Download,
  Edit3,
  EllipsisVertical,
  ExternalLink,
  Eye,
  Folder,
  Share2,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export default function FolderCard({
  id,
  name,
  path,
  createdAt,
}: Readonly<Folder>) {
  const router = useRouter();

  return (
    <div className="bg-card rounded-lg flex items-center justify-start gap-4 border border-border overflow-hidden w-full max-w-auto md:max-w-75">
      <button
        className="flex items-center justify-start overflow-hidden gap-4 w-full cursor-pointer p-4 pr-0"
        type="button"
        onClick={() => {
          router.push(`/drive/folders/${id}`);
        }}
      >
        <Folder className="min-w-6" />
        <Tooltip>
          <TooltipTrigger
            render={<span className="truncate">{name}</span>}
          ></TooltipTrigger>
          <TooltipContent>
            <p>{name}</p>
          </TooltipContent>
        </Tooltip>
      </button>
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
            <DropdownMenuItem>
              <Eye />
              Open
            </DropdownMenuItem>
            <DropdownMenuItem>
              <ExternalLink />
              Open in new tab
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <Download />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit3 />
              Rename
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <Share2 />
              Share
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Trash2 />
              Delete
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

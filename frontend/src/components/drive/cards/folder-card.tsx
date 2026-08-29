import { Folder } from "lucide-react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import FolderDropdownMenu from "../dropdowns/folder-dropdown-menu";

type FolderCardProps = Folder & {
  shared?: boolean;
};

export default function FolderCard({
  id,
  name,
  path,
  createdAt,
  shared = false,
  ...rest
}: Readonly<FolderCardProps>) {
  const router = useRouter();
  const params = useParams();

  return (
    <div className="bg-card rounded-lg flex items-center justify-start gap-4 border border-border overflow-hidden w-full max-w-auto md:max-w-75">
      <button
        className="flex items-center justify-start overflow-hidden gap-4 w-full cursor-pointer p-4 pr-0"
        type="button"
        onClick={() => {
          if (shared) {
            const folderIds =
              typeof params.folderIds === "string"
                ? [params.folderIds]
                : params.folderIds;
            const newFolderIds = folderIds ? [...folderIds, id] : [id];
            const newPath = `/share/${params.token}/folder/${newFolderIds.join("/")}`;
            router.push(newPath);
          } else {
            router.push(`/drive/folders/${id}`);
          }
        }}
      >
        <Folder className="min-w-6" />
        <Tooltip>
          <TooltipTrigger
            render={<span className="truncate">{name}</span>}
          ></TooltipTrigger>
          <TooltipContent>
            <p className="break-all">{name}</p>
          </TooltipContent>
        </Tooltip>
      </button>
      <FolderDropdownMenu folder={{ id, name, path, createdAt, ...rest }} shared={shared} />
    </div>
  );
}

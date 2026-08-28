import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useDrive } from "@/store/drive-store";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  X,
} from "lucide-react";
import { useState } from "react";
import { List, RowComponentProps } from "react-window";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";

export default function UploadsProgressViewer() {
  const [open, setOpen] = useState(true);
  const uploadFileState = useDrive((state) => state.uploadFileState);
  const setUploadFileState = useDrive((state) => state.setUploadFileState);

  return (
    <div
      className={cn(
        "absolute bottom-0 right-4 max-w-sm w-full bg-popover rounded-t-lg border border-border shadow",
        Object.keys(uploadFileState).length === 0 && "hidden",
      )}
    >
      <div className="flex gap-2 items-center justify-start pl-4 p-3 border-b border-border">
        <p className="text-lg font-medium">Uploads</p>
        <div className="flex-1" />
        <Button
          variant={"ghost"}
          size={"icon"}
          className={"[&_svg]:scale-125"}
          onClick={() => setOpen(!open)}
        >
          {open ? <ChevronDown /> : <ChevronUp />}
        </Button>
        <Button
          variant={"ghost"}
          size={"icon"}
          className={"[&_svg]:scale-125"}
          onClick={() => setUploadFileState({})}
        >
          <X />
        </Button>
      </div>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleContent
          className={
            "max-h-80 h-(--collapsible-panel-height) transition-[height] duration-200 ease-[ease-out] data-ending-style:h-0 data-starting-style:h-0 overflow-y-auto my-4 flex flex-col gap-2"
          }
        >
          <List
            rowComponent={FileProgressRow}
            rowCount={Object.keys(uploadFileState).length}
            rowHeight={30}
            rowProps={{
              uploadState: Object.entries(uploadFileState).map(
                ([fileName, state]) => ({
                  fileName,
                  state,
                }),
              ),
            }}
          />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

function FileProgressRow({
  index,
  uploadState,
  style,
}: RowComponentProps<{
  uploadState: {
    fileName: string;
    state: "uploading" | "success" | "error";
  }[];
}>) {
  const currentUploadState = uploadState[index];
  const { fileName, state } = currentUploadState;

  return (
    <div
      key={fileName}
      className="flex items-center justify-between gap-4 px-4"
      style={style}
    >
      <div className="flex-1">
        <p className="text-sm font-medium max-w-65 truncate">{fileName}</p>
      </div>
      {state === "uploading" && <Spinner />}
      {state === "error" && <CircleAlert className="text-red-600" />}
      {state === "success" && <CheckCircle2 className="text-green-600" />}
    </div>
  );
}

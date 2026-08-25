import React from "react";

export default async function Folder(
  props: PageProps<"/drive/folders/[folderId]">,
) {
  const { folderId } = await props.params;
  return (
    <div>
      <h1>Folder ID: {folderId}</h1>
    </div>
  );
}

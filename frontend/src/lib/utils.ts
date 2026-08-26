import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function mimeTypeToIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) {
    return "/assets/icons/file/image.png";
  } else if (mimeType.startsWith("video/")) {
    return "/assets/icons/file/video.png";
  } else if (mimeType.startsWith("audio/")) {
    return "/assets/icons/file/audio.png";
  } else if (mimeType === "application/pdf") {
    return "/assets/icons/file/pdf.png";
  } else if (
    mimeType === "application/msword" ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return "/assets/icons/file/word.png";
  } else if (
    mimeType === "application/vnd.ms-excel" ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    return "/assets/icons/file/excel.png";
  } else if (
    mimeType === "application/vnd.ms-powerpoint" ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  ) {
    return "/assets/icons/file/powerpoint.png";
  } else {
    return "/assets/icons/file/file.png";
  }
}

export function buildTreeFromPaths(paths: string[]): Record<string, any> {
  const tree: any = {};

  for (const path of paths) {
    const parts = path.split("/");

    let currentNode = tree;

    for (const part of parts.slice(0, -1)) {
      if (!currentNode[part]) {
        currentNode[part] = {};
      }
      currentNode = currentNode[part];
    }
  }

  return tree;
}

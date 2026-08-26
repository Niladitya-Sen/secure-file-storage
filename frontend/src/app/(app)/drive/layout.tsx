"use client";

import NewFolderDialog from "@/components/drive/new-folder-dialog";
import PreviewDialog from "@/components/drive/preview-dialog";
import DriveSidebar from "@/components/drive/sidebar";
import AuthProvider from "@/components/providers/auth-provider";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function DriveLayout({ children }: LayoutProps<"/drive">) {
  return (
    <SidebarProvider>
      <main className="h-dvh max-h-dvh flex w-full bg-card">
        <NewFolderDialog />
        <PreviewDialog />
        <AuthProvider>
          <DriveSidebar />
          <section className="bg-background rounded-xl flex flex-col flex-1 ml-2 m-4">
            {children}
          </section>
        </AuthProvider>
      </main>
    </SidebarProvider>
  );
}

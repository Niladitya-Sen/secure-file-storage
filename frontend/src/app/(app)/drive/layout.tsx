import DeleteFileOrFolderDialog from "@/components/drive/dialogs/delete-file-or-folder-dialog";
import NewFolderDialog from "@/components/drive/dialogs/new-folder-dialog";
import PreviewDialog from "@/components/drive/dialogs/preview-dialog";
import RenameFileOrFolderDialog from "@/components/drive/dialogs/rename-file-or-folder-dialog";
import DriveSidebar from "@/components/drive/sidebar";
import AuthProvider from "@/components/providers/auth-provider";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function DriveLayout({ children }: LayoutProps<"/drive">) {
  return (
    <SidebarProvider>
      <AuthProvider>
        <main className="h-dvh max-h-dvh flex w-full bg-sidebar overflow-hidden">
          <NewFolderDialog />
          <PreviewDialog />
          <DeleteFileOrFolderDialog />
          <RenameFileOrFolderDialog />
          <DriveSidebar />
          <section className="bg-background rounded-xl flex flex-col flex-1 ml-2 m-4 border border-border shadow overflow-hidden">
            {children}
          </section>
        </main>
      </AuthProvider>
    </SidebarProvider>
  );
}

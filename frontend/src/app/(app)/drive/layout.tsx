import DriveSidebar from "@/components/drive/sidebar";
import AuthProvider from "@/components/providers/auth-provider";
import { Separator } from "@/components/ui/separator";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function DriveLayout({ children }: LayoutProps<"/drive">) {
  return (
    <SidebarProvider>
      <main className="h-dvh max-h-dvh flex w-full bg-card">
        <AuthProvider>
          <DriveSidebar />
          <section className="flex-1 m-4 bg-background flex flex-col rounded-xl">
            <nav className="flex w-full items-center gap-1 border-b border-border px-4 py-4">
              <SidebarTrigger />
              <Separator orientation="vertical" className={"mx-2"} />
              <h1 className="text-lg font-medium">Home</h1>
            </nav>
            {children}
          </section>
        </AuthProvider>
      </main>
    </SidebarProvider>
  );
}

"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import React from "react";
import { Separator } from "../ui/separator";
import { SidebarTrigger, useSidebar } from "../ui/sidebar";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Ellipsis, Moon, Sun } from "lucide-react";
import { Button } from "../ui/button";
import { useAuth } from "@/store/auth-store";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { MAX_BREADCRUMB_ITEMS } from "@/constants";

type NavbarProps =
  | {
      path: PathSegment[];
    }
  | {
      component: React.ReactNode;
    };

export default function Navbar(props: Readonly<NavbarProps>) {
  const user = useAuth((state) => state.user);
  const logout = useAuth((state) => state.logout);
  const { isMobile } = useSidebar();

  const router = useRouter();
  const { theme, setTheme } = useTheme();

  return (
    <nav className="flex w-full items-center gap-1 border-b border-border px-4 py-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className={"mx-2"} />

      {"path" in props ? <Path path={props.path} /> : props.component}

      <div className="ml-auto flex items-center gap-2">
        <Popover>
          <PopoverTrigger render={<Button variant="outline" />}>
            {isMobile ? user?.email.charAt(0).toUpperCase() : user?.email}
          </PopoverTrigger>
          <PopoverContent align="start">
            <PopoverHeader>
              <PopoverTitle
                className={"text-base font-semibold text-center mb-4"}
              >
                Account
              </PopoverTitle>
              <PopoverDescription className={"sr-only"}>
                Account details
              </PopoverDescription>
            </PopoverHeader>
            <div className="flex flex-col items-center gap-2">
              <div className="bg-muted border border-border size-10 flex items-center justify-center rounded-lg text-lg font-bold text-muted-foreground">
                <span>{user?.email.charAt(0).toUpperCase()}</span>
              </div>
              <p className="text-base font-medium">{user?.email}</p>
            </div>
            <Button
              variant={"destructive"}
              className={"mt-4"}
              onClick={async () => {
                const success = await logout();

                if (success) {
                  router.replace("/auth/login");
                }
              }}
            >
              Log out
            </Button>
          </PopoverContent>
        </Popover>

        <Button
          variant={"outline"}
          size={"icon"}
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
      </div>
    </nav>
  );
}

function Path({
  path,
}: Readonly<{
  path: PathSegment[];
}>) {
  const segmentsToShow = path.slice(-MAX_BREADCRUMB_ITEMS + 1);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink
            className="text-foreground"
            render={<Link href="/drive" />}
          >
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>
        {path.length > 0 && <BreadcrumbSeparator className="text-foreground" />}
        {path.length >= MAX_BREADCRUMB_ITEMS && (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink
                className="text-foreground"
                render={
                  <Link
                    href={`/drive/folders/${path.at(-MAX_BREADCRUMB_ITEMS)?.id}`}
                  />
                }
              >
                <Ellipsis />
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-foreground" />
          </>
        )}
        {segmentsToShow.map((segment, index) => (
          <React.Fragment key={segment.id}>
            <BreadcrumbItem>
              <BreadcrumbLink
                className="text-foreground"
                render={<Link href={`/drive/folders/${segment.id}`} />}
              >
                {segment.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
            {index < segmentsToShow.length - 1 && (
              <BreadcrumbSeparator className="text-foreground" />
            )}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

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
import { SidebarTrigger } from "../ui/sidebar";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Ellipsis, Sun } from "lucide-react";
import { Button } from "../ui/button";
import { useAuth } from "@/store/auth-store";
import { useRouter } from "next/navigation";

const MAX_BREADCRUMB_ITEMS = 5; // includes "Home" and the current folder

export default function Navbar({ path }: Readonly<{ path: PathSegment[] }>) {
  const user = useAuth((state) => state.user);
  const logout = useAuth((state) => state.logout);
  const segmentsToShow = path.slice(-MAX_BREADCRUMB_ITEMS + 1); // -1 because we always show "Home" and the current folder

  const router = useRouter();

  return (
    <nav className="flex w-full items-center gap-1 border-b border-border px-4 py-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className={"mx-2"} />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/drive" />}>
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          {path.length > 0 && <BreadcrumbSeparator />}
          {path.length >= MAX_BREADCRUMB_ITEMS && (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink
                  render={
                    <Link
                      href={`/drive/folders/${path.at(-MAX_BREADCRUMB_ITEMS)?.id}`}
                    />
                  }
                >
                  <Ellipsis />
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          )}
          {segmentsToShow.map((segment, index) => (
            <React.Fragment key={segment.id}>
              <BreadcrumbItem>
                <BreadcrumbLink
                  render={<Link href={`/drive/folders/${segment.id}`} />}
                >
                  {segment.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
              {index < segmentsToShow.length - 1 && <BreadcrumbSeparator />}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-2">
        <Popover>
          <PopoverTrigger render={<Button variant="outline" />}>
            {user?.email}
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

        <Button variant={"outline"} size={"icon"}>
          <Sun />
        </Button>
      </div>
    </nav>
  );
}

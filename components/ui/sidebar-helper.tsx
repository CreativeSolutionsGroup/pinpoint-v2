"use client";

import { cn } from "@/lib/utils";
import { HTMLAttributes, useState } from "react";
import Sidebar from "./sidebar";
import { Button } from "./button";
import { CircleUserRound, SidebarClose, SidebarOpen } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { useUser } from "@stackframe/stack";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import Link from "next/link";

export default function SidebarHelper({
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  const [isOpen, setIsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const user = useUser();

  return (
    <div
      {...props}
      className={cn(
        props.className,
        "w-screen h-screen overflow-hidden flex relative"
      )}
    >
      <div
        className={cn(
          "absolute top-0 left-0 w-60 h-full",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar />
      </div>
      <div className={cn(isOpen ? "w-60" : "w-16", "relative")}>
        <Button
          variant="ghost"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-3 top-3"
        >
          {isOpen ? <SidebarClose /> : <SidebarOpen />}
        </Button>
        <Popover
          open={userMenuOpen}
          onOpenChange={(newState) => user && setUserMenuOpen(newState)}
        >
          <PopoverTrigger asChild>
            <Avatar className="absolute right-4 bottom-4">
              <AvatarImage src={user?.profileImageUrl ?? undefined} />
              <AvatarFallback>
                <Link
                  className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700"
                  href="/handler/sign-in"
                >
                  <CircleUserRound className="w-8 h-8" />
                </Link>
              </AvatarFallback>
            </Avatar>
          </PopoverTrigger>
          <PopoverContent align="start" className="mb-1">
            {user && (
              <div className="p-2">
                <h4 className="font-semibold">{user.displayName}</h4>
                <p className="text-sm text-muted-foreground">
                  {user.primaryEmail}
                </p>
                <Button className="w-full mt-2" asChild>
                  <Link
                    href="/handler/sign-out"
                    className="text-sm text-muted-foreground"
                  >
                    Sign out
                  </Link>
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>
      <main className="flex-1">{children}</main>
    </div>
  );
}

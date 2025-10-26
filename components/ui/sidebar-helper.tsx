"use client";

import { cn } from "@/lib/utils";
import { HTMLAttributes, useState } from "react";
import Sidebar from "./sidebar";
import { Button } from "./button";
import { SidebarClose, SidebarOpen } from "lucide-react";
import { Avatar, AvatarImage } from "./avatar";

export default function SidebarHelper({
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  const [isOpen, setIsOpen] = useState(false);

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
        <Avatar className="absolute right-4 bottom-4">
          <div
            aria-hidden="true"
            className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse"
          />
        </Avatar>
      </div>
      <main>{children}</main>
    </div>
  );
}

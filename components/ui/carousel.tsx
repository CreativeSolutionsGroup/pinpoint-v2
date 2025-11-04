"use client";

import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

export default function Carousel({
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn(
        props.className,
        "flex overflow-x-auto snap-x snap-mandatory"
      )}
    >
      {children}
    </div>
  );
}

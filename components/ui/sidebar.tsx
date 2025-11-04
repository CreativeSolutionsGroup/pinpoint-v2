import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

export default function Sidebar({ ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn(props.className, "border-r w-full h-full")}
    ></div>
  );
}

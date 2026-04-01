import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none",
        variant === "default" && "border-transparent bg-rose-500 text-white shadow",
        variant === "secondary" && "border-transparent bg-white/10 text-slate-200",
        variant === "outline" && "border-rose-500/50 text-rose-400 bg-rose-500/10",
        className
      )}
      {...props}
    />
  );
}

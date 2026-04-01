import * as React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
          variant === "default" && "bg-rose-500 text-white hover:bg-rose-400 shadow-lg shadow-rose-500/25",
          variant === "outline" && "border border-white/10 bg-white/5 text-white hover:bg-white/10",
          variant === "ghost" && "text-slate-400 hover:text-white hover:bg-white/5",
          size === "default" && "h-11 px-6 py-2 text-sm",
          size === "sm" && "h-8 px-4 text-xs",
          size === "lg" && "h-14 px-8 text-base",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

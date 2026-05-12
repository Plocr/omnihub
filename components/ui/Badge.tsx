import { cn } from "@/lib/utils";
import { type HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "success" | "warning" | "secondary";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
        {
          default: "bg-accent text-accent-foreground",
          primary: "bg-primary/10 text-primary",
          success: "bg-success/10 text-success",
          warning: "bg-warning/10 text-warning",
          secondary: "bg-secondary text-secondary-foreground",
        }[variant],
        className,
      )}
      {...props}
    />
  );
}

export { Badge };

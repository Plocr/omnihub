import { Badge } from "@/components/ui/Badge";
import { type ComponentProps } from "react";

const sourceTypeConfig: Record<
  string,
  { variant: ComponentProps<typeof Badge>["variant"]; label: string }
> = {
  api: { variant: "primary", label: "API" },
  skill: { variant: "success", label: "技能" },
  tool: { variant: "warning", label: "工具" },
  article: { variant: "secondary", label: "文章" },
};

export function SourceBadge({ type }: { type: string }) {
  const config = sourceTypeConfig[type] ?? {
    variant: "secondary" as const,
    label: type,
  };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

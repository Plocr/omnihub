import Link from "next/link";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/Card";
import { SourceBadge } from "@/components/SourceBadge";
import { timeAgo, truncate } from "@/lib/utils";

interface FeedCardProps {
  id: string;
  title: string;
  description?: string | null;
  source_type: string;
  category?: string | null;
  tags?: string[];
  published_at?: string | null;
  popularity?: number | null;
  link: string;
}

export function FeedCard({
  id,
  title,
  description,
  source_type,
  category,
  tags,
  published_at,
  popularity,
}: FeedCardProps) {
  return (
    <Link href={`/items/${id}`} className="block transition-transform hover:-translate-y-0.5">
      <Card className="h-full cursor-pointer transition-shadow hover:shadow-md">
        <CardContent className="flex flex-col gap-2 p-4">
          <div className="flex items-center gap-2">
            <SourceBadge type={source_type} />
            {category && (
              <span className="text-xs text-muted-foreground capitalize">
                {category.replace("-", " & ")}
              </span>
            )}
          </div>

          <CardTitle className="line-clamp-2">{title}</CardTitle>

          {description && (
            <CardDescription className="line-clamp-2">
              {truncate(description, 120)}
            </CardDescription>
          )}

          <div className="mt-auto flex items-center gap-3 pt-2 text-xs text-muted-foreground">
            {published_at && <span>{timeAgo(published_at)}</span>}
            {popularity != null && popularity > 0 && (
              <span>★ {popularity}</span>
            )}
            {tags && tags.length > 0 && (
              <span className="truncate">
                {tags.slice(0, 3).join(" · ")}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

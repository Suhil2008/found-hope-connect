import { CalendarDays, ImageOff, MapPin, Tag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, STATUS_LABELS, type ItemWithImage } from "@/lib/items";

export function StatusBadge({ status }: { status: string }) {
  const label = STATUS_LABELS[status] ?? status;
  const className =
    status === "recovered"
      ? "bg-success text-success-foreground"
      : status === "in_progress"
        ? "bg-accent text-accent-foreground"
        : status === "closed"
          ? "bg-muted text-muted-foreground"
          : "bg-primary text-primary-foreground";
  return <Badge className={className}>{label}</Badge>;
}

export function ItemCard({ item }: { item: ItemWithImage }) {
  return (
    <Card className="overflow-hidden py-0 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-lift)]">
      <div className="relative aspect-[4/3] w-full bg-secondary">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.item_name}
            loading="lazy"
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImageOff className="size-6" />
            <span className="text-xs">No photo provided</span>
          </div>
        )}
        <div className="absolute left-3 top-3 flex gap-2">
          <Badge variant="outline" className="bg-card/90 capitalize">
            {item.report_type}
          </Badge>
          <StatusBadge status={item.status} />
        </div>
      </div>

      <CardContent className="space-y-3 p-5">
        <h3 className="text-lg leading-snug">{item.item_name}</h3>
        <p className="line-clamp-3 text-sm text-muted-foreground">{item.description}</p>
        <dl className="space-y-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Tag className="size-4 shrink-0" />
            <dd>{item.category}</dd>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="size-4 shrink-0" />
            <dd className="truncate">{item.location}</dd>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4 shrink-0" />
            <dd>{formatDate(item.event_date)}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}

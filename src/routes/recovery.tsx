import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ClipboardList, Mail, MapPin, Phone } from "lucide-react";
import { useMemo } from "react";

import { StatusBadge } from "@/components/item-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, itemsQueryOptions, RECOVERY_STATUSES } from "@/lib/items";

export const Route = createFileRoute("/recovery")({
  head: () => ({
    meta: [
      { title: "Recovery status of claimed items — Found Tomorrow" },
      {
        name: "description",
        content:
          "Track items being returned to their owners: in-progress handovers, recovered belongings and closed cases with full item details.",
      },
      { property: "og:title", content: "Recovery status of claimed items — Found Tomorrow" },
      {
        property: "og:description",
        content: "Follow every item on its way back to its owner, from first claim to recovered.",
      },
    ],
  }),
  component: RecoveryPage,
});

function RecoveryPage() {
  const { data, isPending, error, refetch } = useQuery(itemsQueryOptions);

  const records = useMemo(
    () => (data ?? []).filter((item) => RECOVERY_STATUSES.includes(item.status)),
    [data],
  );

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <div className="max-w-2xl">
          <h1 className="text-3xl sm:text-4xl">Recovery</h1>
          <p className="mt-3 text-muted-foreground">
            Items currently on their way back to their owners, and the ones already reunited.
          </p>
        </div>

        {isPending ? (
          <div className="mt-10 space-y-4">
            {[0, 1, 2].map((key) => (
              <Skeleton key={key} className="h-40 w-full rounded-2xl" />
            ))}
          </div>
        ) : error ? (
          <div className="mt-12 flex flex-col items-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-secondary">
              <AlertCircle className="size-6" />
            </span>
            <h2 className="mt-4 text-xl">We couldn't load recovery records</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Something went wrong while reaching our records. Please try again.
            </p>
            <Button className="mt-6" onClick={() => void refetch()}>
              Try again
            </Button>
          </div>
        ) : records.length === 0 ? (
          <div className="mt-12 flex flex-col items-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-secondary">
              <ClipboardList className="size-6" />
            </span>
            <h2 className="mt-4 text-xl">No recovery records found.</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Once a reported item is claimed or handed back, it will appear here with its status.
            </p>
            <Button asChild className="mt-6">
              <Link to="/explore">Browse all items</Link>
            </Button>
          </div>
        ) : (
          <ul className="mt-10 space-y-4">
            {records.map((item) => (
              <li key={item.id}>
                <Card className="overflow-hidden py-0 shadow-[var(--shadow-card)]">
                  <CardContent className="flex flex-col gap-5 p-5 sm:flex-row sm:p-6">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.item_name}
                        loading="lazy"
                        className="h-40 w-full rounded-xl object-cover sm:h-28 sm:w-40"
                      />
                    ) : null}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-xl">{item.item_name}</h2>
                        <StatusBadge status={item.status} />
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">
                          {item.report_type} · {item.category}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                      <dl className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="size-4 shrink-0" />
                          <dd className="truncate">
                            {item.location} · {formatDate(item.event_date)}
                          </dd>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="size-4 shrink-0" />
                          <dd className="truncate">
                            {item.contact_name} · {item.contact_email}
                          </dd>
                        </div>
                        {item.contact_phone ? (
                          <div className="flex items-center gap-2">
                            <Phone className="size-4 shrink-0" />
                            <dd>{item.contact_phone}</dd>
                          </div>
                        ) : null}
                      </dl>
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

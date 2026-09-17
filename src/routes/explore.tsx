import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PackageSearch, SearchX } from "lucide-react";
import { useMemo, useState } from "react";

import { ItemCard } from "@/components/item-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { CATEGORIES, itemsQueryOptions } from "@/lib/items";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore lost & found items — Found Tomorrow" },
      {
        name: "description",
        content:
          "Browse every reported lost and found item with photos, categories, locations and recovery status. Search and filter to find yours.",
      },
      { property: "og:title", content: "Explore lost & found items — Found Tomorrow" },
      {
        property: "og:description",
        content: "Search reported lost and found items by name, category, location and status.",
      },
    ],
  }),
  component: ExplorePage,
});

function ExplorePage() {
  const { data, isPending, error, refetch } = useQuery(itemsQueryOptions);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [type, setType] = useState("all");

  const items = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (data ?? []).filter((item) => {
      const matchesTerm =
        term.length === 0 ||
        item.item_name.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        item.location.toLowerCase().includes(term);
      const matchesCategory = category === "all" || item.category === category;
      const matchesType = type === "all" || item.report_type === type;
      return matchesTerm && matchesCategory && matchesType;
    });
  }, [data, search, category, type]);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <div className="max-w-2xl">
          <h1 className="text-3xl sm:text-4xl">Explore reported items</h1>
          <p className="mt-3 text-muted-foreground">
            Every item people have reported lost or found. Search by name, place or description.
          </p>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search items, places, details…"
              aria-label="Search items"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger aria-label="Filter by category">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {CATEGORIES.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger aria-label="Filter by lost or found">
              <SelectValue placeholder="Lost or found" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Lost & found</SelectItem>
              <SelectItem value="lost">Lost items</SelectItem>
              <SelectItem value="found">Found items</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isPending ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((key) => (
              <div key={key} className="space-y-3">
                <Skeleton className="aspect-[4/3] w-full rounded-xl" />
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          <EmptyState
            icon={<SearchX className="size-6" />}
            title="We couldn't load the items"
            body="Something went wrong while reaching our records. Please try again."
            action={<Button onClick={() => void refetch()}>Try again</Button>}
          />
        ) : items.length === 0 ? (
          <EmptyState
            icon={<PackageSearch className="size-6" />}
            title={data && data.length > 0 ? "No items match your search" : "No items reported yet"}
            body={
              data && data.length > 0
                ? "Try a different word, category or switch between lost and found."
                : "Be the first to add a report and help someone find what they lost."
            }
            action={
              <Button asChild>
                <Link to="/report-item">Report an item</Link>
              </Button>
            }
          />
        ) : (
          <>
            <p className="mt-8 text-sm text-muted-foreground">
              Showing {items.length} of {data?.length ?? 0} items
            </p>
            <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mt-12 flex flex-col items-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
        {icon}
      </span>
      <h2 className="mt-4 text-xl">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{body}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

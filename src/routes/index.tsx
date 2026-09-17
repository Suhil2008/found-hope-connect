import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, HandHeart, MapPin, ShieldCheck } from "lucide-react";

import heroImage from "@/assets/hero-items.jpg";
import { ItemCard } from "@/components/item-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { itemsQueryOptions, RECOVERY_STATUSES } from "@/lib/items";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Found Tomorrow — Report and recover lost items" },
      {
        name: "description",
        content:
          "A community lost & found board. Report an item you lost or found, browse everything reported nearby, and follow items on their way back to their owners.",
      },
      { property: "og:title", content: "Found Tomorrow — Report and recover lost items" },
      {
        property: "og:description",
        content: "Report lost or found items, explore the board and track recoveries.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { data, isPending } = useQuery(itemsQueryOptions);
  const recent = (data ?? []).slice(0, 3);
  const recoveredCount = (data ?? []).filter((item) => item.status === "recovered").length;
  const activeCount = (data ?? []).filter((item) => !RECOVERY_STATUSES.includes(item.status)).length;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <section className="border-b border-border/70 bg-secondary/40">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-20">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Community lost &amp; found
              </span>
              <h1 className="mt-5 text-4xl leading-[1.1] sm:text-5xl lg:text-6xl">
                Lost today. Found tomorrow.
              </h1>
              <p className="mt-5 max-w-lg text-lg text-muted-foreground">
                Report what you lost or found, and let the people around you help close the gap.
                Every report is public, searchable and free.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link to="/report-item">
                    Report an item <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/explore">Explore items</Link>
                </Button>
              </div>
              <dl className="mt-10 flex flex-wrap gap-8">
                <div>
                  <dt className="text-sm text-muted-foreground">Active reports</dt>
                  <dd className="font-display text-2xl">{isPending ? "—" : activeCount}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Items recovered</dt>
                  <dd className="font-display text-2xl">{isPending ? "—" : recoveredCount}</dd>
                </div>
              </dl>
            </div>
            <img
              src={heroImage}
              alt="Everyday lost belongings laid out on a table: a wallet, keys, glasses, a dog collar and a scarf"
              width={1600}
              height={1200}
              className="w-full rounded-3xl object-cover shadow-[var(--shadow-lift)]"
            />
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: <HandHeart className="size-5" />,
                title: "Report in a minute",
                body: "Add a photo, a place and a date. That is usually all it takes to be recognised.",
              },
              {
                icon: <MapPin className="size-5" />,
                title: "Search by place",
                body: "Filter the board by category, location or whether an item was lost or found.",
              },
              {
                icon: <ShieldCheck className="size-5" />,
                title: "Follow the handover",
                body: "Recovery keeps everyone updated from first claim through to reunited.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]"
              >
                <span className="flex size-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                  {feature.icon}
                </span>
                <h2 className="mt-4 text-xl">{feature.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{feature.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-2xl sm:text-3xl">Latest reports</h2>
            <Button asChild variant="ghost">
              <Link to="/explore">
                See all items <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {isPending
              ? [0, 1, 2].map((key) => <Skeleton key={key} className="h-80 w-full rounded-xl" />)
              : recent.map((item) => <ItemCard key={item.id} item={item} />)}
          </div>

          {!isPending && recent.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center">
              <h3 className="text-xl">Nothing reported yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Add the first report and start the board off.
              </p>
              <Button asChild className="mt-6">
                <Link to="/report-item">Report an item</Link>
              </Button>
            </div>
          ) : null}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

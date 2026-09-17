import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-card">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="font-display text-base text-foreground">Found Tomorrow</p>
        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          <Link to="/explore" className="transition-colors hover:text-foreground">
            Explore
          </Link>
          <Link to="/recovery" className="transition-colors hover:text-foreground">
            Recovery
          </Link>
          <Link to="/report-item" className="transition-colors hover:text-foreground">
            Report item
          </Link>
        </nav>
        <p>Reuniting people with what matters.</p>
      </div>
    </footer>
  );
}

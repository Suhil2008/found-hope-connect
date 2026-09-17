import { supabase } from "@/integrations/supabase/client";
import { queryOptions } from "@tanstack/react-query";

export type Item = {
  id: string;
  item_name: string;
  category: string;
  description: string;
  report_type: string;
  event_date: string;
  location: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  image_path: string | null;
  status: string;
  created_at: string;
};

export type ItemWithImage = Item & { imageUrl: string | null };

export const CATEGORIES = [
  "Electronics",
  "Wallets & IDs",
  "Keys",
  "Bags & Luggage",
  "Clothing",
  "Jewellery",
  "Documents",
  "Pets",
  "Other",
] as const;

export const STATUS_LABELS: Record<string, string> = {
  open: "Open",
  in_progress: "In progress",
  recovered: "Recovered",
  closed: "Closed",
};

export const RECOVERY_STATUSES = ["in_progress", "recovered", "closed"];

const IMAGE_BUCKET = "item-images";

async function withImages(items: Item[]): Promise<ItemWithImage[]> {
  const paths = items.map((i) => i.image_path).filter((p): p is string => Boolean(p));
  const urls = new Map<string, string>();

  if (paths.length > 0) {
    const { data } = await supabase.storage.from(IMAGE_BUCKET).createSignedUrls(paths, 60 * 60);
    for (const entry of data ?? []) {
      if (entry.path && entry.signedUrl) urls.set(entry.path, entry.signedUrl);
    }
  }

  return items.map((item) => ({
    ...item,
    imageUrl: item.image_path ? (urls.get(item.image_path) ?? null) : null,
  }));
}

export async function fetchItems(): Promise<ItemWithImage[]> {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return withImages((data ?? []) as Item[]);
}

export const itemsQueryOptions = queryOptions({
  queryKey: ["items"],
  queryFn: fetchItems,
  staleTime: 30_000,
});

export async function uploadItemImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw new Error(error.message);
  return path;
}

export function formatDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

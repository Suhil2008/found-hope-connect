import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2, Upload } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, uploadItemImage } from "@/lib/items";

export const Route = createFileRoute("/report-item")({
  head: () => ({
    meta: [
      { title: "Report a lost or found item — Found Tomorrow" },
      {
        name: "description",
        content:
          "Report an item you lost or found in a minute: add a photo, category, place, date and how people can reach you.",
      },
      { property: "og:title", content: "Report a lost or found item — Found Tomorrow" },
      {
        property: "og:description",
        content: "Add a lost or found item report with photo, location, date and contact details.",
      },
    ],
  }),
  component: ReportItemPage,
});

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

const schema = z.object({
  report_type: z.enum(["lost", "found"]),
  item_name: z.string().trim().min(2, "Please give the item a short name").max(120),
  category: z.string().min(1, "Choose a category"),
  description: z
    .string()
    .trim()
    .min(20, "Please add at least 20 characters so people can recognise it")
    .max(1000),
  event_date: z.string().min(1, "Choose the date"),
  location: z.string().trim().min(3, "Where was it lost or found?").max(200),
  contact_name: z.string().trim().min(2, "Please add your name").max(100),
  contact_email: z.string().trim().email("Enter a valid email address").max(255),
  contact_phone: z.string().trim().max(30).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

function ReportItemPage() {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      report_type: "lost",
      item_name: "",
      category: "",
      description: "",
      event_date: "",
      location: "",
      contact_name: "",
      contact_email: "",
      contact_phone: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      let imagePath: string | null = null;
      if (file) imagePath = await uploadItemImage(file);

      const { error } = await supabase.from("items").insert({
        report_type: values.report_type,
        item_name: values.item_name,
        category: values.category,
        description: values.description,
        event_date: values.event_date,
        location: values.location,
        contact_name: values.contact_name,
        contact_email: values.contact_email,
        contact_phone: values.contact_phone ? values.contact_phone : null,
        image_path: imagePath,
        status: "open",
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["items"] });
      setSubmitted(true);
      form.reset();
      setFile(null);
      toast.success("Report submitted", { description: "Your item is now listed in Explore." });
    },
    onError: (error: Error) => {
      toast.error("We couldn't save your report", {
        description: error.message || "Please check your details and try again.",
      });
    },
  });

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="mx-auto flex w-full max-w-2xl flex-1 items-center px-4 py-16 sm:px-6">
          <Card className="w-full shadow-[var(--shadow-card)]">
            <CardContent className="flex flex-col items-center gap-4 p-8 text-center sm:p-12">
              <span className="flex size-14 items-center justify-center rounded-full bg-success text-success-foreground">
                <CheckCircle2 className="size-7" />
              </span>
              <h1 className="text-2xl sm:text-3xl">Thank you — your report is live</h1>
              <p className="max-w-md text-muted-foreground">
                We've added your item to the public list. If someone recognises it, they'll reach you
                using the contact details you shared.
              </p>
              <div className="mt-2 flex flex-wrap justify-center gap-3">
                <Button asChild>
                  <Link to="/explore">View it in Explore</Link>
                </Button>
                <Button variant="outline" onClick={() => setSubmitted(false)}>
                  Report another item
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <div className="max-w-2xl">
          <h1 className="text-3xl sm:text-4xl">Report an item</h1>
          <p className="mt-3 text-muted-foreground">
            Tell us what you lost or found. The more detail you add, the easier it is to match.
          </p>
        </div>

        <Card className="mt-8 shadow-[var(--shadow-card)]">
          <CardContent className="p-5 sm:p-8">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
                className="space-y-7"
                noValidate
              >
                <FormField
                  control={form.control}
                  name="report_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Is this item lost or found?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          value={field.value}
                          onValueChange={field.onChange}
                          className="grid gap-3 sm:grid-cols-2"
                        >
                          {(["lost", "found"] as const).map((option) => (
                            <label
                              key={option}
                              className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-background p-4 text-sm font-medium capitalize transition-colors hover:bg-secondary has-[button[data-state=checked]]:border-primary"
                            >
                              <RadioGroupItem value={option} />
                              I {option} this item
                            </label>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="item_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Item name</FormLabel>
                        <FormControl>
                          <Input placeholder="Black leather wallet" maxLength={120} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Choose a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CATEGORIES.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={5}
                          maxLength={1000}
                          placeholder="Colour, brand, marks, what was inside…"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Avoid sharing sensitive numbers such as card or ID numbers.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="event_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date lost or found</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="Central Station, Platform 4" maxLength={200} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="contact_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your name</FormLabel>
                        <FormControl>
                          <Input placeholder="Alex Carter" maxLength={100} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contact_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="you@example.com" maxLength={255} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="contact_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 415 555 0142" maxLength={30} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel htmlFor="item-photo">Photo (optional)</FormLabel>
                  <label
                    htmlFor="item-photo"
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border bg-background p-4 text-sm text-muted-foreground transition-colors hover:bg-secondary"
                  >
                    <Upload className="size-4 shrink-0" />
                    <span className="truncate">
                      {file ? file.name : "Add a photo of the item (JPG or PNG, up to 10 MB)"}
                    </span>
                  </label>
                  <input
                    id="item-photo"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(event) => {
                      const selected = event.target.files?.[0] ?? null;
                      if (selected && selected.size > MAX_IMAGE_BYTES) {
                        setFileError("That photo is larger than 10 MB. Please choose a smaller one.");
                        setFile(null);
                        return;
                      }
                      setFileError(null);
                      setFile(selected);
                    }}
                  />
                  {fileError ? <p className="text-sm text-destructive">{fileError}</p> : null}
                </div>

                <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    Your contact details are shown publicly so people can reach you.
                  </p>
                  <Button type="submit" size="lg" disabled={mutation.isPending}>
                    {mutation.isPending ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Submitting…
                      </>
                    ) : (
                      "Submit report"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}

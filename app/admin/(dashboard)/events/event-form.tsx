"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner"; // Assuming you have sonner or use-toast

// 스키마 정의
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  slug: z
    .string()
    .min(2, {
      message: "Slug must be at least 2 characters.",
    })
    .regex(/^[a-z0-9-]+$/, {
      message:
        "Slug must contain only lowercase letters, numbers, and hyphens.",
    }),
  location: z.string().min(1, "Location is required"),
  meta_title: z.string().min(1, "Meta Title is required"),
  meta_description: z.string().min(1, "Meta Description is required"),
  meta_image: z
    .union([z.string().url("Must be a valid URL"), z.literal("")])
    .optional(),
  comment: z.string().nullish(),
});

interface EventFormProps {
  initialData?: z.infer<typeof formSchema> & { id: string };
}

export function EventForm({ initialData }: EventFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      slug: "",
      location: "",
      meta_title: "",
      meta_description: "",
      meta_image: "",
      comment: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const payload = {
        ...values,
        color_from: "#000000",
        color_to: "#000000",
      };
      if (initialData) {
        const { error } = await supabase
          .from("events")
          .update(payload as never)
          .eq("id", initialData.id);

        if (error) throw error;
        toast.success("Event updated successfully.");
      } else {
        const { error } = await supabase
          .from("events")
          .insert(payload as never);

        if (error) throw error;
        toast.success("Event created successfully.");
      }

      if (initialData) {
        router.back();
      } else {
        router.push("/admin/events");
      }
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 w-full bg-white dark:bg-slate-950 p-6 rounded-lg border"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Name</FormLabel>
              <FormControl>
                <Input placeholder="Muju Granfondo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug (URL)</FormLabel>
                <FormControl>
                  <Input placeholder="muju" {...field} />
                </FormControl>
                <FormDescription>
                  Unique identifier for URLs (e.g., kfondo.cc/muju)
                </FormDescription>
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
                  <Input placeholder="Muju, Jeonbuk" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4 border-t pt-4">
          <h3 className="font-medium text-sm text-slate-500">SEO & Metadata</h3>

          <FormField
            control={form.control}
            name="meta_title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meta Title</FormLabel>
                <FormControl>
                  <Input placeholder="Muju Granfondo 2024" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="meta_description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meta Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Join us for the ultimate riding experience..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="meta_image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meta Image URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Internal Comment</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Notes for admins..."
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? "Saving..."
              : initialData
              ? "Update Event"
              : "Create Event"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

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
import { toast } from "sonner";
import { Save, X } from "lucide-react";

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

type EventFormValues = z.infer<typeof formSchema>;

type EventFormProps = {
  initialData?: EventFormValues & { id: string };
  editMode?: boolean;
  onEditModeChange?: (editing: boolean) => void;
};

const defaultValues: EventFormValues = {
  name: "",
  slug: "",
  location: "",
  meta_title: "",
  meta_description: "",
  meta_image: "",
  comment: "",
};

function BasicInfoView({ data }: { data: EventFormValues }) {
  return (
    <div className="space-y-6 w-full bg-white dark:bg-slate-950 p-6 rounded-lg border">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">대회명 *</p>
          <p className="text-sm">{data.name}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            개최 지역 *
          </p>
          <p className="text-sm">{data.location}</p>
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">
          URL 슬러그 *
        </p>
        <p className="text-sm">{data.slug}</p>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">코멘트</p>
        <p className="text-sm">{data.comment || "-"}</p>
      </div>
      <div className="space-y-4 border-t pt-4">
        <h3 className="font-medium text-sm text-slate-500">메타 정보 (SEO)</h3>
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            메타 타이틀
          </p>
          <p className="text-sm">{data.meta_title}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">메타 설명</p>
          <p className="text-sm">{data.meta_description}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            메타 이미지 URL
          </p>
          <p className="text-sm break-all">{data.meta_image || "-"}</p>
        </div>
      </div>
    </div>
  );
}

export function EventForm({
  initialData,
  editMode = false,
  onEditModeChange,
}: EventFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const form = useForm<EventFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || defaultValues,
  });

  const isViewMode = Boolean(initialData && !editMode);

  async function onSubmit(values: EventFormValues) {
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
        toast.success("이벤트가 수정되었습니다.");
        onEditModeChange?.(false);
      } else {
        const { error } = await supabase
          .from("events")
          .insert(payload as never);

        if (error) throw error;
        toast.success("이벤트가 생성되었습니다.");
        router.push("/admin/events");
      }
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("저장에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  if (isViewMode && initialData) {
    return (
      <BasicInfoView
        data={{
          name: initialData.name,
          slug: initialData.slug,
          location: initialData.location,
          meta_title: initialData.meta_title,
          meta_description: initialData.meta_description,
          meta_image: initialData.meta_image ?? "",
          comment: initialData.comment ?? "",
        }}
      />
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 w-full bg-white dark:bg-slate-950 p-6 rounded-lg border relative"
      >
        {initialData && onEditModeChange && (
          <div className="absolute right-6 top-6 flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onEditModeChange(false)}
            >
              <X className="mr-1 h-4 w-4" />
              취소
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              size="sm"
              className="bg-primary text-primary-foreground"
            >
              <Save className="mr-1 h-4 w-4" />
              {isLoading ? "저장 중..." : "저장"}
            </Button>
          </div>
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>대회명 *</FormLabel>
              <FormControl>
                <Input placeholder="무주 그란폰도" {...field} />
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
                <FormLabel>URL 슬러그 *</FormLabel>
                <FormControl>
                  <Input placeholder="muju" {...field} />
                </FormControl>
                <FormDescription>
                  URL용 식별자 (예: kfondo.cc/muju)
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
                <FormLabel>개최 지역 *</FormLabel>
                <FormControl>
                  <Input placeholder="무주" {...field} />
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
              <FormLabel>코멘트</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="관리자용 메모..."
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4 border-t pt-4">
          <h3 className="font-medium text-sm text-slate-500">
            메타 정보 (SEO)
          </h3>

          <FormField
            control={form.control}
            name="meta_title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>메타 타이틀</FormLabel>
                <FormControl>
                  <Input placeholder="무주 그란폰도 2024" {...field} />
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
                <FormLabel>메타 설명</FormLabel>
                <FormControl>
                  <Textarea placeholder="대회 소개..." {...field} />
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
                <FormLabel>메타 이미지 URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {!initialData && (
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "저장 중..." : "이벤트 생성"}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}

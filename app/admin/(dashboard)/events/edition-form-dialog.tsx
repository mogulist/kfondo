"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { EventEditionRow } from "@/lib/database.types";
import { EDITION_STATUS_LABELS } from "./types";

const editionSchema = z.object({
  year: z.coerce.number().min(2000).max(2100),
  date: z.string().min(1, "개최일을 입력하세요"),
  status: z.enum(["upcoming", "completed", "ready", "preparing"]),
  url: z.string().optional(),
  records_blob_url: z.string().optional(),
  sorted_records_blob_url: z.string().optional(),
  comment: z.string().optional(),
});

type EditionFormValues = z.infer<typeof editionSchema>;

type EditionFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  edition?: EventEditionRow | null;
  onSuccess: () => void;
};

export function EditionFormDialog({
  open,
  onOpenChange,
  eventId,
  edition,
  onSuccess,
}: EditionFormDialogProps) {
  const supabase = createClient();

  const form = useForm<EditionFormValues>({
    resolver: zodResolver(editionSchema),
    defaultValues: {
      year: new Date().getFullYear(),
      date: "",
      status: "upcoming",
      url: "",
      records_blob_url: "",
      sorted_records_blob_url: "",
      comment: "",
    },
  });

  useEffect(() => {
    if (open && edition) {
      const dateStr = edition.date;
      form.reset({
        year: edition.year,
        date: dateStr,
        status: edition.status,
        url: edition.url ?? "",
        records_blob_url: edition.records_blob_url ?? "",
        sorted_records_blob_url: edition.sorted_records_blob_url ?? "",
        comment: edition.comment ?? "",
      });
    } else if (open && !edition) {
      form.reset({
        year: new Date().getFullYear(),
        date: "",
        status: "upcoming",
        url: "",
        records_blob_url: "",
        sorted_records_blob_url: "",
        comment: "",
      });
    }
  }, [open, edition, form]);

  async function onSubmit(values: EditionFormValues) {
    try {
      if (edition) {
        const { error } = await supabase
          .from("event_editions")
          .update({
            year: values.year,
            date: values.date,
            status: values.status,
            url: values.url || null,
            records_blob_url: values.records_blob_url || null,
            sorted_records_blob_url: values.sorted_records_blob_url || null,
            comment: values.comment || null,
          })
          .eq("id", edition.id);

        if (error) throw error;
        toast.success("에디션이 수정되었습니다.");
      } else {
        const { error } = await supabase.from("event_editions").insert({
          event_id: eventId,
          year: values.year,
          date: values.date,
          status: values.status,
          url: values.url || null,
          records_blob_url: values.records_blob_url || null,
          sorted_records_blob_url: values.sorted_records_blob_url || null,
          comment: values.comment || null,
        });

        if (error) throw error;
        toast.success("에디션이 추가되었습니다.");
      }
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("저장에 실패했습니다.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {edition ? "에디션 편집" : "새 에디션 추가"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>연도 *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={2000}
                        max={2100}
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>개최일 *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>상태 *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="상태 선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(
                        Object.keys(EDITION_STATUS_LABELS) as Array<
                          keyof typeof EDITION_STATUS_LABELS
                        >
                      ).map((key) => (
                        <SelectItem key={key} value={key}>
                          {EDITION_STATUS_LABELS[key]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>대회 URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://..."
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="records_blob_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>원본 기록 파일 URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://..."
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sorted_records_blob_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>정렬된 기록 파일 URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://..."
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                취소
              </Button>
              <Button
                type="submit"
                className="bg-primary text-primary-foreground"
              >
                저장
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

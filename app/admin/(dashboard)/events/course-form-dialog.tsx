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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
import type { CourseRow } from "@/lib/database.types";
import type { EventEditionWithCourses } from "./types";

const courseSchema = z.object({
  edition_id: z.string().uuid("에디션을 선택하세요"),
  course_type: z.string().min(1, "코스 타입을 입력하세요"),
  name: z.string().min(1, "코스명을 입력하세요"),
  distance: z.coerce.number().min(0),
  elevation: z.coerce.number().min(0),
  registered_count: z.coerce.number().min(0).optional(),
});

type CourseFormValues = z.infer<typeof courseSchema>;

type CourseFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editions: EventEditionWithCourses[];
  course?: CourseRow | null;
  onSuccess: () => void;
};

export function CourseFormDialog({
  open,
  onOpenChange,
  editions,
  course,
  onSuccess,
}: CourseFormDialogProps) {
  const supabase = createClient();

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      edition_id: "",
      course_type: "",
      name: "",
      distance: 0,
      elevation: 0,
      registered_count: 0,
    },
  });

  useEffect(() => {
    if (open && course) {
      form.reset({
        edition_id: course.edition_id,
        course_type: course.course_type,
        name: course.name,
        distance: course.distance,
        elevation: course.elevation,
        registered_count: course.registered_count ?? 0,
      });
    } else if (open && editions.length > 0) {
      form.reset({
        edition_id: editions[0]?.id ?? "",
        course_type: "",
        name: "",
        distance: 0,
        elevation: 0,
        registered_count: 0,
      });
    }
  }, [open, course, editions, form]);

  async function onSubmit(values: CourseFormValues) {
    try {
      if (course) {
        const { error } = await supabase
          .from("courses")
          .update({
            edition_id: values.edition_id,
            course_type: values.course_type,
            name: values.name,
            distance: values.distance,
            elevation: values.elevation,
            registered_count: values.registered_count ?? 0,
          })
          .eq("id", course.id);

        if (error) throw error;
        toast.success("코스가 수정되었습니다.");
      } else {
        const { error } = await supabase.from("courses").insert({
          edition_id: values.edition_id,
          course_type: values.course_type,
          name: values.name,
          distance: values.distance,
          elevation: values.elevation,
          registered_count: values.registered_count ?? 0,
        });

        if (error) throw error;
        toast.success("코스가 추가되었습니다.");
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
          <DialogTitle>{course ? "코스 편집" : "새 코스 추가"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="edition_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>에디션 *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={Boolean(course)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="에디션 선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {editions.map((ed) => (
                        <SelectItem key={ed.id} value={ed.id}>
                          {ed.year}년
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="course_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>코스 타입 *</FormLabel>
                    <FormControl>
                      <Input placeholder="granfondo" {...field} />
                    </FormControl>
                    <FormDescription>
                      ID로 사용됩니다 (예: granfondo)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>코스명 *</FormLabel>
                    <FormControl>
                      <Input placeholder="그란폰도" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="distance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>거리 (km) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step={0.1}
                        min={0}
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.valueAsNumber || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="elevation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>고도 (m) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.valueAsNumber || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="registered_count"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>접수 인원</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      {...field}
                      value={field.value ?? 0}
                      onChange={(e) =>
                        field.onChange(e.target.valueAsNumber ?? 0)
                      }
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

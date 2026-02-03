"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { EventForm } from "../event-form";
import { EditionsTab } from "../editions-tab";
import { CoursesTab } from "../courses-tab";
import type { EventWithEditions } from "../types";
import { formatDateTime } from "../types";

type EventDetailContentProps = {
  event: EventWithEditions;
};

export function EventDetailContent({ event }: EventDetailContentProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const [isBasicInfoEditing, setIsBasicInfoEditing] = useState(false);

  const createdStr = formatDateTime(event.created_at);
  const updatedStr = formatDateTime(event.updated_at);

  return (
    <div className="space-y-0">
      <div className="flex items-center gap-2 pb-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/events" aria-label="목록으로">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{event.name}</h1>
          <p className="text-sm text-muted-foreground">
            {event.location} · {event.slug}
          </p>
        </div>
      </div>

      <div className="border-b border-border" />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger
              value="basic"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              기본 정보
            </TabsTrigger>
            <TabsTrigger
              value="editions"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              개최 정보
            </TabsTrigger>
            <TabsTrigger
              value="courses"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              코스 정보
            </TabsTrigger>
          </TabsList>
          <div className="text-sm text-muted-foreground shrink-0">
            <div>생성: {createdStr}</div>
            <div>수정: {updatedStr}</div>
          </div>
        </div>

        <TabsContent value="basic" className="mt-4">
          <EventForm
            initialData={event}
            editMode={isBasicInfoEditing}
            onEditModeChange={setIsBasicInfoEditing}
          />
        </TabsContent>

        <TabsContent value="editions" className="mt-4">
          <EditionsTab eventId={event.id} editions={event.event_editions} />
        </TabsContent>

        <TabsContent value="courses" className="mt-4">
          <CoursesTab editions={event.event_editions} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

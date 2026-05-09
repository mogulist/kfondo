"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

type Props = {
  eventId: string;
  courseId: string;
  year: string;
  time: string;
};

const TrackResultViewed = ({ eventId, courseId, year, time }: Props) => {
  useEffect(() => {
    posthog.capture("record_result_viewed", {
      event_id: eventId,
      course_id: courseId,
      year,
      time,
      is_past_year: Number(year) !== new Date().getFullYear(),
    });
  }, [eventId, courseId, year, time]);

  return null;
};

export default TrackResultViewed;

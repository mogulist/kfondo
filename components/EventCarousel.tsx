"use client";

import Link from "next/link";
import { EventCard, EventData } from "@/components/EventCard";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
} from "@/components/ui/carousel";
import { useState, useEffect } from "react";

interface EventCarouselProps {
  title: string;
  icon?: string;
  events: EventData[];
}

export function EventCarousel({ title, icon, events }: EventCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  
  useEffect(() => {
    if (!api) return;

    setScrollSnaps(api.scrollSnapList());
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  if (events.length === 0) return null;
  
  // Generate unique ID from title for accessibility
  const sectionId = title.toLowerCase().replace(/\s+/g, '-');
  
  return (
    <section className="py-4" aria-labelledby={sectionId}>
      <div className="container mx-auto px-4">
        {/* Title */}
        <div className="flex items-center gap-2 mb-4">
           {icon && <span className="text-2xl" aria-hidden="true">{icon}</span>}
           <h2 id={sectionId} className="text-2xl font-bold text-foreground">{title}</h2>
        </div>
        
        {/* Carousel */}
        <Carousel
          setApi={setApi}
          opts={{
            align: "start",
            loop: false,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {events.map((event) => (
              <CarouselItem 
                key={event.id} 
                className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3"
              >
                <Link href={`/${event.id}`} className="block h-full">
                  <EventCard event={event} />
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Navigation: arrows + dots */}
        {events.length > 1 && (
          <div className="flex items-center justify-center gap-4 mt-4">
            {/* Previous arrow */}
            <button
              onClick={() => api?.scrollPrev()}
              disabled={current === 0}
              className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center transition-colors",
                "border border-border hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
              )}
              aria-label="Previous slide"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6"/>
              </svg>
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {scrollSnaps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => api?.scrollTo(index)}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    current === index 
                      ? "w-6 bg-foreground" 
                      : "w-2 bg-muted-foreground/30"
                  )}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Next arrow */}
            <button
              onClick={() => api?.scrollNext()}
              disabled={current === scrollSnaps.length - 1}
              className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center transition-colors",
                "border border-border hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
              )}
              aria-label="Next slide"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

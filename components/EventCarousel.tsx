import Link from "next/link";
import { EventCard, EventData } from "@/components/EventCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface EventCarouselProps {
  title: string;
  icon?: string;
  events: EventData[];
}

export function EventCarousel({ title, icon, events }: EventCarouselProps) {
  if (events.length === 0) return null;
  
  return (
    <section className="py-4">
      <div className="container mx-auto">
        <div className="flex items-center gap-2 mb-4">
           {icon && <span className="text-2xl">{icon}</span>}
           <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        </div>
        
        <Carousel
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
                className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
              >
                <Link href={`/${event.id}`} className="block h-full">
                  <EventCard event={event} />
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          {events.length > 3 && (
            <>
              <CarouselPrevious className="hidden md:flex -left-4 lg:-left-12" />
              <CarouselNext className="hidden md:flex -right-4 lg:-right-12" />
            </>
          )}
        </Carousel>
      </div>
    </section>
  );
}

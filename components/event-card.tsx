"use client"

import { Card, CardContent } from "@/components/ui/card"
import type { Event } from "@/lib/types"
import { motion } from "framer-motion"
import Link from "next/link"

interface EventCardProps {
  event: Event
}

export function EventCard({ event }: EventCardProps) {
  return (
    <Link href={`/${event.id}`}>
      <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
        <Card className="overflow-hidden h-64 cursor-pointer">
          <CardContent className="p-0 h-full">
            <div
              className="h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950 text-white"
              style={{
                backgroundImage: event.color
                  ? `linear-gradient(to bottom right, ${event.color.from}, ${event.color.to})`
                  : undefined,
              }}
            >
              <h2 className="text-4xl font-bold tracking-tight">{event.location}</h2>
              <div className="absolute bottom-4 right-4 text-sm opacity-80">{event.years.length}년 데이터</div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  )
}

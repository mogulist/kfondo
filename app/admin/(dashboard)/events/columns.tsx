"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

// 기존 타입 활용 (Database 생성 타입)
import type { Database } from "@/lib/database.types";

type EventRow = Database["public"]["Tables"]["events"]["Row"];
export type EventWithLatestDate = EventRow & {
  latest_edition_date: string | null;
};

export const columns: ColumnDef<EventWithLatestDate>[] = [
  {
    accessorKey: "name",
    meta: { className: "min-w-[280px] w-full" },
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <Link
        href={`/admin/events/${row.original.id}`}
        className="font-medium hover:underline"
      >
        {row.getValue("name")}
      </Link>
    ),
  },
  {
    accessorKey: "slug",
    meta: { className: "w-56 whitespace-nowrap" },
    header: "Slug",
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.getValue("slug")}</span>
    ),
  },
  {
    accessorKey: "latest_edition_date",
    meta: { className: "w-36 whitespace-nowrap" },
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          최근 개최일
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("latest_edition_date") as string | null;
      if (!date) return <span className="text-muted-foreground">—</span>;
      return <span>{new Date(date).toLocaleDateString()}</span>;
    },
    sortingFn: (rowA, rowB) => {
      const a = rowA.getValue("latest_edition_date") as string | null;
      const b = rowB.getValue("latest_edition_date") as string | null;
      const da = a ?? "";
      const db = b ?? "";
      return da.localeCompare(db);
    },
  },
  {
    accessorKey: "created_at",
    meta: { className: "w-36 whitespace-nowrap" },
    header: "생성일",
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      return <span>{date.toLocaleDateString()}</span>;
    },
  },
  {
    id: "actions",
    meta: { className: "w-14 text-right" },
    cell: ({ row }) => {
      const event = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(event.id)}
            >
              Copy event ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/admin/events/${event.id}`}>Edit event</Link>
            </DropdownMenuItem>
            {/* 삭제 기능은 별도 확인 절차 필요하므로 일단 UI만 */}
            <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  type ColumnDef,
  type SortingState,
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { type TicketStatus } from "core/constants/ticket-status.ts";
import { type TicketCategory } from "core/constants/ticket-category.ts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { TicketFilters } from "./TicketsPage";

interface Ticket {
  id: number;
  subject: string;
  status: TicketStatus;
  category: TicketCategory | null;
  senderName: string;
  senderEmail: string;
  createdAt: string;
}

const statusVariant: Record<TicketStatus, "default" | "secondary" | "outline"> =
  {
    open: "default",
    resolved: "secondary",
    closed: "outline",
  };

const columns: ColumnDef<Ticket>[] = [
  {
    accessorKey: "subject",
    header: "Subject",
  },
  {
    accessorKey: "senderName",
    header: "Sender",
    cell: ({ row }) => (
      <div>
        <div>{row.original.senderName}</div>
        <div className="text-sm text-muted-foreground">
          {row.original.senderEmail}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={statusVariant[row.original.status]}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) =>
      row.original.category ? (
        <Badge variant="secondary">
          {row.original.category.replace(/_/g, " ")}
        </Badge>
      ) : (
        "—"
      ),
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) =>
      new Date(row.original.createdAt).toLocaleDateString(),
  },
];

export default function TicketsTable({ filters }: { filters: TicketFilters }) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);

  const sortBy = sorting[0]?.id ?? "createdAt";
  const sortOrder = sorting[0]?.desc ?? true ? "desc" : "asc";

  const {
    data: tickets,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["tickets", sortBy, sortOrder, filters],
    queryFn: async () => {
      const { data } = await axios.get<{ tickets: Ticket[] }>("/api/tickets", {
        params: { sortBy, sortOrder, ...filters },
      });
      return data.tickets;
    },
  });

  const table = useReactTable({
    data: tickets ?? [],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    manualSorting: true,
    enableMultiSort: false,
    getCoreRowModel: getCoreRowModel(),
  });

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to fetch tickets</AlertDescription>
      </Alert>
    );
  }

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                  {header.column.getIsSorted() === "asc" ? (
                    <ArrowUp className="ml-2 h-4 w-4" />
                  ) : header.column.getIsSorted() === "desc" ? (
                    <ArrowDown className="ml-2 h-4 w-4" />
                  ) : (
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  )}
                </Button>
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-48" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-40" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-24 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
              </TableRow>
            ))
          : table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
      </TableBody>
    </Table>
  );
}

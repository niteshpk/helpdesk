export const ticketStatuses = ["open", "resolved", "closed"] as const;

export type TicketStatus = (typeof ticketStatuses)[number];

export const statusVariant: Record<TicketStatus, "default" | "secondary" | "outline"> = {
  open: "default",
  resolved: "secondary",
  closed: "outline",
};

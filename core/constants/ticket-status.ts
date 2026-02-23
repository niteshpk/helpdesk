export const ticketStatuses = ["open", "resolved", "closed"] as const;

export type TicketStatus = (typeof ticketStatuses)[number];

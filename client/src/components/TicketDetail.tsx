import { type Ticket } from "core/constants/ticket.ts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface TicketDetailProps {
  ticket: Ticket;
}

export default function TicketDetail({ ticket }: TicketDetailProps) {
  return (
    <>
      <div>
        <h1 className="text-2xl font-bold">{ticket.subject}</h1>
        <div className="mt-2 space-y-1 text-sm">
          <div>
            <span className="text-muted-foreground">From: </span>
            {ticket.senderName} ({ticket.senderEmail})
          </div>
          <div>
            <span className="text-muted-foreground">Created: </span>
            {new Date(ticket.createdAt).toLocaleString()}
          </div>
          <div>
            <span className="text-muted-foreground">Updated: </span>
            {new Date(ticket.updatedAt).toLocaleString()}
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Message</CardTitle>
          <CardDescription>From {ticket.senderName}</CardDescription>
        </CardHeader>
        <CardContent>
          {ticket.bodyHtml ? (
            <div dangerouslySetInnerHTML={{ __html: ticket.bodyHtml }} />
          ) : (
            <p className="whitespace-pre-wrap">{ticket.body}</p>
          )}
        </CardContent>
      </Card>
    </>
  );
}

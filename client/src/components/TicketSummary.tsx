import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Sparkles } from "lucide-react";
import { type Ticket } from "core/constants/ticket.ts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ErrorAlert from "@/components/ErrorAlert";

interface TicketSummaryProps {
  ticket: Ticket;
}

export default function TicketSummary({ ticket }: TicketSummaryProps) {
  const summarizeMutation = useMutation({
    mutationFn: async () => {
      const { data } = await axios.post(
        `/api/tickets/${ticket.id}/replies/summarize`
      );
      return data.summary as string;
    },
  });

  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        onClick={() => summarizeMutation.mutate()}
        disabled={summarizeMutation.isPending}
      >
        <Sparkles className="mr-2 h-4 w-4" />
        {summarizeMutation.isPending ? "Summarizing..." : "Summarize"}
      </Button>

      {summarizeMutation.error && (
        <ErrorAlert
          error={summarizeMutation.error}
          fallback="Failed to generate summary"
        />
      )}

      {summarizeMutation.data && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">
              {summarizeMutation.data}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

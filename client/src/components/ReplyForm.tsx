import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { type Ticket } from "core/constants/ticket.ts";
import { createReplySchema, type CreateReplyInput } from "core/schemas/replies.ts";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import ErrorAlert from "@/components/ErrorAlert";
import ErrorMessage from "@/components/ErrorMessage";

interface ReplyFormProps {
  ticket: Ticket;
}

export default function ReplyForm({ ticket }: ReplyFormProps) {
  const ticketId = ticket.id;
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateReplyInput>({
    resolver: zodResolver(createReplySchema),
  });

  const mutation = useMutation({
    mutationFn: async (data: CreateReplyInput) => {
      const { data: reply } = await axios.post(
        `/api/tickets/${ticketId}/replies`,
        data
      );
      return reply;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["replies", ticketId] });
      reset();
    },
  });

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-3">
      {mutation.error && (
        <ErrorAlert error={mutation.error} fallback="Failed to send reply" />
      )}

      <div className="space-y-1">
        <Textarea
          placeholder="Type your reply..."
          {...register("body")}
          rows={4}
        />
        {errors.body && <ErrorMessage message={errors.body.message} />}
      </div>

      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Sending..." : "Send Reply"}
      </Button>
    </form>
  );
}

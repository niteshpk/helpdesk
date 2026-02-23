import { Router } from "express";
import { requireAuth } from "../middleware/require-auth";
import { validate } from "../lib/validate";
import { ticketListQuerySchema } from "core/schemas/tickets.ts";
import prisma from "../db";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const query = validate(ticketListQuerySchema, req.query, res);
  if (!query) return;

  const tickets = await prisma.ticket.findMany({
    select: {
      id: true,
      subject: true,
      status: true,
      category: true,
      senderName: true,
      senderEmail: true,
      createdAt: true,
    },
    orderBy: { [query.sortBy]: query.sortOrder },
  });
  res.json({ tickets });
});

export default router;

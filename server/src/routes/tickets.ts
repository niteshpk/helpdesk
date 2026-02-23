import { Router } from "express";
import { requireAuth } from "../middleware/require-auth";
import { validate } from "../lib/validate";
import { ticketListQuerySchema } from "core/schemas/tickets.ts";
import prisma from "../db";
import type { Prisma } from "../generated/prisma/client";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const query = validate(ticketListQuerySchema, req.query, res);
  if (!query) return;

  const where: Prisma.TicketWhereInput = {};

  if (query.status) {
    where.status = query.status;
  }

  if (query.category) {
    where.category = query.category;
  }

  if (query.search) {
    where.OR = [
      { subject: { contains: query.search, mode: "insensitive" } },
      { senderName: { contains: query.search, mode: "insensitive" } },
      { senderEmail: { contains: query.search, mode: "insensitive" } },
    ];
  }

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
    where,
    orderBy: { [query.sortBy]: query.sortOrder },
  });
  res.json({ tickets });
});

export default router;

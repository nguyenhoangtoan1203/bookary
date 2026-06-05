import { Router, Response } from "express";
import { PrismaClient, TicketStatus } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();
const adapter = new PrismaBetterSqlite3({
  url: "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { search = "" } = req.query;

    const where = {
      status: TicketStatus.BORROWING,
      ...(search && search !== ""
        ? {
            OR: [
              { ticketCode: { contains: search as string } },
              { reader: { name: { contains: search as string } } },
              { book: { code: { contains: search as string } } },
            ],
          }
        : {}),
    };

    const tickets = await prisma.borrowTicket.findMany({
      where,
      include: { reader: true, book: true },
      orderBy: { dueDate: "asc" },
      take: 100,
    });

    res.json(tickets);
  } catch (error) {
    console.error("Get renew tickets error:", error);
    res.status(500).json({ error: "Failed to fetch tickets" });
  }
});

router.post(
  "/:ticketId",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const ticketId = parseInt(req.params.ticketId as string);

      const ticket = await prisma.borrowTicket.findUnique({
        where: { id: ticketId },
      });

      if (!ticket) {
        res.status(404).json({ error: "Ticket not found" });
        return;
      }

      if (ticket.status !== "BORROWING") {
        res.status(400).json({ error: "Ticket is not in borrowing state" });
        return;
      }

      const oldDueDate = ticket.dueDate;
      const newDueDate = new Date(oldDueDate.getTime() + 7 * 24 * 60 * 60 * 1000);

      const renewedTicket = await prisma.borrowTicket.update({
        where: { id: ticketId },
        data: { dueDate: newDueDate },
        include: { reader: true, book: true },
      });

      res.json({
        ticket: renewedTicket,
        oldDueDate,
        newDueDate,
      });
    } catch (error) {
      console.error("Renew ticket error:", error);
      res.status(500).json({ error: "Failed to renew ticket" });
    }
  }
);

export default router;

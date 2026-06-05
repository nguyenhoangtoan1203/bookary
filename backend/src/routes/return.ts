import { Router, Response } from "express";
import { PrismaClient, TicketStatus } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();
const adapter = new PrismaBetterSqlite3({
  url: "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

const FINE_PER_DAY = 5000; // 5000 VND per day

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
      orderBy: { borrowedAt: "desc" },
      take: 100,
    });

    const ticketsWithFine = tickets.map((ticket) => {
      const daysOverdue = Math.max(
        0,
        Math.floor((new Date().getTime() - ticket.dueDate.getTime()) / (1000 * 60 * 60 * 24))
      );
      const fine = daysOverdue * FINE_PER_DAY;

      return {
        ...ticket,
        daysOverdue,
        estimatedFine: fine,
        isOverdue: new Date() > ticket.dueDate,
      };
    });

    res.json(ticketsWithFine);
  } catch (error) {
    console.error("Get return tickets error:", error);
    res.status(500).json({ error: "Failed to fetch tickets" });
  }
});

router.post(
  "/:ticketId",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { isLost = false } = req.body;
      const ticketId = parseInt(req.params.ticketId as string);

      const ticket = await prisma.borrowTicket.findUnique({
        where: { id: ticketId },
        include: { book: true },
      });

      if (!ticket) {
        res.status(404).json({ error: "Ticket not found" });
        return;
      }

      if (ticket.status !== "BORROWING") {
        res.status(400).json({ error: "Ticket is not in borrowing state" });
        return;
      }

      const daysOverdue = Math.max(
        0,
        Math.floor((new Date().getTime() - ticket.dueDate.getTime()) / (1000 * 60 * 60 * 24))
      );
      const fine = daysOverdue * FINE_PER_DAY;

      const returnedTicket = await prisma.borrowTicket.update({
        where: { id: ticketId },
        data: {
          status: isLost ? "LOST" : "RETURNED",
          returnedAt: new Date(),
          isLost,
        },
        include: { reader: true, book: true },
      });

      if (!isLost) {
        await prisma.book.update({
          where: { id: ticket.bookId },
          data: { availableQty: ticket.book.availableQty + 1 },
        });
      } else {
        await prisma.book.update({
          where: { id: ticket.bookId },
          data: { lostQty: ticket.book.lostQty + 1 },
        });
      }

      res.json({
        ticket: returnedTicket,
        daysOverdue,
        fine,
      });
    } catch (error) {
      console.error("Return ticket error:", error);
      res.status(500).json({ error: "Failed to return ticket" });
    }
  }
);

export default router;

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
    const now = new Date();

    const [totalBooks, totalReaders, borrowing, overdue, lost, recentTickets, recentLostTickets] =
      await Promise.all([
        prisma.book.count(),
        prisma.reader.count(),
        prisma.borrowTicket.count({ where: { status: TicketStatus.BORROWING } }),
        prisma.borrowTicket.count({
          where: { status: TicketStatus.BORROWING, dueDate: { lt: now } },
        }),
        prisma.borrowTicket.count({ where: { status: TicketStatus.LOST } }),
        prisma.borrowTicket.findMany({
          where: { status: TicketStatus.BORROWING },
          include: { reader: true, book: true },
          orderBy: { borrowedAt: "desc" },
          take: 20,
        }),
        prisma.borrowTicket.findMany({
          where: { status: TicketStatus.LOST },
          include: { reader: true, book: true },
          orderBy: { returnedAt: "desc" },
          take: 10,
        }),
      ]);

    const ticketsWithStatus = recentTickets.map((ticket) => {
      const isOverdue = now > ticket.dueDate;
      return {
        ...ticket,
        isOverdue,
        daysOverdue: Math.max(
          0,
          Math.floor((now.getTime() - ticket.dueDate.getTime()) / (1000 * 60 * 60 * 24))
        ),
      };
    });

    res.json({
      stats: {
        totalBooks,
        totalReaders,
        borrowing,
        overdue,
        lost,
      },
      recentTickets: ticketsWithStatus,
      recentLostTickets,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});

export default router;

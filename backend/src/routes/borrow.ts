import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();
const adapter = new PrismaBetterSqlite3({
  url: "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

router.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { readerId, bookId, daysToReturn = 14 } = req.body;

    if (!readerId || !bookId) {
      res.status(400).json({ error: "Reader and book IDs required" });
      return;
    }

    const reader = await prisma.reader.findUnique({ where: { id: readerId } });
    if (!reader) {
      res.status(404).json({ error: "Reader not found" });
      return;
    }

    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) {
      res.status(404).json({ error: "Book not found" });
      return;
    }

    if (book.availableQty <= 0) {
      res.status(400).json({ error: "Book not available" });
      return;
    }

    const borrowedAt = new Date();
    const dueDate = new Date(borrowedAt.getTime() + daysToReturn * 24 * 60 * 60 * 1000);

    const lastTicket = await prisma.borrowTicket.findFirst({
      orderBy: { id: "desc" },
    });

    const ticketNumber = (lastTicket?.id || 0) + 1;
    const ticketCode = `PM${String(ticketNumber).padStart(10, "0")}`;

    const ticket = await prisma.borrowTicket.create({
      data: {
        ticketCode,
        readerId,
        bookId,
        borrowedAt,
        dueDate,
      },
      include: { reader: true, book: true },
    });

    await prisma.book.update({
      where: { id: bookId },
      data: { availableQty: book.availableQty - 1 },
    });

    res.status(201).json(ticket);
  } catch (error) {
    console.error("Create borrow ticket error:", error);
    res.status(500).json({ error: "Failed to create borrow ticket" });
  }
});

// Get all tickets for authenticated user (guest user's borrow history)
router.get("/tickets", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userEmail = req.user?.email;
    if (!userEmail) {
      res.status(401).json({ error: "User email not found" });
      return;
    }

    const reader = await prisma.reader.findUnique({
      where: { email: userEmail },
    });

    if (!reader) {
      res.json({
        tickets: [],
        total: 0,
      });
      return;
    }

    const tickets = await prisma.borrowTicket.findMany({
      where: { readerId: reader.id },
      include: { reader: true, book: true },
      orderBy: { borrowedAt: "desc" },
    });

    res.json({
      tickets,
      total: tickets.length,
    });
  } catch (error) {
    console.error("Get tickets error:", error);
    res.status(500).json({ error: "Failed to fetch tickets" });
  }
});

// Get tickets by status (for guest users)
router.get("/tickets/:status", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.params;
    const userEmail = req.user?.email;

    if (!userEmail) {
      res.status(401).json({ error: "User email not found" });
      return;
    }

    const reader = await prisma.reader.findUnique({
      where: { email: userEmail },
    });

    if (!reader) {
      res.json({
        tickets: [],
        total: 0,
      });
      return;
    }

    let whereClause: any = { readerId: reader.id };
    if (status && status !== "all" && typeof status === "string") {
      whereClause.status = status.toUpperCase();
    }

    const tickets = await prisma.borrowTicket.findMany({
      where: whereClause,
      include: { reader: true, book: true },
      orderBy: { borrowedAt: "desc" },
    });

    res.json({
      tickets,
      total: tickets.length,
    });
  } catch (error) {
    console.error("Get tickets by status error:", error);
    res.status(500).json({ error: "Failed to fetch tickets" });
  }
});

export default router;

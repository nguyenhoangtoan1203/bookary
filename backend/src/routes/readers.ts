import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { authMiddleware, adminMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();
const adapter = new PrismaBetterSqlite3({
  url: "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

router.get("/next-code", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const lastReader = await prisma.reader.findFirst({
      orderBy: { code: "desc" },
      select: { code: true },
    });

    let nextNumber = 1;
    if (lastReader) {
      const match = lastReader.code.match(/^DG(\d+)$/);
      if (match) {
        nextNumber = parseInt(match[1]) + 1;
      }
    }

    const nextCode = `DG${String(nextNumber).padStart(10, "0")}`;
    res.json({ code: nextCode });
  } catch (error) {
    console.error("Get next reader code error:", error);
    res.status(500).json({ error: "Failed to generate next reader code" });
  }
});

router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { search = "", page = "1", sortBy = "code", sortDirection = "asc" } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const pageSize = 10;
    const skip = (pageNum - 1) * pageSize;

    const where =
      search && search !== ""
        ? {
            OR: [
              { code: { contains: search as string } },
              { name: { contains: search as string } },
              { email: { contains: search as string } },
              { phone: { contains: search as string } },
            ],
          }
        : {};

    const validSortFields = ["code", "name", "email", "phone", "membershipExpiry"];
    const sortField = validSortFields.includes(sortBy as string) ? (sortBy as string) : "code";
    const direction = sortDirection === "desc" ? "desc" : "asc";

    const [readers, total] = await Promise.all([
      prisma.reader.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortField]: direction },
      }),
      prisma.reader.count({ where }),
    ]);

    res.json({
      readers,
      total,
      pages: Math.ceil(total / pageSize),
      currentPage: pageNum,
    });
  } catch (error) {
    console.error("Get readers error:", error);
    res.status(500).json({ error: "Failed to fetch readers" });
  }
});

router.get(
  "/:id",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const reader = await prisma.reader.findUnique({
        where: { id: parseInt(req.params.id as string) },
      });

      if (!reader) {
        res.status(404).json({ error: "Reader not found" });
        return;
      }

      res.json(reader);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reader" });
    }
  }
);

router.get(
  "/:id/history",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const readerId = parseInt(req.params.id as string);

      const tickets = await prisma.borrowTicket.findMany({
        where: { readerId },
        include: { book: true },
        orderBy: { borrowedAt: "desc" },
      });

      res.json(tickets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch borrow history" });
    }
  }
);

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { code, name, email, phone, membershipExpiry } = req.body;

      if (!code || !name || !email || !phone) {
        res.status(400).json({ error: "Missing required fields" });
        return;
      }

      const existingCode = await prisma.reader.findUnique({ where: { code } });
      if (existingCode) {
        res.status(400).json({ error: "Reader code already exists" });
        return;
      }

      const existingEmail = await prisma.reader.findUnique({ where: { email } });
      if (existingEmail) {
        res.status(400).json({ error: "Email already exists" });
        return;
      }

      const reader = await prisma.reader.create({
        data: {
          code,
          name,
          email,
          phone,
          membershipExpiry: new Date(membershipExpiry || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)),
        },
      });

      res.status(201).json(reader);
    } catch (error) {
      console.error("Create reader error:", error);
      res.status(500).json({ error: "Failed to create reader" });
    }
  }
);

router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { name, email, phone, membershipExpiry } = req.body;
      const readerId = parseInt(req.params.id as string);

      const reader = await prisma.reader.findUnique({ where: { id: readerId } });
      if (!reader) {
        res.status(404).json({ error: "Reader not found" });
        return;
      }

      const updatedReader = await prisma.reader.update({
        where: { id: readerId },
        data: {
          ...(name && { name }),
          ...(email && { email }),
          ...(phone && { phone }),
          ...(membershipExpiry && { membershipExpiry: new Date(membershipExpiry) }),
        },
      });

      res.json(updatedReader);
    } catch (error) {
      console.error("Update reader error:", error);
      res.status(500).json({ error: "Failed to update reader" });
    }
  }
);

router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const readerId = parseInt(req.params.id as string);

      const reader = await prisma.reader.findUnique({ where: { id: readerId } });
      if (!reader) {
        res.status(404).json({ error: "Reader not found" });
        return;
      }

      await prisma.reader.delete({ where: { id: readerId } });
      res.json({ message: "Reader deleted successfully" });
    } catch (error) {
      console.error("Delete reader error:", error);
      res.status(500).json({ error: "Failed to delete reader" });
    }
  }
);

export default router;

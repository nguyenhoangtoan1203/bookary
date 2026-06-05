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
    const lastBook = await prisma.book.findFirst({
      orderBy: { code: "desc" },
      select: { code: true },
    });

    let nextNumber = 1;
    if (lastBook) {
      const match = lastBook.code.match(/^S(\d+)$/);
      if (match) {
        nextNumber = parseInt(match[1]) + 1;
      }
    }

    const nextCode = `S${String(nextNumber).padStart(11, "0")}`;
    res.json({ code: nextCode });
  } catch (error) {
    console.error("Get next book code error:", error);
    res.status(500).json({ error: "Failed to generate next book code" });
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
              { title: { contains: search as string } },
              { author: { contains: search as string } },
              { code: { contains: search as string } },
            ],
          }
        : {};

    const validSortFields = ["code", "title", "author", "totalQuantity", "availableQty"];
    const sortField = validSortFields.includes(sortBy as string) ? (sortBy as string) : "code";
    const direction = sortDirection === "desc" ? "desc" : "asc";

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortField]: direction },
      }),
      prisma.book.count({ where }),
    ]);

    res.json({
      books,
      total,
      pages: Math.ceil(total / pageSize),
      currentPage: pageNum,
    });
  } catch (error) {
    console.error("Get books error:", error);
    res.status(500).json({ error: "Failed to fetch books" });
  }
});

router.get("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const book = await prisma.book.findUnique({
      where: { id: parseInt(req.params.id as string) },
    });

    if (!book) {
      res.status(404).json({ error: "Book not found" });
      return;
    }

    res.json(book);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch book" });
  }
});

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { code, title, author, totalQuantity } = req.body;

      if (!code || !title || !author || totalQuantity === undefined) {
        res.status(400).json({ error: "Missing required fields" });
        return;
      }

      const existingBook = await prisma.book.findUnique({ where: { code } });
      if (existingBook) {
        res.status(400).json({ error: "Book code already exists" });
        return;
      }

      const book = await prisma.book.create({
        data: {
          code,
          title,
          author,
          totalQuantity,
          availableQty: totalQuantity,
        },
      });

      res.status(201).json(book);
    } catch (error) {
      console.error("Create book error:", error);
      res.status(500).json({ error: "Failed to create book" });
    }
  }
);

router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { title, author, totalQuantity } = req.body;
      const bookId = parseInt(req.params.id as string);

      const book = await prisma.book.findUnique({ where: { id: bookId } });
      if (!book) {
        res.status(404).json({ error: "Book not found" });
        return;
      }

      const updatedBook = await prisma.book.update({
        where: { id: bookId },
        data: {
          ...(title && { title }),
          ...(author && { author }),
          ...(totalQuantity !== undefined && { totalQuantity }),
        },
      });

      res.json(updatedBook);
    } catch (error) {
      console.error("Update book error:", error);
      res.status(500).json({ error: "Failed to update book" });
    }
  }
);

router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const bookId = parseInt(req.params.id as string);

      const book = await prisma.book.findUnique({ where: { id: bookId } });
      if (!book) {
        res.status(404).json({ error: "Book not found" });
        return;
      }

      await prisma.book.delete({ where: { id: bookId } });
      res.json({ message: "Book deleted successfully" });
    } catch (error) {
      console.error("Delete book error:", error);
      res.status(500).json({ error: "Failed to delete book" });
    }
  }
);

export default router;

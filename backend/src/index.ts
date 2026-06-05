import express from "express";
import cors from "cors";
import "dotenv/config";

import authRoutes from "./routes/auth";
import booksRoutes from "./routes/books";
import readersRoutes from "./routes/readers";
import borrowRoutes from "./routes/borrow";
import returnRoutes from "./routes/return";
import renewRoutes from "./routes/renew";
import dashboardRoutes from "./routes/dashboard";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/books", booksRoutes);
app.use("/api/readers", readersRoutes);
app.use("/api/borrow", borrowRoutes);
app.use("/api/return", returnRoutes);
app.use("/api/renew", renewRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});

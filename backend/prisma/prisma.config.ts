import { defineConfig } from "@prisma/internals";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

export default defineConfig({
  datasources: {
    db: {
      provider: "sqlite",
      url: "file:./dev.db",
    },
  },
  adapter: new PrismaBetterSqlite3({
    url: "file:./dev.db",
  }),
});

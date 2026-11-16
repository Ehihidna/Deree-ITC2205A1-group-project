// Prisma ORM 7 configuration. Prisma 7.10+ looks for this file name first;
// "prisma.config.ts" is reserved for the Prisma 8 format.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});

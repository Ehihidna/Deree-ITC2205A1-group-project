// Imports the exercise catalogue into the database.
// Run with: npx prisma db seed
//
// Exercises that already exist (same id) are left unchanged, so the script
// can be run again safely.
import "dotenv/config";

import { readFile } from "node:fs/promises";
import path from "node:path";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../lib/generated/prisma/client";
import { DATASET_COMMIT, parseExercises } from "./exercises";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env.");
  }
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

  try {
    const file = path.join(process.cwd(), "prisma", "data", "exercises.json");
    const data: unknown = JSON.parse(await readFile(file, "utf8"));
    const { rows, skipped } = parseExercises(data);

    for (const { index, reason } of skipped) {
      console.warn(`Skipped record ${index}: ${reason}`);
    }

    const { count } = await db.exercise.createMany({
      data: rows,
      skipDuplicates: true,
    });
    const total = await db.exercise.count();

    console.log(
      `Free Exercise DB @ ${DATASET_COMMIT.slice(0, 7)}: ` +
        `${rows.length} valid records, ${skipped.length} skipped, ` +
        `${count} inserted, ${total} exercises in the database.`,
    );
  } finally {
    await db.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

// Converts records from Free Exercise DB (https://github.com/yuhonas/free-exercise-db,
// public domain) into rows of the Exercise table. Kept separate from the
// seed script so it can be unit-tested without a database.
import { z } from "zod";

// Commit of the dataset copied into prisma/data/exercises.json.
export const DATASET_COMMIT = "f00c92c7dcf1216a928a52c3706c7ce8e2f71ed5";

// Base URL for the images listed in Exercise.images.
export const EXERCISE_IMAGE_BASE_URL = `https://raw.githubusercontent.com/yuhonas/free-exercise-db/${DATASET_COMMIT}/exercises/`;

const rawExerciseSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  force: z.string().nullable(),
  level: z.string().min(1),
  mechanic: z.string().nullable(),
  equipment: z.string().nullable(),
  primaryMuscles: z.array(z.string()).min(1),
  secondaryMuscles: z.array(z.string()),
  instructions: z.array(z.string()),
  category: z.string().min(1),
  images: z.array(z.string()),
});

export type RawExercise = z.infer<typeof rawExerciseSchema>;

export type ExerciseRow = {
  id: string;
  name: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipment: string | null;
  level: string;
  category: string;
  force: string | null;
  mechanic: string | null;
  instructions: string[];
  images: string[];
};

export type ImportResult = {
  rows: ExerciseRow[];
  // Records that were skipped, with the reason.
  skipped: { index: number; reason: string }[];
};

const clean = (value: string) => value.trim().replace(/\s+/g, " ");
const cleanList = (values: string[]) =>
  values.map(clean).filter((value) => value.length > 0);

export function toExerciseRow(raw: RawExercise): ExerciseRow {
  return {
    id: raw.id.trim(),
    name: clean(raw.name),
    // Muscle and equipment names are compared in filters and by the
    // validator, so they are stored in lower case.
    primaryMuscles: cleanList(raw.primaryMuscles).map((m) => m.toLowerCase()),
    secondaryMuscles: cleanList(raw.secondaryMuscles).map((m) => m.toLowerCase()),
    equipment: raw.equipment ? clean(raw.equipment).toLowerCase() : null,
    level: clean(raw.level).toLowerCase(),
    category: clean(raw.category).toLowerCase(),
    force: raw.force ? clean(raw.force).toLowerCase() : null,
    mechanic: raw.mechanic ? clean(raw.mechanic).toLowerCase() : null,
    instructions: cleanList(raw.instructions),
    images: cleanList(raw.images),
  };
}

// Validates every record and converts the valid ones. Invalid records and
// repeated ids are reported instead of stopping the whole import.
export function parseExercises(data: unknown): ImportResult {
  if (!Array.isArray(data)) {
    throw new Error("Exercise data must be a JSON array.");
  }

  const rows: ExerciseRow[] = [];
  const skipped: ImportResult["skipped"] = [];
  const seenIds = new Set<string>();

  data.forEach((item, index) => {
    const parsed = rawExerciseSchema.safeParse(item);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      skipped.push({
        index,
        reason: `${issue.path.join(".") || "record"}: ${issue.message}`,
      });
      return;
    }
    const row = toExerciseRow(parsed.data);
    if (seenIds.has(row.id)) {
      skipped.push({ index, reason: `duplicate id "${row.id}"` });
      return;
    }
    seenIds.add(row.id);
    rows.push(row);
  });

  return { rows, skipped };
}

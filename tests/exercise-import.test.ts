import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { parseExercises, toExerciseRow } from "@/prisma/exercises";

const validRecord = {
  id: "Barbell_Squat",
  name: "  Barbell   Squat ",
  force: "Push",
  level: "Beginner",
  mechanic: "compound",
  equipment: "Barbell",
  primaryMuscles: ["Quadriceps"],
  secondaryMuscles: ["glutes", " "],
  instructions: ["Stand under the bar.", ""],
  category: "strength",
  images: ["Barbell_Squat/0.jpg"],
};

describe("toExerciseRow", () => {
  it("trims text and lower-cases the values used in filters", () => {
    expect(toExerciseRow(validRecord)).toEqual({
      id: "Barbell_Squat",
      name: "Barbell Squat",
      primaryMuscles: ["quadriceps"],
      secondaryMuscles: ["glutes"],
      equipment: "barbell",
      level: "beginner",
      category: "strength",
      force: "push",
      mechanic: "compound",
      instructions: ["Stand under the bar."],
      images: ["Barbell_Squat/0.jpg"],
    });
  });

  it("keeps missing equipment, force and mechanic as null", () => {
    const row = toExerciseRow({
      ...validRecord,
      equipment: null,
      force: null,
      mechanic: null,
    });
    expect(row.equipment).toBeNull();
    expect(row.force).toBeNull();
    expect(row.mechanic).toBeNull();
  });
});

describe("parseExercises", () => {
  it("skips invalid records and repeated ids instead of failing", () => {
    const result = parseExercises([
      validRecord,
      { ...validRecord, id: "No_Muscles", primaryMuscles: [] },
      { ...validRecord, name: undefined, id: "No_Name" },
      validRecord,
    ]);

    expect(result.rows.map((row) => row.id)).toEqual(["Barbell_Squat"]);
    expect(result.skipped.map((s) => s.index)).toEqual([1, 2, 3]);
    expect(result.skipped[2].reason).toContain("duplicate id");
  });

  it("rejects data that is not an array", () => {
    expect(() => parseExercises({})).toThrow("JSON array");
  });

  it("accepts every record of the bundled dataset", () => {
    const file = path.join(process.cwd(), "prisma", "data", "exercises.json");
    const data: unknown = JSON.parse(readFileSync(file, "utf8"));
    const result = parseExercises(data);

    expect(result.skipped).toEqual([]);
    expect(result.rows.length).toBeGreaterThan(800);
  });
});

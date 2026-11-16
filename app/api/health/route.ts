import { db } from "@/lib/db";

// Deployment check: confirms the server can reach the database and that the
// exercise catalogue has been imported. GET /api/health
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const exercises = await db.exercise.count();
    return Response.json({ status: "ok", exercises });
  } catch (error) {
    console.error("Health check failed", error);
    return Response.json(
      { status: "error", message: "Database not reachable" },
      { status: 503 },
    );
  }
}

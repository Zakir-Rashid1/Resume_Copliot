import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "platform-development-jwt-secret-key-10293";

async function getUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    return decoded.id;
  } catch {
    return null;
  }
}

// GET all applications
export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const applications = await db.applications.findMany(userId);
  return NextResponse.json({ success: true, applications });
}

// POST create application
export async function POST(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { company, position, status, dateApplied, notes } = body;

    if (!company || !position || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newApp = await db.applications.create({
      userId,
      company,
      position,
      status,
      dateApplied: dateApplied || new Date().toISOString().split("T")[0],
      notes: notes || "",
    });

    return NextResponse.json({ success: true, application: newApp });
  } catch (err) {
    console.error("Create Application Error:", err);
    const message = err instanceof Error ? err.message : "Failed to create application";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT update application (update status/notes)
export async function PUT(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, status, notes, company, position, dateApplied } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing application id" }, { status: 400 });
    }

    // Check ownership
    const applications = await db.applications.findMany(userId);
    const app = applications.find((a) => a.id === id);
    if (!app) {
      return NextResponse.json({ error: "Forbidden or Not Found" }, { status: 403 });
    }

    const updated = await db.applications.update(id, {
      status,
      notes,
      company,
      position,
      dateApplied,
    });

    return NextResponse.json({ success: true, application: updated });
  } catch (err) {
    console.error("Update Application Error:", err);
    const message = err instanceof Error ? err.message : "Failed to update application";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE application
export async function DELETE(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing application id" }, { status: 400 });
    }

    // Check ownership
    const applications = await db.applications.findMany(userId);
    const app = applications.find((a) => a.id === id);
    if (!app) {
      return NextResponse.json({ error: "Forbidden or Not Found" }, { status: 403 });
    }

    await db.applications.delete(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete Application Error:", err);
    const message = err instanceof Error ? err.message : "Failed to delete application";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

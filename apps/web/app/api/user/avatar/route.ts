import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // After client-side resize, avatars should be small (~20-50KB).
    // Reject anything over 500KB as a safety net.
    if (file.size > 500 * 1024) {
      return NextResponse.json(
        { error: "Processed image too large. Please try a smaller image." },
        { status: 400 }
      );
    }

    // Convert file to base64 data URL for database storage
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const mimeType = file.type || "image/jpeg";
    const dataUrl = `data:${mimeType};base64,${base64}`;

    // Store in database
    await prisma.userProfile.update({
      where: { userId: session.user.id },
      data: { avatarUrl: dataUrl },
    });

    return NextResponse.json({ url: dataUrl, success: true });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}

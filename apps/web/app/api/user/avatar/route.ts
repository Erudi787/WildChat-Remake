import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

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

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image must be less than 5MB" },
        { status: 400 }
      );
    }

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (err) {
      // Ignore if directory exists
    }

    // Generate unique filename
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Create safe hash name
    const hash = crypto.createHash('md5').update(`${session.user.id}-${Date.now()}`).digest('hex');
    const extension = file.name.split(".").pop() || "png";
    const fileName = `${hash}.${extension}`;
    const filePath = path.join(uploadDir, fileName);

    // Write file to public directory
    await writeFile(filePath, buffer);

    // The public URL
    const publicUrl = `/uploads/avatars/${fileName}`;

    // Update user profile
    await prisma.userProfile.update({
      where: { userId: session.user.id },
      data: { avatarUrl: publicUrl },
    });

    return NextResponse.json({ url: publicUrl, success: true });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}

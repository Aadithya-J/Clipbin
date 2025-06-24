import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import * as bcrypt from "bcryptjs";

function generateRandomSlug(length: number = 8): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(request: Request) {
  try {
    const {
      content,
      isPrivate,
      password,
      customSlug,
      expiresIn,
      destroyOnView,
    } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const slug = customSlug || generateRandomSlug();

    if (customSlug) {
      const existingClip = await prisma.clip.findUnique({
        where: { slug: customSlug },
      });

      if (existingClip) {
        return NextResponse.json(
          { error: "This custom URL is already taken" },
          { status: 400 }
        );
      }
    }

    let expiresAt: Date | null = null;
    if (expiresIn && expiresIn !== "never") {
      const now = new Date();
      const [value, unit] = expiresIn.split(/([a-z]+)/);
      const numValue = parseInt(value, 10);

      if (unit === "h") {
        now.setHours(now.getHours() + numValue);
      } else if (unit === "d") {
        now.setDate(now.getDate() + numValue);
      }
      expiresAt = now;
    }

    const hashedPassword =
      isPrivate && password ? await bcrypt.hash(password, 10) : null;

    const clip = await prisma.clip.create({
      data: {
        id: uuidv4(),
        content,
        slug,
        isPrivate: Boolean(isPrivate),
        password: hashedPassword,
        expiresAt,
        destroyOnView: Boolean(destroyOnView),
        views: 0,
      },
      select: {
        id: true,
        slug: true,
        expiresAt: true,
      },
    });

    return NextResponse.json({
      id: clip.id,
      slug: clip.slug,
      expiresAt: clip.expiresAt?.toISOString(),
    });
  } catch (error) {
    console.error("Error creating clip:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

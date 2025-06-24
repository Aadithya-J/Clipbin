import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as bcrypt from 'bcryptjs';

interface RouteParams {
    params: Promise<{ slug: string }>
  }
  
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const password = searchParams.get('password');

    // Find the clip
    const clip = await prisma.clip.findUnique({ where: { slug } });

    if (!clip) {
      return NextResponse.json({ error: 'Clip not found' }, { status: 404 });
    }

    // Check if the clip is expired
    if (clip.expiresAt && clip.expiresAt < new Date()) {
      // Optionally delete expired clips
      await prisma.clip.delete({ where: { id: clip.id } });
      
      return NextResponse.json({ error: 'This clip has expired' }, { status: 410 }); // Gone
    }

    // Handle private clips
    if (clip.isPrivate) {
      if (!password) {
        return NextResponse.json(
          { error: 'Password is required for this private clip' },
          { status: 401 }
        );
      }

      const isPasswordValid = clip.password 
        ? await bcrypt.compare(password, clip.password)
        : false;

      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Incorrect password' },
          { status: 403 }
        );
      }
    }

    // Increment view count
    await prisma.clip.update({
      where: { id: clip.id },
      data: { views: { increment: 1 } },
    });

    // Return clip data without password
    return NextResponse.json({
      id: clip.id,
      slug: clip.slug,
      content: clip.content,
      isPrivate: clip.isPrivate,
      views: clip.views,
      expiresAt: clip.expiresAt?.toISOString(),
      createdAt: clip.createdAt.toISOString(),
    });

  } catch (error) {
    console.error('Error retrieving clip:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

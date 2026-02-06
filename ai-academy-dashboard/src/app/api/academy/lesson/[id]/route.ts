import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const MAX_LESSON_ID = 5;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verify authentication
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  const { id } = await params;
  const lessonId = parseInt(id, 10);

  if (isNaN(lessonId) || lessonId < 1 || lessonId > MAX_LESSON_ID) {
    return NextResponse.json(
      { error: 'Lesson not found or not yet available' },
      { status: 404 }
    );
  }

  const filePath = join(process.cwd(), 'content', 'academy', `lesson-${lessonId}.html`);

  if (!existsSync(filePath)) {
    return NextResponse.json(
      { error: 'Lesson content not found' },
      { status: 404 }
    );
  }

  const html = readFileSync(filePath, 'utf-8');

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

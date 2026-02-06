'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Home, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const lessonMeta: Record<number, { title: string }> = {
  1: { title: 'The New Reality' },
  2: { title: 'AI Security Fundamentals' },
  3: { title: 'Databases & Memory for Agents' },
  4: { title: 'System Design & Governance Blueprint' },
  5: { title: 'From Governance to Agent Design Patterns' },
};

const MAX_AVAILABLE = 5;

export default function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const lessonId = parseInt(id, 10);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isNaN(lessonId) || lessonId < 1 || lessonId > MAX_AVAILABLE) {
      setError('Lesson not found or not yet available.');
      setLoading(false);
      return;
    }

    let revoked = false;
    let url: string | null = null;

    fetch(`/api/academy/lesson/${lessonId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load lesson content.');
        return res.text();
      })
      .then((html) => {
        if (revoked) return;
        const blob = new Blob([html], { type: 'text/html' });
        url = URL.createObjectURL(blob);
        setBlobUrl(url);
      })
      .catch((err) => {
        if (!revoked) setError(err.message);
      })
      .finally(() => {
        if (!revoked) setLoading(false);
      });

    return () => {
      revoked = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [lessonId]);

  const meta = lessonMeta[lessonId];

  if (error) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">{error}</p>
        <Button variant="outline" onClick={() => router.push('/')}>
          <Home className="mr-2 h-4 w-4" />
          Back to Academy
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-border bg-card/95 backdrop-blur">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back to Academy</span>
        </Button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {meta?.title || `Lesson ${lessonId}`}
          </p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#0062FF]" />
        </div>
      ) : blobUrl ? (
        <iframe
          src={blobUrl}
          className="flex-1 w-full border-0"
          title={meta?.title || `Lesson ${lessonId}`}
          sandbox="allow-scripts allow-same-origin"
        />
      ) : null}
    </div>
  );
}

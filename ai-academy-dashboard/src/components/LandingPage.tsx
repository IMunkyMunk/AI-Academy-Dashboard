'use client';

import { useAuth } from '@clerk/nextjs';
import { useParticipant } from '@/components/ParticipantProvider';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loader2, ShieldCheck, LogIn, UserPlus } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export function LandingPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const { isLoading: participantLoading, isAdmin, userStatus } = useParticipant();

  if (!isLoaded || participantLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0062FF]" />
      </div>
    );
  }

  // If user is logged in and approved, redirect happens via AuthGuard
  if (isSignedIn && (isAdmin || userStatus === 'approved')) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0062FF]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative">
      {/* Theme Toggle - Top Right */}
      <div className="absolute top-4 right-4">
        <ThemeToggle variant="outline" />
      </div>

      <div className="flex flex-col items-center gap-8">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#0062FF]">
          <span className="text-3xl font-bold text-white">AI</span>
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">AI Academy</h1>
          <p className="text-muted-foreground">Your AI learning journey starts here</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/sign-up">
            <Button size="lg" className="bg-[#0062FF] hover:bg-[#0052D9] text-white min-w-[140px]">
              <UserPlus className="mr-2 h-5 w-5" />
              Sign Up
            </Button>
          </Link>
          <Link href="/sign-in">
            <Button size="lg" variant="outline" className="min-w-[140px]">
              <LogIn className="mr-2 h-5 w-5" />
              Sign In
            </Button>
          </Link>
          <Link href="/sign-in">
            <Button size="lg" variant="ghost" className="min-w-[140px]">
              <ShieldCheck className="mr-2 h-5 w-5" />
              Admin
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

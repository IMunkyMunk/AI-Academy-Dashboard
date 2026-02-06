'use client';

import { useAuth } from '@clerk/nextjs';
import { useParticipant } from '@/components/ParticipantProvider';
import { LandingPage } from '@/components/LandingPage';
import { AcademyPortal } from '@/components/AcademyPortal';
import { Loader2 } from 'lucide-react';

export function HomePage() {
  const { isSignedIn, isLoaded } = useAuth();
  const { isLoading: participantLoading, isAdmin, userStatus } = useParticipant();

  const isLoading = !isLoaded || participantLoading;

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0062FF]" />
      </div>
    );
  }

  if (!isSignedIn) {
    return <LandingPage />;
  }

  if (!isAdmin && userStatus !== 'approved') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0062FF]" />
      </div>
    );
  }

  return <AcademyPortal />;
}

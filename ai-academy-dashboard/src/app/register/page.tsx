'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Register flow: /register redirects to /onboarding.
 * Users must sign in via Clerk (sign-up/sign-in) first; then complete onboarding to register as participant.
 * ?from=github - used when returning from OAuth (e.g. Clerk GitHub connection).
 */
function RegisterRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from');

  useEffect(() => {
    if (from === 'github') {
      router.replace('/onboarding?from=github');
    } else {
      router.replace('/onboarding');
    }
  }, [router, from]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-[#0062FF]" />
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-[#0062FF]" />
        </div>
      }
    >
      <RegisterRedirect />
    </Suspense>
  );
}

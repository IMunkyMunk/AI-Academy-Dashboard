'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { useParticipant } from '@/components/ParticipantProvider';
import { Loader2 } from 'lucide-react';

// Routes that don't require authentication (must match middleware isPublicRoute)
const PUBLIC_ROUTES = [
  '/',
  '/sign-in',
  '/sign-up',
  '/offline',
  '/help',
  '/register',
  '/leaderboard',
  '/progress',
  '/teams',
];

// Routes that are public but checked by prefix (must match middleware isPublicRoute)
const PUBLIC_PREFIXES = [
  '/presentations',
  '/sign-in',
  '/sign-up',
  '/participant',
  '/team',
];

// Routes that only require authentication (not approval)
const AUTH_ONLY_ROUTES = [
  '/pending',
  '/onboarding',
];

// Routes that require admin access
const ADMIN_ROUTES = [
  '/admin',
];

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { isLoading: participantLoading, isAdmin, userStatus } = useParticipant();
  const router = useRouter();
  const pathname = usePathname();
  const [waitCount, setWaitCount] = useState(0);

  const isLoading = !authLoaded || participantLoading;

  // Calculate route types
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname) ||
    PUBLIC_PREFIXES.some(prefix => pathname.startsWith(prefix));
  const isAuthOnlyRoute = AUTH_ONLY_ROUTES.some(route => pathname.startsWith(route));
  const isAdminRoute = ADMIN_ROUTES.some(route => pathname.startsWith(route));

  // Determine if we need to wait before redirecting
  const needsWait = !isPublicRoute && !isLoading && !isSignedIn;
  const maxWait = 3;

  // Wait counter for redirect delay
  useEffect(() => {
    // Only run timer when we need to wait
    if (!needsWait || waitCount >= maxWait) {
      return;
    }

    const timer = setTimeout(() => {
      setWaitCount(prev => prev + 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [needsWait, waitCount, maxWait]);

  // Reset wait count when conditions change (separate effect)
  useEffect(() => {
    if (!needsWait && waitCount > 0) {
      // Schedule reset for next tick to avoid cascading renders
      const timer = setTimeout(() => setWaitCount(0), 0);
      return () => clearTimeout(timer);
    }
  }, [needsWait, waitCount]);

  // Handle redirects
  useEffect(() => {
    // Public routes - no redirect
    if (isPublicRoute) return;

    // Still loading - wait
    if (isLoading) return;

    // User is signed in - handle status redirects
    if (isSignedIn) {
      if (isAdminRoute && !isAdmin) {
        router.push('/');
        return;
      }

      if (isAdmin) {
        if (pathname === '/pending') router.push('/admin/users');
        return;
      }

      if (userStatus === 'no_profile' && pathname !== '/onboarding') {
        router.push('/onboarding');
        return;
      }

      if (userStatus === 'pending' && pathname !== '/pending' && !isAuthOnlyRoute) {
        router.push('/pending');
        return;
      }

      if (userStatus === 'rejected' && pathname !== '/pending') {
        router.push('/pending');
        return;
      }

      if (userStatus === 'approved' && (pathname === '/sign-in' || pathname === '/sign-up' || pathname === '/pending')) {
        router.push('/my-dashboard');
      }
      return;
    }

    // Not signed in - check if we should redirect
    if (waitCount >= maxWait) {
      console.log('[AuthGuard] Redirecting to sign-in after waiting', waitCount, 'seconds');
      router.push('/sign-in');
    }
  }, [isSignedIn, isLoading, isAdmin, userStatus, pathname, router, isPublicRoute, isAuthOnlyRoute, isAdminRoute, waitCount]);

  // === RENDER ===

  if (isPublicRoute) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#0062FF]" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (isSignedIn) {
    if (isAdminRoute && !isAdmin) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#0062FF]" />
        </div>
      );
    }

    if (!isAdmin && (userStatus === 'pending' || userStatus === 'rejected' || userStatus === 'no_profile')) {
      if (!isAuthOnlyRoute) {
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-[#0062FF]" />
              <p className="text-muted-foreground">
                {userStatus === 'no_profile' ? 'Setting up profile...' : 'Checking status...'}
              </p>
            </div>
          </div>
        );
      }
    }

    return <>{children}</>;
  }

  // Not signed in yet - waiting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#0062FF]" />
        <p className="text-muted-foreground">Checking authentication...</p>
      </div>
    </div>
  );
}

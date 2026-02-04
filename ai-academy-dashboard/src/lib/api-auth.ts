import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServiceSupabaseClient } from '@/lib/supabase';
import { logSecurityEvent } from '@/lib/logger';

/**
 * API Authentication Utilities
 * Provides authentication and authorization checks for API routes
 * Uses Clerk for authentication and Supabase for participant data
 */

export interface AuthenticatedUser {
  id: string;
  email: string;
  isAdmin: boolean;
  isMentor: boolean;
  participantId?: string;
}

export interface AuthResult {
  authenticated: true;
  user: AuthenticatedUser;
}

export interface AuthError {
  authenticated: false;
  response: NextResponse;
}

/**
 * Verify that the request is from an authenticated user
 * Returns the user information if authenticated, or an error response
 */
export async function requireAuth(
  request: NextRequest
): Promise<AuthResult | AuthError> {
  try {
    const { userId } = await auth();

    if (!userId) {
      logSecurityEvent('auth_failure', {
        path: request.nextUrl.pathname,
        reason: 'No authenticated user',
      });

      return {
        authenticated: false,
        response: NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        ),
      };
    }

    const supabase = createServiceSupabaseClient();

    // Get participant details by auth_user_id (Clerk user ID)
    let participant = null;

    // First try by auth_user_id
    const { data: byAuthId } = await supabase
      .from('participants')
      .select('id, email, is_admin, is_mentor')
      .eq('auth_user_id', userId)
      .single();

    if (byAuthId) {
      participant = byAuthId;
    }

    // If not found, check admin_users table
    let isAdminUser = false;
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (adminUser) {
      isAdminUser = true;
    }

    const authUser: AuthenticatedUser = {
      id: userId,
      email: participant?.email || '',
      isAdmin: participant?.is_admin || isAdminUser || false,
      isMentor: participant?.is_mentor || false,
      participantId: participant?.id,
    };

    logSecurityEvent('auth_success', {
      userId: userId,
      path: request.nextUrl.pathname,
    });

    return {
      authenticated: true,
      user: authUser,
    };
  } catch (err) {
    logSecurityEvent('auth_failure', {
      path: request.nextUrl.pathname,
      reason: err instanceof Error ? err.message : 'Unknown error',
    });

    return {
      authenticated: false,
      response: NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      ),
    };
  }
}

/**
 * Verify that the request is from an admin user
 * Returns the user information if admin, or an error response
 */
export async function requireAdmin(
  request: NextRequest
): Promise<AuthResult | AuthError> {
  const authResult = await requireAuth(request);

  if (!authResult.authenticated) {
    return authResult;
  }

  if (!authResult.user.isAdmin) {
    logSecurityEvent('forbidden', {
      userId: authResult.user.id,
      path: request.nextUrl.pathname,
      reason: 'Admin access required',
    });

    return {
      authenticated: false,
      response: NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      ),
    };
  }

  return authResult;
}

/**
 * Verify that the request is from an admin or mentor
 * Mentors have special permissions for reviews
 *
 * Security: Only users with is_admin=true OR is_mentor=true can access.
 * Add is_mentor column to participants table to enable mentor access:
 *   ALTER TABLE participants ADD COLUMN IF NOT EXISTS is_mentor BOOLEAN NOT NULL DEFAULT false;
 */
export async function requireAdminOrMentor(
  request: NextRequest
): Promise<AuthResult | AuthError> {
  const authResult = await requireAuth(request);

  if (!authResult.authenticated) {
    return authResult;
  }

  // Security: Require explicit admin or mentor role
  if (!authResult.user.isAdmin && !authResult.user.isMentor) {
    logSecurityEvent('forbidden', {
      userId: authResult.user.id,
      path: request.nextUrl.pathname,
      reason: 'Mentor or admin access required',
    });

    return {
      authenticated: false,
      response: NextResponse.json(
        { error: 'Mentor or admin access required' },
        { status: 403 }
      ),
    };
  }

  return authResult;
}

/**
 * Get correlation ID from request headers
 */
export function getCorrelationId(request: NextRequest): string | undefined {
  return request.headers.get('x-correlation-id') || undefined;
}

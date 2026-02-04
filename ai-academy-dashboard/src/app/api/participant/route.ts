import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { createServiceSupabaseClient } from '@/lib/supabase';

// GET /api/participant - Get current user's participant data
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    const clerkUser = await currentUser();

    if (!userId || !clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServiceSupabaseClient();

    const email = clerkUser.primaryEmailAddress?.emailAddress;
    const githubUsername = clerkUser.externalAccounts?.find(
      (acc) => acc.provider === 'github'
    )?.username;

    // Try by email first
    if (email) {
      const { data } = await supabase
        .from('participants')
        .select('*')
        .eq('email', email)
        .single();
      if (data) {
        return NextResponse.json({ participant: data });
      }
    }

    // Try by github_username
    if (githubUsername) {
      const { data } = await supabase
        .from('participants')
        .select('*')
        .eq('github_username', githubUsername)
        .single();
      if (data) {
        return NextResponse.json({ participant: data });
      }
    }

    // Try by auth_user_id (Clerk user ID)
    const { data } = await supabase
      .from('participants')
      .select('*')
      .eq('auth_user_id', userId)
      .single();

    if (data) {
      return NextResponse.json({ participant: data });
    }

    return NextResponse.json({ participant: null });
  } catch (error) {
    console.error('Get participant error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/participant - Update participant (link Clerk user ID)
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();
    const clerkUser = await currentUser();

    if (!userId || !clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { participant_id } = body;

    if (!participant_id) {
      return NextResponse.json({ error: 'participant_id required' }, { status: 400 });
    }

    const supabase = createServiceSupabaseClient();

    // Build updates
    const updates: Record<string, string> = {
      auth_user_id: userId,
    };

    const githubUsername = clerkUser.externalAccounts?.find(
      (acc) => acc.provider === 'github'
    )?.username;

    if (githubUsername) {
      // Only update github_username if not already set
      const { data: existing } = await supabase
        .from('participants')
        .select('github_username')
        .eq('id', participant_id)
        .single();

      if (!existing?.github_username) {
        updates.github_username = githubUsername;
      }
    }

    if (clerkUser.imageUrl) {
      // Only update avatar_url if not already set
      const { data: existing } = await supabase
        .from('participants')
        .select('avatar_url')
        .eq('id', participant_id)
        .single();

      if (!existing?.avatar_url) {
        updates.avatar_url = clerkUser.imageUrl;
      }
    }

    const { error } = await supabase
      .from('participants')
      .update(updates)
      .eq('id', participant_id);

    if (error) {
      console.error('Update participant error:', error);
      return NextResponse.json({ error: 'Failed to update participant' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update participant error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/participant/admin - Check if user is admin
export async function HEAD(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse(null, { status: 401 });
    }

    const supabase = createServiceSupabaseClient();

    const { data } = await supabase
      .from('admin_users')
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (data) {
      return new NextResponse(null, { status: 200, headers: { 'X-Is-Admin': 'true' } });
    }

    return new NextResponse(null, { status: 200, headers: { 'X-Is-Admin': 'false' } });
  } catch (error) {
    console.error('Check admin error:', error);
    return new NextResponse(null, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { createServiceSupabaseClient } from '@/lib/supabase';

// Valid values for profile fields
const VALID_ROLES = ['FDE', 'AI-SE', 'AI-PM', 'AI-DA', 'AI-DS', 'AI-SEC', 'AI-FE'];
const VALID_TEAMS = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta'];
const VALID_STREAMS = ['Tech', 'Business'];

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

// PATCH /api/participant - Update participant profile
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();
    const clerkUser = await currentUser();

    if (!userId || !clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { participant_id, role, team, stream } = body;

    if (!participant_id) {
      return NextResponse.json({ error: 'participant_id required' }, { status: 400 });
    }

    const supabase = createServiceSupabaseClient();

    // Verify this participant belongs to the authenticated user
    const { data: existingParticipant } = await supabase
      .from('participants')
      .select('id, auth_user_id, github_username, avatar_url')
      .eq('id', participant_id)
      .single();

    if (!existingParticipant) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
    }

    // Security: Only allow updating own participant record
    // Allow if auth_user_id matches, or if it's not set yet (first link)
    if (existingParticipant.auth_user_id && existingParticipant.auth_user_id !== userId) {
      return NextResponse.json({ error: 'Not authorized to update this participant' }, { status: 403 });
    }

    // Build updates
    const updates: Record<string, string | null> = {};

    // Always link auth_user_id if not already linked
    if (!existingParticipant.auth_user_id) {
      updates.auth_user_id = userId;
    }

    // Update role if provided and valid
    if (role !== undefined) {
      if (role === '' || role === null) {
        updates.role = null;
      } else if (VALID_ROLES.includes(role)) {
        updates.role = role;
      } else {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
      }
    }

    // Update team if provided and valid
    if (team !== undefined) {
      if (team === '' || team === null) {
        updates.team = null;
      } else if (VALID_TEAMS.includes(team)) {
        updates.team = team;
      } else {
        return NextResponse.json({ error: 'Invalid team' }, { status: 400 });
      }
    }

    // Update stream if provided and valid
    if (stream !== undefined) {
      if (stream === '' || stream === null) {
        updates.stream = null;
      } else if (VALID_STREAMS.includes(stream)) {
        updates.stream = stream;
      } else {
        return NextResponse.json({ error: 'Invalid stream' }, { status: 400 });
      }
    }

    // Link GitHub username if available and not already set
    const githubUsername = clerkUser.externalAccounts?.find(
      (acc) => acc.provider === 'github'
    )?.username;

    if (githubUsername && !existingParticipant.github_username) {
      updates.github_username = githubUsername;
    }

    // Link avatar if available and not already set
    if (clerkUser.imageUrl && !existingParticipant.avatar_url) {
      updates.avatar_url = clerkUser.imageUrl;
    }

    // Perform update if there are changes
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: true, message: 'No changes' });
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

// HEAD /api/participant - Check if user is admin
export async function HEAD() {
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

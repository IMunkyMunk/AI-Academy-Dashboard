import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServiceSupabaseClient } from '@/lib/supabase';

// Check if user is admin
async function checkAdmin(userId: string) {
  const supabase = createServiceSupabaseClient();

  const { data: participant } = await supabase
    .from('participants')
    .select('id, is_admin')
    .eq('auth_user_id', userId)
    .single();

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('id')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();

  return participant?.is_admin || !!adminUser;
}

// GET /api/admin/users - Get all participants
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = await checkAdmin(userId);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const supabase = createServiceSupabaseClient();

    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching participants:', error);
      return NextResponse.json({ error: 'Failed to fetch participants' }, { status: 500 });
    }

    return NextResponse.json({ participants: data || [] });
  } catch (error) {
    console.error('Admin users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/admin/users - Update participant status
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = await checkAdmin(userId);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { participant_id, status } = body;

    if (!participant_id) {
      return NextResponse.json({ error: 'participant_id required' }, { status: 400 });
    }

    // Validate status
    const validStatuses = ['pending', 'approved', 'rejected'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const supabase = createServiceSupabaseClient();

    const updates: Record<string, string> = {};
    if (status) updates.status = status;

    const { error } = await supabase
      .from('participants')
      .update(updates)
      .eq('id', participant_id);

    if (error) {
      console.error('Error updating participant:', error);
      return NextResponse.json({ error: 'Failed to update participant' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin users update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

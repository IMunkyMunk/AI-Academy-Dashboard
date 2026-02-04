import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServiceSupabaseClient } from '@/lib/supabase';

// GET /api/admin/data - Get admin dashboard data
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServiceSupabaseClient();

    // Check if user is admin
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

    if (!participant?.is_admin && !adminUser) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Fetch all data in parallel
    const [submissionsResult, participantsResult, intelResult, sessionsResult, taskForcesResult] = await Promise.all([
      supabase
        .from('submissions')
        .select('*, participants(name, github_username, avatar_url, role, team), assignments(title, day, type)')
        .order('submitted_at', { ascending: false }),
      supabase
        .from('participants')
        .select('id, name, github_username, avatar_url, role')
        .order('name'),
      // Pending intel count
      supabase
        .from('intel_drops')
        .select('id', { count: 'exact', head: true })
        .eq('is_released', false),
      // Active sessions count
      supabase
        .from('live_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true),
      // Task force overall readiness
      supabase
        .from('task_forces')
        .select('overall_readiness'),
    ]);

    // Calculate mission stats
    const avgReadiness = taskForcesResult.data
      ? taskForcesResult.data.reduce((sum, tf) => sum + (tf.overall_readiness || 0), 0) / Math.max(taskForcesResult.data.length, 1)
      : 0;

    return NextResponse.json({
      submissions: submissionsResult.data || [],
      participants: participantsResult.data || [],
      missionStats: {
        pendingIntel: intelResult.count || 0,
        activeSessions: sessionsResult.count || 0,
        taskForceReadiness: Math.round(avgReadiness),
      },
    });
  } catch (error) {
    console.error('Admin data error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

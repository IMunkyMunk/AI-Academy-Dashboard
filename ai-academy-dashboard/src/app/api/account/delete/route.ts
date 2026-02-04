import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServiceSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function DELETE(_request: NextRequest) {
  try {
    // Get authenticated user from Clerk
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const serviceSupabase = createServiceSupabaseClient();

    // Find participant record by Clerk user ID
    const { data: participant } = await serviceSupabase
      .from('participants')
      .select('id, email')
      .eq('auth_user_id', userId)
      .single();

    if (participant) {
      // Delete related records first (due to foreign key constraints)
      await serviceSupabase
        .from('submissions')
        .delete()
        .eq('participant_id', participant.id);

      await serviceSupabase
        .from('peer_reviews')
        .delete()
        .eq('reviewer_id', participant.id);

      await serviceSupabase
        .from('participant_achievements')
        .delete()
        .eq('participant_id', participant.id);

      await serviceSupabase
        .from('leaderboard')
        .delete()
        .eq('participant_id', participant.id);

      await serviceSupabase
        .from('participant_mastery')
        .delete()
        .eq('participant_id', participant.id);

      await serviceSupabase
        .from('task_force_members')
        .delete()
        .eq('participant_id', participant.id);

      await serviceSupabase
        .from('participant_recognitions')
        .delete()
        .eq('participant_id', participant.id);

      await serviceSupabase
        .from('activity_log')
        .delete()
        .eq('participant_id', participant.id);

      await serviceSupabase
        .from('comments')
        .delete()
        .eq('author_id', participant.id);

      // Delete participant record
      await serviceSupabase
        .from('participants')
        .delete()
        .eq('id', participant.id);
    }

    // Note: Clerk user deletion should be handled separately via Clerk Admin API
    // The participant data in Supabase has been deleted above

    logger.info('User participant data deleted', { userId, email: participant?.email });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Account deletion error', {}, error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { createServerSupabaseClient, createServiceSupabaseClient } from '@/lib/supabase-server';
import { auth } from '@clerk/nextjs/server';
import { IntelDropsPage } from '@/components/IntelDropsPage';
import type { IntelDrop } from '@/lib/types';

export const revalidate = 0;

export default async function IntelPage() {
  const supabase = await createServerSupabaseClient();

  // Fetch all released intel drops
  const { data: intelDrops } = await supabase
    .from('intel_drops')
    .select('*')
    .eq('is_released', true)
    .order('day', { ascending: false });

  // Get user's task force for filtering
  const { userId } = await auth();

  let userTaskForce: string | null = null;
  if (userId) {
    const serviceSupabase = createServiceSupabaseClient();
    const { data: participant } = await serviceSupabase
      .from('participants')
      .select(`
        task_force_members(task_forces(name))
      `)
      .eq('auth_user_id', userId)
      .single();

    // Extract task force name from nested structure
    const tfMembers = participant?.task_force_members;
    if (Array.isArray(tfMembers) && tfMembers.length > 0) {
      const firstMember = tfMembers[0] as { task_forces?: { name?: string } | { name?: string }[] };
      if (firstMember?.task_forces) {
        if (Array.isArray(firstMember.task_forces)) {
          userTaskForce = firstMember.task_forces[0]?.name ?? null;
        } else {
          userTaskForce = firstMember.task_forces.name ?? null;
        }
      }
    }
  }

  return (
    <IntelDropsPage
      intelDrops={(intelDrops as IntelDrop[]) ?? []}
      userTaskForce={userTaskForce}
    />
  );
}

'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { createBrowserClient } from '@supabase/ssr';
import type { Participant, UserStatus } from '@/lib/types';

interface ParticipantContextType {
  participant: Participant | null;
  isLoading: boolean;
  isAdmin: boolean;
  isActualAdmin: boolean;
  viewAsUser: boolean;
  setViewAsUser: (value: boolean) => void;
  userStatus: UserStatus | 'no_profile' | null;
  refreshParticipant: () => Promise<void>;
}

const ParticipantContext = createContext<ParticipantContextType>({
  participant: null,
  isLoading: true,
  isAdmin: false,
  isActualAdmin: false,
  viewAsUser: false,
  setViewAsUser: () => {},
  userStatus: null,
  refreshParticipant: async () => {},
});

function createSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export function ParticipantProvider({ children }: { children: React.ReactNode }) {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActualAdmin, setIsActualAdmin] = useState(false);
  const [viewAsUser, setViewAsUser] = useState(false);
  const [userStatus, setUserStatus] = useState<UserStatus | 'no_profile' | null>(null);
  const [supabase] = useState(() => createSupabaseClient());

  const isAdmin = isActualAdmin && !viewAsUser;

  // Fetch participant by email, github_username, or auth_user_id
  const fetchParticipant = useCallback(async (): Promise<Participant | null> => {
    if (!clerkUser) return null;

    try {
      const email = clerkUser.primaryEmailAddress?.emailAddress;
      const githubUsername = clerkUser.externalAccounts?.find(
        (acc) => acc.provider === 'github'
      )?.username;
      const clerkUserId = clerkUser.id;

      // Try by email first
      if (email) {
        const { data } = await supabase
          .from('participants')
          .select('*')
          .eq('email', email)
          .single();
        if (data) return data as Participant;
      }

      // Try by github_username
      if (githubUsername) {
        const { data } = await supabase
          .from('participants')
          .select('*')
          .eq('github_username', githubUsername)
          .single();
        if (data) return data as Participant;
      }

      // Try by auth_user_id (Clerk user ID)
      const { data } = await supabase
        .from('participants')
        .select('*')
        .eq('auth_user_id', clerkUserId)
        .single();
      return data as Participant | null;
    } catch (error) {
      console.error('fetchParticipant error:', error);
      return null;
    }
  }, [clerkUser, supabase]);

  // Check admin status in admin_users table
  const checkAdminUser = useCallback(async (): Promise<boolean> => {
    if (!clerkUser) return false;

    try {
      const { data } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', clerkUser.id)
        .eq('is_active', true)
        .single();
      return !!data;
    } catch {
      return false;
    }
  }, [clerkUser, supabase]);

  // Link Clerk user ID to participant if not already linked
  const linkParticipant = useCallback(async (participantData: Participant) => {
    if (!clerkUser || participantData.auth_user_id === clerkUser.id) return;

    const githubUsername = clerkUser.externalAccounts?.find(
      (acc) => acc.provider === 'github'
    )?.username;

    const updates: Record<string, string> = {
      auth_user_id: clerkUser.id,
    };

    if (githubUsername && !participantData.github_username) {
      updates.github_username = githubUsername;
    }

    if (clerkUser.imageUrl && !participantData.avatar_url) {
      updates.avatar_url = clerkUser.imageUrl;
    }

    await supabase
      .from('participants')
      .update(updates)
      .eq('id', participantData.id);
  }, [clerkUser, supabase]);

  const refreshParticipant = useCallback(async () => {
    const participantData = await fetchParticipant();
    if (participantData) {
      setParticipant(participantData);
      setUserStatus(participantData.status || 'approved');
      setIsActualAdmin(participantData.is_admin || false);
    }
  }, [fetchParticipant]);

  // Load participant data when Clerk user is available
  useEffect(() => {
    if (!clerkLoaded) return;

    const loadData = async () => {
      setIsLoading(true);

      if (!clerkUser) {
        setParticipant(null);
        setUserStatus(null);
        setIsActualAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        const participantData = await fetchParticipant();

        if (participantData) {
          setParticipant(participantData);
          setUserStatus(participantData.status || 'approved');
          setIsActualAdmin(participantData.is_admin || false);

          // Link Clerk user ID if needed
          await linkParticipant(participantData);
        } else {
          setUserStatus('no_profile');
        }

        // Check admin_users table
        const isAdminUser = await checkAdminUser();
        if (isAdminUser) {
          setIsActualAdmin(true);
          setUserStatus('approved');
        }
      } catch (error) {
        console.error('Error loading participant data:', error);
        setUserStatus('approved'); // Assume approved if we can't check
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [clerkUser, clerkLoaded, fetchParticipant, checkAdminUser, linkParticipant]);

  return (
    <ParticipantContext.Provider
      value={{
        participant,
        isLoading,
        isAdmin,
        isActualAdmin,
        viewAsUser,
        setViewAsUser,
        userStatus,
        refreshParticipant,
      }}
    >
      {children}
    </ParticipantContext.Provider>
  );
}

export function useParticipant() {
  const context = useContext(ParticipantContext);
  if (!context) {
    throw new Error('useParticipant must be used within a ParticipantProvider');
  }
  return context;
}

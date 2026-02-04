'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
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

export function ParticipantProvider({ children }: { children: React.ReactNode }) {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActualAdmin, setIsActualAdmin] = useState(false);
  const [viewAsUser, setViewAsUser] = useState(false);
  const [userStatus, setUserStatus] = useState<UserStatus | 'no_profile' | null>(null);

  const isAdmin = isActualAdmin && !viewAsUser;

  // Fetch participant via API (uses service role, bypasses RLS)
  const fetchParticipant = useCallback(async (): Promise<Participant | null> => {
    if (!clerkUser) return null;

    try {
      const response = await fetch('/api/participant');
      if (!response.ok) {
        if (response.status === 401) return null;
        throw new Error('Failed to fetch participant');
      }
      const data = await response.json();
      return data.participant as Participant | null;
    } catch (error) {
      console.error('fetchParticipant error:', error);
      return null;
    }
  }, [clerkUser]);

  // Check admin status via API
  const checkAdminUser = useCallback(async (): Promise<boolean> => {
    if (!clerkUser) return false;

    try {
      const response = await fetch('/api/participant', { method: 'HEAD' });
      const isAdminHeader = response.headers.get('X-Is-Admin');
      return isAdminHeader === 'true';
    } catch {
      return false;
    }
  }, [clerkUser]);

  // Link Clerk user ID to participant via API
  const linkParticipant = useCallback(async (participantData: Participant) => {
    if (!clerkUser || participantData.auth_user_id === clerkUser.id) return;

    try {
      await fetch('/api/participant', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participant_id: participantData.id }),
      });
    } catch (error) {
      console.error('linkParticipant error:', error);
    }
  }, [clerkUser]);

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

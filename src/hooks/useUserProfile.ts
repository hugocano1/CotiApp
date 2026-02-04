// src/hooks/useUserProfile.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/auth/config/supabaseClient';
import { useAuth } from './useAuth';
import { BuyerProfile, SellerProfile } from '../types/entities';

export function useUserProfile() {
  const { session, loading: authLoading } = useAuth();

  const [profile, setProfile] = useState<BuyerProfile | SellerProfile | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!session?.user) {
      setLoading(false);
      return;
    }

    const userRole = session.user.user_metadata?.user_type;
    setRole(userRole);

    if (!userRole) {
      setLoading(false);
      return;
    }

    try {
      let profileData: BuyerProfile | SellerProfile | null = null;

      if (userRole === 'buyer') {
        const { data, error } = await supabase
          .from('buyer_profiles')
          .select<`*`>('*') // Using Supabase generics
          .eq('user_id', session.user.id)
          .maybeSingle();
        if (error) throw error;
        profileData = data;
      } else if (userRole === 'seller') {
        const { data, error } = await supabase
          .from('seller_profiles')
          .select<`*, stores(*)`>('*, stores(*)') // Using Supabase generics
          .eq('user_id', session.user.id)
          .maybeSingle();
        if (error) throw error;
        profileData = data;
      }

      setProfile(profileData);

    } catch (error) {
      console.error(`Error fetching profile for role ${userRole}:`, error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (!authLoading && session) {
      fetchProfile();
    } else if (!authLoading && !session) {
      setLoading(false);
    }
  }, [session, authLoading, fetchProfile]);

  return { profile, role, loading, refreshProfile: fetchProfile };
}
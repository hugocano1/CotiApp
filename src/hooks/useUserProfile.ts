// src/hooks/useUserProfile.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/auth/config/supabaseClient'; // Ajusta la ruta si es necesario
import { useAuth } from './useAuth';

export function useUserProfile() {
  const { session, loading: authLoading } = useAuth(); // Renombramos 'loading' para evitar conflictos

  const [profile, setProfile] = useState<any | null>(null);
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

    const profileTable = userRole === 'buyer' ? 'buyer_profiles' : 'seller_profiles';

    try {
      const { data, error } = await supabase
        .from(profileTable)
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (error) {
        throw error;
      }

      setProfile(data);

    } catch (error) {
      console.error(`Error fetching profile for role ${userRole}:`, error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    // Solo intentamos buscar el perfil cuando la sesión ha terminado de cargar y existe
    if (!authLoading && session) {
      fetchProfile();
    } else if (!authLoading && !session) {
      // Si no hay sesión, terminamos la carga
      setLoading(false);
    }
  }, [session, authLoading, fetchProfile]);

  return { profile, role, loading, refreshProfile: fetchProfile };
}
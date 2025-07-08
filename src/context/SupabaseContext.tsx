import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://besyjnekyhwawdmocehw.supabase.co'; // Reemplaza con tu URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlc3lqbmVreWh3YXdkbW9jZWh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5MDA2NjMsImV4cCI6MjA1NzQ3NjY2M30.9CR_BuwcCKOy8YpRu8057Y90rPcynriqF9gqzbH9fAw'; // Reemplaza con tu clave pública

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface SupabaseContextType {
  supabase: SupabaseClient;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export const SupabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SupabaseContext.Provider value={{ supabase }}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase debe usarse dentro de un SupabaseProvider');
  }
  return context;
};

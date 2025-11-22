import React, { createContext, useContext } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Obtener las variables de entorno desde la configuración extra de app.config.js
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
const supabaseKey = Constants.expoConfig?.extra?.supabaseKey;

// Validar que las variables de entorno estén presentes
if (!supabaseUrl || !supabaseKey) {
  throw new Error("Las variables de entorno de Supabase (supabaseUrl y supabaseKey) no están configuradas. Revisa tu archivo app.config.js y .env");
}

const supabase = createClient(supabaseUrl, supabaseKey);

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

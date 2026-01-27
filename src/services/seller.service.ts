// src/services/seller.service.ts
import { supabase } from './auth/config/supabaseClient';
import { SellerWallet } from '../types/entities';

export class SellerService {
  /**
   * Obtiene la billetera del vendedor actual.
   */
  static async getMyWallet(): Promise<SellerWallet | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuario no autenticado.");

    const { data, error } = await supabase
      .from('seller_wallets')
      .select('*')
      .eq('seller_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No wallet found
      console.error("Error fetching seller wallet:", error);
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Obtiene el historial de transacciones de la billetera del vendedor.
   */
  static async getTransactions(walletId: string, page: number = 0, limit: number = 20) {
    const from = page * limit;
    const to = from + limit - 1;

    const { data, error } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('wallet_id', walletId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Error fetching transactions:", error);
      throw new Error(error.message);
    }

    return data || [];
  }
}

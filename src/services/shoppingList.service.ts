// Ruta: src/services/shoppingList.service.ts
import { supabase } from './auth/config/supabaseClient'; 

export class ShoppingListService {

  static async createShoppingList(listData: { 
    title: string; 
    items: any[];
    delivery_type: 'delivery' | 'pickup';
    delivery_date?: Date;
    min_budget?: number; // ✅ AÑADIDO
    max_budget?: number; // ✅ AÑADIDO
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuario no autenticado.");

    const itemsForDb = listData.items.map(item => ({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      brand: item.brand || null,
      notes: item.notes || null
    }));

    const { error } = await supabase.from('shopping_lists').insert({
      title: listData.title,
      items: itemsForDb,
      buyer_id: user.id,
      status: 'active',
      delivery_type: listData.delivery_type,
      delivery_date: listData.delivery_date?.toISOString(),
      min_budget: listData.min_budget, // ✅ AÑADIDO
      max_budget: listData.max_budget, // ✅ AÑADIDO
    });

    if (error) {
      console.error("Error creating shopping list:", error);
      throw new Error(error.message);
    }
    return { success: true };
  }
  
  static async getActiveLists() {
    const { data, error } = await supabase.from('shopping_lists').select('*').eq('status', 'active').order('created_at', { ascending: false });
    if (error) { console.error("Error fetching active lists:", error); throw new Error(error.message); }
    return data || [];
  }

  static async getListDetails(listId: string) {
    const { data, error } = await supabase.from('shopping_lists').select('*').eq('id', listId).single();
    if (error) { console.error("Error fetching list details:", error); throw new Error(error.message); }
    return data;
  }

  // 👇 FUNCIÓN AÑADIDA 👇
  static async getOfferDetails(offerId: string) {
    const { data, error } = await supabase
      .from('offers')
      .select(`
        *,
        shopping_lists (
          *,
          buyer:buyer_profiles (
            user_id,
            nombre,
            apellido
          )
        )
      `)
      .eq('id', offerId)
      .single();

    if (error) {
      console.error("Error fetching offer details:", error);
      throw new Error(error.message);
    }

    return data;
  }

  static async getOffersForList(listId: string) {
    const { data, error } = await supabase.from('offers').select(`*, sellers:seller_id (store_id, stores (name, logo_url, rating) )`).eq('shopping_list_id', listId).order('price', { ascending: true });
    if (error) { console.error("Error fetching offers for list:", error); throw new Error(error.message); }
    return data || [];
  }

  static async acceptOffer(offerId: string, listId: string) {
    const { error } = await supabase.rpc('accept_offer', { offer_id_to_accept: offerId, list_id_to_close: listId });
    if (error) { console.error("Error accepting offer:", error); throw new Error(error.message); }
    return { success: true };
  }

  static async createOffer(offerData: {
    shopping_list_id: string;
    total_price: number;
    notes?: string;
  }) {
    // En la función createOffer
    const { error } = await supabase.rpc('submit_offer_and_notify', {
    shopping_list_id_arg: String(offerData.shopping_list_id), // Forzar a String
    price_arg: Number(offerData.total_price), // Forzar a Number
    notes_arg: String(offerData.notes || ''), // Forzar a String, evitar undefined
});

    if (error) {
      console.error("Error submitting offer:", error);
      throw new Error(error.message);
    }
    return { success: true };
  }
}
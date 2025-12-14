// Ruta: src/services/shoppingList.service.ts
import { supabase } from './auth/config/supabaseClient';
import { Offer, ShoppingListItem, OfferItem } from '../types/entities';

export class ShoppingListService {

  static async createShoppingList(listData: { 
    title: string; 
    items: ShoppingListItem[];
    delivery_type: 'delivery' | 'pickup';
    delivery_date?: Date;
    min_budget?: number; 
    max_budget?: number; 
    delivery_address_text?: string;
    latitude?: number;
    longitude?: number;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuario no autenticado.");

    const itemsForDb = listData.items.map(item => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      brand: item.brand || null,
      notes: item.notes || null,
      image_url: item.image_url || null
    }));

    const { error } = await supabase.from('shopping_lists').insert({
      title: listData.title,
      items: itemsForDb,
      buyer_id: user.id,
      status: 'active',
      delivery_type: listData.delivery_type,
      delivery_date: listData.delivery_date?.toISOString(),
      min_budget: listData.min_budget, 
      max_budget: listData.max_budget, 
      delivery_address_text: listData.delivery_address_text,
      latitude: listData.latitude,
      longitude: listData.longitude,
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
    const { data, error } = await supabase.from('shopping_lists').select('*, buyer_profiles(nombre, apellido)').eq('id', listId).single();
    if (error) { console.error("Error fetching list details:", error); throw new Error(error.message); }
    return data;
  }

  static async getOfferDetails(offerId: string) {
    const { data, error } = await supabase
      .from('offers')
      .select(
        `
        *,
        offer_items(*),
        shopping_lists (
          *,
          buyer:buyer_profiles (
            user_id,
            nombre,
            apellido
          )
        )
      `
      )
      .eq('id', offerId)
      .single();

    if (error) {
      console.error("Error fetching offer details:", error);
      throw new Error(error.message);
    }

    return data;
  }

  static async getOffersForList(listId: string): Promise<Offer[]> {
    const { data, error } = await supabase
      .from('offers')
      .select<string, Offer>(
        `*,
        offer_items(*),
        seller_profiles:seller_id (
          user_id,
          nombre,
          stores (
            name
          )
        )`
      )
      .eq('shopping_list_id', listId)
      .order('price', { ascending: true });

    if (error) {
      console.error("Error fetching offers for list:", error);
      throw new Error(error.message);
    }
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
    const { error } = await supabase.rpc('submit_offer_and_notify', {
      shopping_list_id_arg: String(offerData.shopping_list_id),
      price_arg: Number(offerData.total_price),
      notes_arg: String(offerData.notes || ''),
    });

    if (error) {
      console.error("Error submitting offer:", error);
      throw new Error(error.message);
    }
    return { success: true };
  }

  static async createDetailedOffer(data: {
    shopping_list_id: string;
    total_price: number;
    notes?: string;
    items: OfferItem[];
    shipping_cost: number;
  }) {
    // El RPC `create_offer_and_notify` se encarga de toda la transacción,
    // incluyendo la creación de la oferta, sus artículos y la notificación push.
    
    // Preparamos los artículos para el formato JSON que espera la función RPC.
    // Aquí revertimos el workaround del `__ID__` que se añade en el cliente.
    const itemsForRpc = data.items.map(item => {
      const parts = item.item_name.split('__ID__');
      if (parts.length !== 2) {
        throw new Error(`ID del artículo de la lista no encontrado en el nombre: "${item.item_name}"`);
      }
      return {
        item_name: parts[0], // Nombre real
        list_item_id: parts[1], // ID del artículo de la lista original
        quantity: item.quantity,
        unit: item.unit,
        brand: item.brand,
        unit_price: item.unit_price,
      };
    });

    const { data: offerId, error } = await supabase.rpc('create_offer_and_notify', {
      p_shopping_list_id: data.shopping_list_id,
      p_total_price: data.total_price,
      p_notes: data.notes,
      p_shipping_cost: data.shipping_cost,
      p_items: itemsForRpc,
    });

    if (error) {
      console.error('Error calling create_offer_and_notify RPC:', error);
      throw new Error(`No se pudo crear la oferta: ${error.message}`);
    }

    return { success: true, offerId };
  }

  static async deleteShoppingList(listId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuario no autenticado.");

    const { error } = await supabase.rpc('delete_shopping_list', { p_list_id: listId });

    if (error) {
      console.error("Error deleting shopping list:", error);
      throw new Error(error.message);
    }
    return { success: true };
  }
}
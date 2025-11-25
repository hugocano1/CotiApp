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
    shipping_cost: number; // ✅ AÑADIDO
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuario no autenticado.");

    // 1. Insert the main offer
    const { data: offerData, error: offerError } = await supabase
      .from('offers')
      .insert({
        shopping_list_id: data.shopping_list_id,
        seller_id: user.id,
        price: data.total_price,
        notes: data.notes,
        status: 'pending',
        shipping_cost: data.shipping_cost, // ✅ AÑADIDO
      })
      .select('id')
      .single();

    if (offerError) {
      console.error('Error creating offer:', offerError);
      throw new Error(offerError.message);
    }

    const offer_id = offerData.id;

    // 2. Prepare the offer items with the new offer_id and the original list_item_id
    // WORKAROUND: Se extrae el list_item_id que viene adjunto al final del item_name como solución a un bug
    // de una propiedad que desaparece durante el envío desde el cliente. Esto revierte el hack del frontend.
    const offerItems = data.items.map(item => {
      const parts = item.item_name.split('__ID__');
      if (parts.length !== 2) {
        // Si el separador no está, algo salió muy mal.
        throw new Error(`ID del artículo de la lista no encontrado en el nombre: "${item.item_name}"`);
      }
      const realName = parts[0];
      const listItemId = parts[1];

      return {
        offer_id: offer_id,
        list_item_id: listItemId,
        item_name: realName,
        quantity: item.quantity,
        unit: item.unit,
        brand: item.brand,
        unit_price: item.unit_price,
      };
    });

    // 3. Insert the detailed items
    const { error: itemsError } = await supabase.from('offer_items').insert(offerItems);

    if (itemsError) {
      console.error('Error creating offer items:', itemsError);
      // If items fail, roll back the main offer to avoid incomplete data
      await supabase.from('offers').delete().eq('id', offer_id);
      throw new Error(itemsError.message);
    }

    return { success: true, offerId: offer_id };
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
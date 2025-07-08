// src/services/shoppingList.service.ts
import { supabase } from './auth/config/supabaseClient'; // Ajusta la ruta si es necesario

export class ShoppingListService {
  /**
   * Obtiene todas las listas de compras que están activas para que los vendedores las vean.
   */
  static async getActiveLists() {
    const { data, error } = await supabase
      .from('shopping_lists')
      .select('*') // Podríamos optimizar esto para traer solo los datos necesarios
      .eq('status', 'active')
      .order('created_at', { ascending: false }); // Mostrar las más nuevas primero

    if (error) {
      console.error("Error fetching active lists:", error);
      throw new Error(error.message);
    }

    return data || [];
  }

    static async getListDetails(listId: string) {
        const { data, error } = await supabase
        .from('shopping_lists')
        .select('*') // Traemos toda la información de la lista
        .eq('id', listId)
        .single(); // Usamos .single() porque esperamos un solo resultado

    if (error) {
        console.error("Error fetching list details:", error);
        throw new Error(error.message);
    }

    return data;
}
  static async getOfferDetails(offerId: string) {
  const { data, error } = await supabase
    .from('offers')
    .select(`
      *,
      shopping_lists (
        *,
        buyer:buyer_id (
          user_id,
          nombre,
          apellido
        )
      )
    `)
    .eq('id', offerId)
    .single(); // Esperamos un solo resultado

  if (error) {
    console.error("Error fetching offer details:", error);
    throw new Error(error.message);
  }

  return data;
}

  /**
 * Obtiene todas las ofertas para una lista de compras específica.
 * También trae la información del perfil del vendedor que hizo cada oferta.
 */
static async getOffersForList(listId: string) {
  const { data, error } = await supabase
    .from('offers')
    .select(`
      *,
      sellers:seller_id (
        store_id,
        stores (
          name,
          logo_url,
          rating
        )
      )
    `)
    .eq('shopping_list_id', listId)
    .order('price', { ascending: true }); // Mostrar las ofertas más baratas primero

  if (error) {
    console.error("Error fetching offers for list:", error);
    throw new Error(error.message);
  }

  return data || [];
}
  
  /**
 * Llama a la función RPC de la base de datos para aceptar una oferta.
 */
static async acceptOffer(offerId: string, listId: string) {
  const { error } = await supabase.rpc('accept_offer', {
    offer_id_to_accept: offerId,
    list_id_to_close: listId
  });

  if (error) {
    console.error("Error accepting offer:", error);
    throw new Error(error.message);
  }

  return { success: true };
}
  // Más adelante aquí podríamos añadir funciones como:
  // static async getListDetails(listId) { ... }
  // static async createOfferForList(offerData) { ... }
  static async createOffer(offerData: {
  shopping_list_id: string;
  total_price: number;
  notes?: string;
}) {
  // Obtenemos el ID del vendedor que está logueado
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuario no autenticado.");

  const { error } = await supabase.from('offers').insert({
    shopping_list_id: offerData.shopping_list_id,
    seller_id: user.id, // El ID del vendedor actual
    price: offerData.total_price,
    notes: offerData.notes,
    status: 'pending' // Asumimos que una nueva oferta tiene estado 'pending'
  });

  if (error) {
    console.error("Error creating offer:", error);
    throw new Error(error.message);
  }

  return { success: true };
}
}
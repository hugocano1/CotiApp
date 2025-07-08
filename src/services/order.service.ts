// src/services/order.service.ts
import { supabase } from './auth/config/supabaseClient';

export class OrderService {
  /**
   * Obtiene los detalles completos de un pedido, incluyendo la información
   * de la lista de compras, del comprador y del vendedor.
   */
  static async getOrderDetails(orderId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        shopping_lists ( title, items ),
        buyer_profiles:buyer_id ( nombre, apellido ),
        seller_profiles:seller_id ( nombre, stores ( name ) )
      `)
      .eq('id', orderId)
      .single();

    if (error) {
      console.error("Error fetching order details:", error);
      throw new Error(error.message);
    }

    return data;
  }

  /**
 * Llama a la función RPC para actualizar el estado de un pedido.
 */
  static async updateOrderStatus(orderId: string, newStatus: string) {
   const { error } = await supabase.rpc('update_order_status', {
    order_id_to_update: orderId,
    new_status: newStatus
    });

  if (error) {
    console.error("Error updating order status:", error);
    throw new Error(error.message);
  }

  return { success: true };
 }

 /**
 * Llama a la función RPC para que el comprador confirme la entrega
 * y marque el pedido como completado.
 */
  static async confirmDelivery(orderId: string) {
    const { error } = await supabase.rpc('confirm_delivery', {
     order_id_to_complete: orderId
    });

  if (error) {
    console.error("Error confirming delivery:", error);
    throw new Error(error.message);
  }

  return { success: true };
  }

  static async submitRating(orderId: string, ratingValue: number) {
    const { error } = await supabase.rpc('submit_rating', {
      p_order_id: orderId,
      p_rating_value: ratingValue
    });

  if (error) {
    console.error("Error submitting rating:", error);
    throw new Error(error.message);
  }
  return { success: true };
  }


}   
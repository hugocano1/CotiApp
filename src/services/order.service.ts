// src/services/order.service.ts
import { supabase } from './auth/config/supabaseClient';
import { Order } from '../types/entities';

export class OrderService {
  /**
   * Obtiene los detalles completos de un pedido, incluyendo la información
   * de la lista de compras, del comprador y del vendedor.
   */
  static async getOrderDetails(orderId: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select(
        `
        *,
        offer:offers (
          offer_items (*)
        ),
        shopping_lists ( title, delivery_date, delivery_type, delivery_address_text, latitude, longitude ),
        buyer_profiles:buyer_id ( nombre, apellido ),
        seller_profiles:seller_id ( nombre, stores ( name ) )
      `
      )
      .eq('id', orderId)
      .single();

    if (error) {
      console.error("Error fetching order details:", error);
      throw new Error(error.message);
    }

    // Map the nested offer_items to the top-level items property
    const orderData = data as any;
    const items = orderData.offer?.offer_items || [];
    
    const order: Order = {
      ...orderData,
      items: items,
    };

    return order;
  }

  /**
   * Llama al RPC para despachar un pedido.
   * La lógica interna de la BD decidirá si es 'ready_for_pickup' o 'in_transit'.
   */
  static async dispatchOrder(orderId: string) {
    const { error } = await supabase.rpc('seller_dispatch_order', {
      order_id_param: orderId,
    });

    if (error) {
      console.error("Error dispatching order:", error);
      throw new Error(error.message);
    }

    return { success: true };
  }

  /**
   * Llama al RPC para que el comprador confirme la recepción del pedido.
   * Cambia el estado a 'delivered_pending_confirmation'.
   */
  static async confirmReceipt(orderId: string) {
    const { error } = await supabase.rpc('buyer_confirm_receipt', {
      order_id_param: orderId,
    });

    if (error) {
      console.error("Error confirming receipt:", error);
      throw new Error(error.message);
    }

    return { success: true };
  }

  /**
   * Llama al RPC para que el vendedor confirme el pago y finalice el ciclo.
   * Esto descuenta la comisión de la billetera y pone el estado en 'completed'.
   */
  static async confirmPayment(orderId: string) {
    const { error } = await supabase.rpc('seller_confirm_payment', {
      order_id_param: orderId,
    });

    if (error) {
      console.error("Error confirming payment:", error);
      throw new Error(error.message);
    }

    return { success: true };
  }

  /**
   * Llama a la función RPC para que el comprador marque el pedido como completado.
   * @deprecated Usar confirmReceipt y luego el vendedor confirmPayment.
   */
  static async confirmDelivery(orderId: string) {
    return this.confirmReceipt(orderId);
  }

  static async submitRating(orderId: string, ratingValue: number) {
    const { error } = await supabase.rpc('submit_rating', {
      p_order_id: orderId,
      p_rating_value: ratingValue,
    });

    if (error) {
      console.error("Error submitting rating:", error);
      throw new Error(error.message);
    }
    return { success: true };
  }

  static async cancelOrder(orderId: string, reason: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuario no autenticado.");

    const { error } = await supabase.rpc('cancel_order', {
      p_order_id: orderId,
      p_reason: reason,
    });

    if (error) {
      console.error("Error canceling order:", error);
      throw new Error(error.message);
    }
    return { success: true };
  }
}
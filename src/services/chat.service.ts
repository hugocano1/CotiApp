// src/services/chat.service.ts
import { supabase } from './auth/config/supabaseClient';

export interface ChatMessage {
  id: string;
  order_id: string;
  sender_id: string;
  content: string;
  is_image: boolean;
  created_at: string;
  is_read?: boolean;
}

export interface ChatSummary {
  id: string; // order_id
  last_message: string;
  last_message_at: string;
  other_party_name: string;
  order_status: string;
  list_title: string;
}

export class ChatService {
  /**
   * Obtiene la lista de chats activos para la bandeja de entrada.
   */
  static async getActiveChats(): Promise<ChatSummary[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuario no autenticado.");

    const { data, error } = await supabase
      .from('orders')
      .select(`
        id, 
        status,
        buyer_id,
        seller_id,
        shopping_lists (title),
        buyer_profiles:buyer_id (nombre),
        seller_profiles:seller_id (nombre),
        order_messages (content, created_at)
      `)
      .not('status', 'in', '("completed","cancelled")')
      .order('created_at', { foreignTable: 'order_messages', ascending: false });

    if (error) {
      console.error("Error fetching active chats:", error);
      throw new Error(error.message);
    }

    return (data || []).map((order: any) => {
      const isBuyer = order.buyer_id === user.id;
      const otherPartyProfile = isBuyer ? order.seller_profiles : order.buyer_profiles;
      const lastMessage = order.order_messages?.[0];

      return {
        id: order.id,
        last_message: lastMessage?.content || "No hay mensajes aún",
        last_message_at: lastMessage?.created_at || "",
        other_party_name: otherPartyProfile?.nombre || "Usuario Desconocido",
        order_status: order.status,
        list_title: order.shopping_lists?.title || "Lista sin título"
      };
    });
  }

  /**
   * Obtiene el historial de mensajes de un pedido.
   */
  static async getMessages(orderId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('order_messages')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
      throw new Error(error.message);
    }

    return data || [];
  }

  /**
   * Envía un mensaje.
   */
  static async sendMessage(orderId: string, content: string, isImage: boolean = false) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuario no autenticado.");

    const { error } = await supabase
      .from('order_messages')
      .insert({
        order_id: orderId,
        sender_id: user.id,
        content: content,
        is_image: isImage,
      });

    if (error) {
      console.error("Error sending message:", error);
      throw new Error(error.message);
    }
  }

  /**
   * Marca mensajes como leídos
   */
  static async markMessagesAsRead(orderId: string, userId: string) {
    const { error } = await supabase
      .from('order_messages')
      .update({ is_read: true })
      .eq('order_id', orderId)
      .neq('sender_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error("Error marking messages as read:", error);
    }
  }

  /**
   * Suscribe a cambios en tiempo real para un pedido específico.
   */
  static subscribeToMessages(orderId: string, onNewMessage: (message: ChatMessage) => void) {
    return supabase
      .channel(`chat:${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'order_messages',
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          onNewMessage(payload.new as ChatMessage);
        }
      )
      .subscribe();
  }
}

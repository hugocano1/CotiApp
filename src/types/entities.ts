// src/types/entities.ts

/**
 * Represents a seller's physical or virtual store.
 */
export interface Store {
  id: string;
  name: string;
  direccion?: string;
  horario_atencion?: string;
  store_logo_url?: string;
  opciones_entrega?: string;
}

/**
 * Base user profile with common fields.
 */
export interface UserProfile {
  user_id: string;
  nombre: string;
  foto_perfil?: string;
}

/**
 * Profile for a buyer user, extending the base profile.
 */
export interface BuyerProfile extends UserProfile {
  apellido?: string;
  calificacion_comprador?: number;
  direccion?: string;
  gender?: string;
  birth_date?: string; // Stored as YYYY-MM-DD
}

/**
 * Profile for a seller user, extending the base profile.
 */
export interface SellerProfile extends UserProfile {
  calificacion_vendedor?: number;
  stores?: Store;
  store_description?: string;
  store_id?: string;
}

/**
 * Represents a single item within a shopping list.
 */
export interface ShoppingListItem {
  id: string;
  name: string;
  quantity: number;
  unit?: string;
  brand?: string;
  notes?: string;
}

/**
 * Represents a single item within a seller's offer.
 */
export interface OfferItem {
  id: string;
  item_name: string;
  unit_price: number;
  quantity: number;
  unit?: string;
  brand?: string;
}

/**
 * Represents an offer made by a seller for a shopping list.
 */
export interface Offer {
  id: string;
  price: number;
  shipping_cost?: number; // ✅ AÑADIDO
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string; // ISO date string
  notes?: string;
  shopping_list_id: string;
  shopping_lists?: ShoppingList; // The associated shopping list
  seller_id: string;
  seller_profiles?: SellerProfile; // The seller who made the offer
  offer_items: OfferItem[];
}

/**
 * Represents a shopping list created by a buyer.
 */
export interface ShoppingList {
  id: string;
  title: string;
  status: 'active' | 'pending' | 'completed' | 'closed';
  created_at: string; // ISO date string
  delivery_date?: string; // ISO date string
  min_budget?: number;
  max_budget?: number;
  delivery_type?: 'pickup' | 'delivery';
  items: ShoppingListItem[];
  buyer_profiles?: BuyerProfile;
  buyer_id: string;
  offers?: Partial<Offer>[]; // Related offers, often partials
}

/**
 * Represents a final order created after an offer is accepted.
 */
export interface Order {
  id: string;
  total_price: number;
  status: 'confirmed' | 'enviado' | 'completed';
  created_at: string; // ISO date string
  pickup_code?: string; // ✅ AÑADIDO
  shopping_list_id: string;
  shopping_lists?: ShoppingList; // The original shopping list
  seller_id: string;
  seller_profiles?: SellerProfile; // The seller involved in the order
  buyer_id: string;
  buyer_profiles?: BuyerProfile; // The buyer involved in the order
  rating_for_seller?: number;
}

/**
 * Represents an in-app notification.
 */
export interface Notification {
  id: number;
  user_id: string;
  title: string;
  body: string;
  data?: { [key: string]: any }; // Para datos adicionales como orderId
  is_read: boolean;
  created_at: string; // ISO date string
}
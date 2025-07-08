// src/types/index.ts

export type UserRole = 'buyer' | 'seller';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  address: string;
  location: {
    latitude: number;
    longitude: number;
  };
  role: UserRole;
  rating: number;
  ratingCount: number;
  createdAt: Date;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  image?: string;
}

export interface ShoppingListItem {
  id: string; //Id
  productId: string; // References Product by id
  quantity: number;
  preferredBrand?: string;
  isRequired: boolean;
}

export interface ShoppingList {
  id: string;
  buyerId: string;
  title: string;
  items: {shoppingListItemId: string}[]; // References ShoppingListItem by id
  minBudget: number;
  maxBudget: number;
  frequency: 'once' | 'weekly' | 'biweekly' | 'monthly';
  status: 'active' | 'pending' | 'completed';
  deliveryAddress: string;
  location: {
    latitude: number;
    longitude: number;
  };
  createdAt: Date;
  expiresAt: Date;
}

export interface Offer {
  id: string;
  sellerId: string;
  shoppingListId: string;
  items: {
    productId: string;
    price: number;
    quantity: number;
    brand: string;
    alternativeBrand?: string;
  }[];
  totalPrice: number;
  deliveryTime: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: Date;
}

export interface Order {
  id: string;
  shoppingListId: string;
  offerId: string;
  buyerId: string;
  sellerId: string;
  items: {
    productId: string;
    name: string;
    brand: string;
    price: number;
    quantity: number;
  }[];
  totalPrice: number;
  status: 'preparing' | 'delivering' | 'delivered' | 'confirmed';
  createdAt: Date;
  deliveredAt?: Date;
  confirmedAt?: Date;
  buyerRating?: number;
  sellerRating?: number;
}
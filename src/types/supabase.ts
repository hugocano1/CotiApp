export type ShoppingList = {
    id: string;
    title: string;
    status: 'active' | 'pending' | 'completed';
    created_at: string;
    expires_at: string;
    items: Array<{ id: string; name: string; quantity: number }>;
    min_budget?: number;
    max_budget?: number;
    buyer_id: string;
  };
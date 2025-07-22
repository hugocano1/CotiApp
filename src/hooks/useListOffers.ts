// src/hooks/useListOffers.ts
import { useState, useEffect, useCallback } from 'react';
import { ShoppingListService } from '../services/shoppingList.service';
export function useListOffers(listId: string) {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchOffers = useCallback(async () => {
    if (!listId) return;
    try {
      const data = await ShoppingListService.getOffersForList(listId);
      setOffers(data);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  }, [listId]);
  useEffect(() => { fetchOffers(); }, [fetchOffers]);
  return { offers, loading };
}
// src/hooks/useOrderDetails.ts
import { useState, useCallback, useEffect } from 'react';
import { OrderService } from '../services/order.service';
import { Order } from '../types/entities';

export function useOrderDetails(orderId: string | undefined) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDetails = useCallback(async () => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await OrderService.getOrderDetails(orderId);
      setOrder(data || null); // data can be Order or null
    } catch (error) {
      console.error("Error fetching order details in hook:", error);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  // Devolvemos la función fetchDetails como 'refreshOrder' para poder recargar los datos manualmente
  return { order, loading, refreshOrder: fetchDetails };
}
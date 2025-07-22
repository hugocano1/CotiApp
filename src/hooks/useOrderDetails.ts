// src/hooks/useOrderDetails.ts
import { useState, useCallback, useEffect } from 'react';
import { OrderService } from '../services/order.service'; // Asegúrate que la ruta sea correcta

export function useOrderDetails(orderId: string | undefined) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDetails = useCallback(async () => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await OrderService.getOrderDetails(orderId);
      setOrder(data);
    } catch (error) { 
      console.error("Error fetching order details in hook:", error);
      setOrder(null);
    }
    finally { 
      setLoading(false); 
    }
  }, [orderId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  // Devolvemos la función fetchDetails como 'refreshOrder' para poder recargar los datos manualmente
  return { order, loading, refreshOrder: fetchDetails };
}
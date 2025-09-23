// src/utils/translations.ts

export const translateDeliveryType = (deliveryType: 'delivery' | 'pickup' | undefined | null): string => {
  if (!deliveryType) return 'No especificado';
  return deliveryType === 'delivery' ? 'Domicilio' : 'Recogida en tienda';
};

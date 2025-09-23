// src/utils/formatters.ts

export const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '$0';
  return `$${Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
};

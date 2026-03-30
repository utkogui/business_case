function toNumber(value: number | string): number {
  if (typeof value === 'number') return value;
  return Number(value);
}

export function formatCurrencyBRL(value: number | string): string {
  const numericValue = toNumber(value);

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2,
  }).format(numericValue);
}

export function formatPercentage(value: number | string): string {
  return `${toNumber(value).toFixed(2)}%`;
}

export function formatDate(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;

  return new Intl.DateTimeFormat('pt-BR').format(date);
}

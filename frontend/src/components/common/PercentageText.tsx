import { Typography } from 'antd';
import { formatPercentage } from '../../utils/formatters';

type PercentageTextProps = {
  value: number | string | null;
  withColor?: boolean;
};

export function PercentageText({ value, withColor = false }: PercentageTextProps) {
  if (value === null) return <Typography.Text style={{ whiteSpace: 'nowrap' }}>-</Typography.Text>;

  const numericValue = Number(value);
  const color = withColor ? (numericValue >= 25 ? '#389e0d' : numericValue >= 15 ? '#d48806' : '#cf1322') : undefined;

  return <Typography.Text style={{ color, whiteSpace: 'nowrap' }}>{formatPercentage(numericValue)}</Typography.Text>;
}

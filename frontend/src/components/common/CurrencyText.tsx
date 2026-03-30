import { Typography } from 'antd';
import { formatCurrencyBRL } from '../../utils/formatters';

type CurrencyTextProps = {
  value: number | string;
  strong?: boolean;
};

export function CurrencyText({ value, strong = false }: CurrencyTextProps) {
  return (
    <Typography.Text strong={strong} style={{ whiteSpace: 'nowrap' }}>
      {formatCurrencyBRL(value)}
    </Typography.Text>
  );
}

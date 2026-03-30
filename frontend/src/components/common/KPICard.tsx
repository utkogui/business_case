import { Card, Statistic, Typography } from 'antd';
import type { CSSProperties, ReactNode } from 'react';

type KPICardProps = {
  title: string;
  value: string | number | ReactNode;
  subtitle?: string;
  valueStyle?: CSSProperties;
};

export function KPICard({ title, value, subtitle, valueStyle }: KPICardProps) {
  return (
    <Card size="small">
      {typeof value === 'string' || typeof value === 'number' ? (
        <Statistic title={title} value={value} valueStyle={valueStyle} />
      ) : (
        <>
          <Typography.Text type="secondary">{title}</Typography.Text>
          <div style={{ marginTop: 6, fontSize: 24, fontWeight: 600 }}>{value}</div>
        </>
      )}
      {subtitle ? (
        <Typography.Text type="secondary" style={{ marginTop: 6, display: 'block' }}>
          {subtitle}
        </Typography.Text>
      ) : null}
    </Card>
  );
}

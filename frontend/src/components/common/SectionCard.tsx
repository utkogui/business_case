import { Card, Space, Typography } from 'antd';
import type { PropsWithChildren, ReactNode } from 'react';

type SectionCardProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  extra?: ReactNode;
}>;

export function SectionCard({ title, subtitle, extra, children }: SectionCardProps) {
  return (
    <Card>
      <Space direction="vertical" size={12} style={{ width: '100%' }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <div>
            <Typography.Title level={4} style={{ margin: 0 }}>
              {title}
            </Typography.Title>
            {subtitle ? <Typography.Text type="secondary">{subtitle}</Typography.Text> : null}
          </div>
          {extra}
        </Space>
        {children}
      </Space>
    </Card>
  );
}

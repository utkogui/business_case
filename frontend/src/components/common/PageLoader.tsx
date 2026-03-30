import { Skeleton, Space } from 'antd';

export function PageLoader() {
  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Skeleton active paragraph={{ rows: 1 }} />
      <Skeleton active paragraph={{ rows: 6 }} />
      <Skeleton active paragraph={{ rows: 6 }} />
    </Space>
  );
}

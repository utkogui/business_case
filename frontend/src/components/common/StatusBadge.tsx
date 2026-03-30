import { Tag } from 'antd';

type ProjectStatus = 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED' | string;

type StatusBadgeProps = {
  status: ProjectStatus;
};

const statusMap: Record<string, { label: string; color: string }> = {
  PLANNING: { label: 'Planejamento', color: 'blue' },
  IN_PROGRESS: { label: 'Em andamento', color: 'gold' },
  COMPLETED: { label: 'Concluido', color: 'green' },
  ARCHIVED: { label: 'Arquivado', color: 'default' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const mapped = statusMap[status] ?? { label: status, color: 'default' };
  return (
    <Tag color={mapped.color} style={{ whiteSpace: 'nowrap' }}>
      {mapped.label}
    </Tag>
  );
}

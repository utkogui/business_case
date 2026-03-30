import { Tag } from 'antd';
import type { HealthStatus } from '../../types/dashboard';

const labelByStatus: Record<HealthStatus, string> = {
  EXCELLENT: 'Excelente',
  HEALTHY: 'Saudavel',
  ATTENTION: 'Atencao',
  CRITICAL: 'Critico',
};

const colorByStatus: Record<HealthStatus, string> = {
  EXCELLENT: 'green',
  HEALTHY: 'cyan',
  ATTENTION: 'orange',
  CRITICAL: 'red',
};

type HealthBadgeProps = {
  status: HealthStatus;
};

export function HealthBadge({ status }: HealthBadgeProps) {
  return <Tag color={colorByStatus[status]}>{labelByStatus[status]}</Tag>;
}

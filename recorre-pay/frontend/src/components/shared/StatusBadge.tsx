import Badge from '../ui/Badge';
import { STATUS_COLORS } from '../../utils/constants';
import { getStatusLabel } from '../../utils/formatters';

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const variant = STATUS_COLORS[status as keyof typeof STATUS_COLORS] || 'default';
  const label = getStatusLabel(status);

  return <Badge variant={variant}>{label}</Badge>;
}

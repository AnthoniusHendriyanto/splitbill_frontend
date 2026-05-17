import useBillStore from '../store/useBillStore';
import { formatCurrency } from '../utils/currency';

export default function FormattedPrice({ value, className = '' }) {
  const currency = useBillStore((s) => s.settings?.currency || 'IDR');
  return (
    <span className={className}>
      {formatCurrency(value, currency)}
    </span>
  );
}

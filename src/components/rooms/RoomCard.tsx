import { RoomStatus } from '@/types/database';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface RoomCardProps {
  roomNumber: string;
  roomType: string;
  status: RoomStatus;
  floor: number;
  onClick?: () => void;
  isSelected?: boolean;
}

const statusConfig = {
  available: {
    label: 'Available',
    variant: 'success' as const,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  occupied: {
    label: 'Occupied',
    variant: 'destructive' as const,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  cleaning: {
    label: 'Cleaning',
    variant: 'warning' as const,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
  },
  maintenance: {
    label: 'Maintenance',
    variant: 'secondary' as const,
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
  },
};

export function RoomCard({ 
  roomNumber, 
  roomType, 
  status, 
  floor, 
  onClick, 
  isSelected 
}: RoomCardProps) {
  const config = statusConfig[status];

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-md',
        config.bgColor,
        config.borderColor,
        isSelected && 'ring-2 ring-blue-600 ring-offset-2',
        'group'
      )}
    >
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">{roomNumber}</span>
          <Badge variant={config.variant}>{config.label}</Badge>
        </div>
        <div className="text-sm text-gray-600">
          <div>{roomType}</div>
          <div className="text-xs text-gray-500">Floor {floor}</div>
        </div>
      </div>
      
      {/* Hover indicator */}
      <div className="absolute inset-0 rounded-lg bg-black opacity-0 transition-opacity group-hover:opacity-5" />
    </div>
  );
}

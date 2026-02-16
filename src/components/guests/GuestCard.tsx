import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Database } from '@/types/database';
import { format } from 'date-fns';

type Guest = Database['public']['Tables']['guests']['Row'];

interface GuestCardProps {
  guest: Guest & { total_stays?: number };
  onView: (guest: Guest) => void;
  onEdit: (guest: Guest) => void;
}

export function GuestCard({ guest, onView, onEdit }: GuestCardProps) {
  const fullName = `${guest.first_name} ${guest.last_name}`;

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {/* Avatar Initials */}
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                {guest.first_name[0]}
                {guest.last_name[0]}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{fullName}</h3>
                {guest.nationality && (
                  <p className="text-sm text-gray-500">{guest.nationality}</p>
                )}
              </div>
            </div>
          </div>
          <Badge variant={guest.is_active ? 'default' : 'secondary'}>
            {guest.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Contact Information */}
        <div className="space-y-1 text-sm">
          {guest.email && (
            <div className="flex items-center gap-2 text-gray-600">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span className="truncate">{guest.email}</span>
            </div>
          )}
          {guest.phone && (
            <div className="flex items-center gap-2 text-gray-600">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              <span>{guest.phone}</span>
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="flex items-center justify-between border-t pt-3 text-xs text-gray-500">
          <div>
            {guest.total_stays !== undefined && (
              <span className="font-medium">{guest.total_stays} stay(s)</span>
            )}
          </div>
          <div>
            Joined {format(new Date(guest.created_at), 'MMM yyyy')}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 border-t pt-3">
          <Button variant="outline" size="sm" onClick={() => onView(guest)} className="flex-1">
            View Profile
          </Button>
          <Button variant="default" size="sm" onClick={() => onEdit(guest)} className="flex-1">
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

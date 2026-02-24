import { useState } from 'react';
import { RoomGrid } from '@/components/rooms/RoomGrid';
import { RoomTypesManager } from '@/components/rooms/RoomTypesManager';
import { RoomCalendarView } from '@/components/rooms/RoomCalendarView';
import { BulkRoomOperations } from '@/components/rooms/BulkRoomOperations';
import { RoomAnalytics } from '@/components/rooms/RoomAnalytics';
import { Card } from '@/components/ui/card';
import { PermissionGuard } from '@/components/PermissionGuard';
import { PERMISSIONS } from '@/types/database';
import { 
  LayoutGrid, 
  Calendar, 
  BarChart3, 
  Settings, 
  CheckSquare 
} from 'lucide-react';

type View = 'grid' | 'calendar' | 'analytics' | 'bulk' | 'room-types';

export default function RoomsPage() {
  const [activeView, setActiveView] = useState<View>('grid');

  const tabs = [
    { id: 'grid' as const, label: 'Room Grid', icon: LayoutGrid, permission: PERMISSIONS.ROOMS_VIEW },
    { id: 'calendar' as const, label: 'Calendar View', icon: Calendar, permission: PERMISSIONS.ROOMS_VIEW },
    { id: 'analytics' as const, label: 'Analytics', icon: BarChart3, permission: PERMISSIONS.ROOMS_VIEW },
    { id: 'bulk' as const, label: 'Bulk Operations', icon: CheckSquare, permission: PERMISSIONS.ROOMS_UPDATE },
    { id: 'room-types' as const, label: 'Room Types', icon: Settings, permission: PERMISSIONS.ROOMS_CREATE },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Room Management</h1>
          <p className="mt-2 text-gray-600">
            Comprehensive room monitoring, analytics, and management suite
          </p>
        </div>

        {/* Navigation Tabs */}
        <Card className="mb-6">
          <div className="flex overflow-x-auto border-b border-gray-200">
            {tabs.map((tab) => (
              <PermissionGuard 
                key={tab.id}
                permissions={[tab.permission]}
                requireAll={false}
                fallback={null}
              >
                <button
                  onClick={() => setActiveView(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                    activeView === tab.id
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              </PermissionGuard>
            ))}
          </div>
        </Card>

        {/* Content */}
        <div className="pb-8">
          {activeView === 'grid' && <RoomGrid />}
          {activeView === 'calendar' && <RoomCalendarView />}
          {activeView === 'analytics' && <RoomAnalytics />}
          {activeView === 'bulk' && <BulkRoomOperations />}
          {activeView === 'room-types' && <RoomTypesManager />}
        </div>
      </div>
    </div>
  );
}

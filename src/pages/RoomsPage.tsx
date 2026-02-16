import { useState } from 'react';
import { RoomGrid } from '@/components/rooms/RoomGrid';
import { RoomTypesManager } from '@/components/rooms/RoomTypesManager';
import { Card } from '@/components/ui/card';

type View = 'rooms' | 'room-types';

export default function RoomsPage() {
  const [activeView, setActiveView] = useState<View>('rooms');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Room Management</h1>
          <p className="mt-2 text-gray-600">
            Monitor and manage your hotel rooms in real-time
          </p>
        </div>

        {/* Navigation Tabs */}
        <Card className="mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveView('rooms')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeView === 'rooms'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Room Dashboard
            </button>
            <button
              onClick={() => setActiveView('room-types')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeView === 'room-types'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Room Types
            </button>
          </div>
        </Card>

        {/* Content */}
        <div>
          {activeView === 'rooms' && <RoomGrid />}
          {activeView === 'room-types' && <RoomTypesManager />}
        </div>
      </div>
    </div>
  );
}

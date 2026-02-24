import { useState } from 'react';
import { useRooms } from '@/hooks/useRooms';
import { useRoomTypes } from '@/hooks/useRoomTypes';
import { RoomStatus } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, Save } from 'lucide-react';

interface RoomFilters {
  search: string;
  status: RoomStatus | 'all';
  floor: string;
  roomType: string;
  priceMin: string;
  priceMax: string;
}

interface SavedFilter extends RoomFilters {
  name: string;
  id: string;
}

export function AdvancedRoomFilters({
  onFiltersChange,
}: {
  onFiltersChange: (filters: RoomFilters) => void;
}) {
  const { data: rooms } = useRooms();
  const { data: roomTypes } = useRoomTypes();

  const [filters, setFilters] = useState<RoomFilters>({
    search: '',
    status: 'all',
    floor: 'all',
    roomType: 'all',
    priceMin: '',
    priceMax: '',
  });

  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [filterName, setFilterName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Get unique floors and room types
  const floors = Array.from(new Set(rooms?.map((room) => room.floor) || [])).sort(
    (a, b) => a - b
  );

  const handleFilterChange = (key: keyof RoomFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClearFilters = () => {
    const defaultFilters: RoomFilters = {
      search: '',
      status: 'all',
      floor: 'all',
      roomType: 'all',
      priceMin: '',
      priceMax: '',
    };
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const handleSaveFilter = () => {
    if (!filterName.trim()) {
      alert('Please enter a filter name');
      return;
    }

    const newFilter: SavedFilter = {
      ...filters,
      name: filterName,
      id: Date.now().toString(),
    };

    setSavedFilters([...savedFilters, newFilter]);
    setFilterName('');
    setShowSaveDialog(false);

    // Save to localStorage
    localStorage.setItem('savedRoomFilters', JSON.stringify([...savedFilters, newFilter]));
  };

  const handleLoadFilter = (savedFilter: SavedFilter) => {
    const { name, id, ...filterData } = savedFilter;
    setFilters(filterData);
    onFiltersChange(filterData);
  };

  const handleDeleteFilter = (filterId: string) => {
    const updated = savedFilters.filter((f) => f.id !== filterId);
    setSavedFilters(updated);
    localStorage.setItem('savedRoomFilters', JSON.stringify(updated));
  };

  const hasActiveFilters =
    filters.search ||
    filters.status !== 'all' ||
    filters.floor !== 'all' ||
    filters.roomType !== 'all' ||
    filters.priceMin ||
    filters.priceMax;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-600" />
            <CardTitle>Advanced Filters</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                <X className="mr-2 h-3 w-3" />
                Clear All
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSaveDialog(!showSaveDialog)}
            >
              <Save className="mr-2 h-3 w-3" />
              Save Filter
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Save Filter Dialog */}
        {showSaveDialog && (
          <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter Name
              </label>
              <Input
                type="text"
                placeholder="e.g., Available Deluxe Rooms"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveFilter} className="flex-1">
                Save
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowSaveDialog(false);
                  setFilterName('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Saved Filters */}
        {savedFilters.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Saved Filters
            </label>
            <div className="flex flex-wrap gap-2">
              {savedFilters.map((savedFilter) => (
                <Badge
                  key={savedFilter.id}
                  variant="secondary"
                  className="cursor-pointer group"
                >
                  <button onClick={() => handleLoadFilter(savedFilter)} className="mr-2">
                    {savedFilter.name}
                  </button>
                  <button
                    onClick={() => handleDeleteFilter(savedFilter.id)}
                    className="text-gray-500 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Filter Inputs */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Search */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Room number or type..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Status
            </label>
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <option value="all">All Statuses</option>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="cleaning">Cleaning</option>
              <option value="maintenance">Maintenance</option>
            </Select>
          </div>

          {/* Floor */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Floor
            </label>
            <Select
              value={filters.floor}
              onValueChange={(value) => handleFilterChange('floor', value)}
            >
              <option value="all">All Floors</option>
              {floors.map((floor) => (
                <option key={floor} value={floor.toString()}>
                  Floor {floor}
                </option>
              ))}
            </Select>
          </div>

          {/* Room Type */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Room Type
            </label>
            <Select
              value={filters.roomType}
              onValueChange={(value) => handleFilterChange('roomType', value)}
            >
              <option value="all">All Types</option>
              {roomTypes?.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </Select>
          </div>

          {/* Price Range */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Min Price
            </label>
            <Input
              type="number"
              placeholder="$0"
              value={filters.priceMin}
              onChange={(e) => handleFilterChange('priceMin', e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Max Price
            </label>
            <Input
              type="number"
              placeholder="$1000"
              value={filters.priceMax}
              onChange={(e) => handleFilterChange('priceMax', e.target.value)}
            />
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="rounded-md bg-blue-50 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-blue-900">Active filters:</span>
                {filters.search && (
                  <Badge variant="secondary">Search: {filters.search}</Badge>
                )}
                {filters.status !== 'all' && (
                  <Badge variant="secondary">Status: {filters.status}</Badge>
                )}
                {filters.floor !== 'all' && (
                  <Badge variant="secondary">Floor: {filters.floor}</Badge>
                )}
                {filters.roomType !== 'all' && (
                  <Badge variant="secondary">Type: {roomTypes?.find(t => t.id === filters.roomType)?.name}</Badge>
                )}
                {filters.priceMin && (
                  <Badge variant="secondary">Min: ${filters.priceMin}</Badge>
                )}
                {filters.priceMax && (
                  <Badge variant="secondary">Max: ${filters.priceMax}</Badge>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { useState } from 'react';
import { useRoomTypes, useCreateRoomType, useUpdateRoomType, useDeleteRoomType } from '@/hooks/useRoomTypes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Database } from '@/types/database';

type RoomType = Database['public']['Tables']['room_types']['Row'];

export function RoomTypesManager() {
  const { data: roomTypes, isLoading } = useRoomTypes();
  const createRoomType = useCreateRoomType();
  const updateRoomType = useUpdateRoomType();
  const deleteRoomType = useDeleteRoomType();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoomType, setEditingRoomType] = useState<RoomType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    base_price: '',
    max_adults: '',
    max_children: '',
    amenities: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      base_price: '',
      max_adults: '',
      max_children: '',
      amenities: '',
    });
    setEditingRoomType(null);
  };

  const handleOpenDialog = (roomType?: RoomType) => {
    if (roomType) {
      setEditingRoomType(roomType);
      setFormData({
        name: roomType.name,
        description: roomType.description || '',
        base_price: roomType.base_price.toString(),
        max_adults: roomType.max_adults.toString(),
        max_children: roomType.max_children.toString(),
        amenities: Array.isArray(roomType.amenities)
          ? (roomType.amenities as string[]).join(', ')
          : '',
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amenitiesArray = formData.amenities
      .split(',')
      .map((a) => a.trim())
      .filter((a) => a.length > 0);

    const roomTypeData = {
      name: formData.name,
      description: formData.description || null,
      base_price: parseFloat(formData.base_price),
      max_adults: parseInt(formData.max_adults),
      max_children: parseInt(formData.max_children),
      amenities: amenitiesArray,
    };

    try {
      if (editingRoomType) {
        await updateRoomType.mutateAsync({
          id: editingRoomType.id,
          ...roomTypeData,
        });
      } else {
        await createRoomType.mutateAsync(roomTypeData as any);
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to save room type:', error);
    }
  };

  const handleDelete = async (roomTypeId: string) => {
    if (confirm('Are you sure you want to delete this room type?')) {
      try {
        await deleteRoomType.mutateAsync(roomTypeId);
      } catch (error) {
        console.error('Failed to delete room type:', error);
        alert('Failed to delete room type. It may be in use by existing rooms.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="text-gray-600">Loading room types...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Room Types</h2>
          <p className="text-gray-600">Manage your hotel's room types and configurations</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <span className="mr-2">+</span> Add Room Type
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {roomTypes?.map((roomType) => (
          <Card key={roomType.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{roomType.name}</CardTitle>
                  {roomType.is_active ? (
                    <Badge variant="success" className="mt-1">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="mt-1">
                      Inactive
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {roomType.description && (
                <p className="text-sm text-gray-600">{roomType.description}</p>
              )}

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Base Price:</span>
                  <span className="font-semibold">${roomType.base_price.toFixed(2)}/night</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Max Capacity:</span>
                  <span>
                    {roomType.max_adults} Adults, {roomType.max_children} Children
                  </span>
                </div>
              </div>

              {roomType.amenities && Array.isArray(roomType.amenities) && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-600">
                    Amenities
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {(roomType.amenities as string[]).map((amenity, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex space-x-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenDialog(roomType)}
                  className="flex-1"
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(roomType.id)}
                  className="flex-1"
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {roomTypes?.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No room types found. Create one to get started!</p>
          </CardContent>
        </Card>
      )}

      {/* Room Type Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingRoomType ? 'Edit Room Type' : 'Create New Room Type'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Name <span className="text-red-600">*</span>
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., Deluxe Suite"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the room type..."
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Price <span className="text-red-600">*</span>
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.base_price}
                  onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                  required
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Adults <span className="text-red-600">*</span>
                </label>
                <Input
                  type="number"
                  value={formData.max_adults}
                  onChange={(e) => setFormData({ ...formData, max_adults: e.target.value })}
                  required
                  placeholder="2"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Children <span className="text-red-600">*</span>
                </label>
                <Input
                  type="number"
                  value={formData.max_children}
                  onChange={(e) => setFormData({ ...formData, max_children: e.target.value })}
                  required
                  placeholder="1"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Amenities (comma separated)
              </label>
              <Input
                type="text"
                value={formData.amenities}
                onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                placeholder="WiFi, TV, Mini-bar, Air Conditioning"
              />
              <p className="mt-1 text-xs text-gray-500">
                Separate multiple amenities with commas
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createRoomType.isPending || updateRoomType.isPending}
              >
                {editingRoomType ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

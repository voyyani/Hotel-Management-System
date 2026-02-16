import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GuestGrid } from '@/components/guests/GuestGrid';
import { GuestForm } from '@/components/guests/GuestForm';
import { GuestProfileModal } from '@/components/guests/GuestProfileModal';
import { useGuests, useDuplicateDetection } from '@/hooks/useGuests';
import type { Database } from '@/types/database';

type Guest = Database['public']['Tables']['guests']['Row'];
type GuestInsert = Database['public']['Tables']['guests']['Insert'];

export default function GuestsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [formData, setFormData] = useState<Partial<GuestInsert>>({});

  const { createGuest, updateGuest } = useGuests();
  const { data: duplicateWarning } = useDuplicateDetection(formData);

  const handleCreateClick = () => {
    setEditingGuest(null);
    setFormData({});
    setIsCreateModalOpen(true);
  };

  const handleEditClick = (guest: Guest) => {
    setEditingGuest(guest);
    setFormData(guest);
    setIsProfileModalOpen(false);
    setIsCreateModalOpen(true);
  };

  const handleViewGuest = (guest: Guest) => {
    setSelectedGuest(guest);
    setIsProfileModalOpen(true);
  };

  const handleFormSubmit = async (data: Omit<GuestInsert, 'created_by'>) => {
    try {
      if (editingGuest) {
        await updateGuest.mutateAsync({
          id: editingGuest.id,
          updates: data,
        });
      } else {
        await createGuest.mutateAsync(data);
      }
      setIsCreateModalOpen(false);
      setEditingGuest(null);
      setFormData({});
    } catch (error) {
      console.error('Error saving guest:', error);
      // Error handling is done by React Query
    }
  };

  const handleFormCancel = () => {
    setIsCreateModalOpen(false);
    setEditingGuest(null);
    setFormData({});
  };

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Guest Management</h1>
          <p className="text-gray-600">Manage guest profiles and information</p>
        </div>
        <Button onClick={handleCreateClick} size="lg">
          <svg
            className="mr-2 h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Guest
        </Button>
      </div>

      {/* Guest Grid */}
      <GuestGrid onGuestSelect={handleViewGuest} onEditGuest={handleEditClick} />

      {/* Create/Edit Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingGuest ? 'Edit Guest' : 'Create New Guest'}</DialogTitle>
          </DialogHeader>
          <GuestForm
            guest={editingGuest}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            isSubmitting={createGuest.isPending || updateGuest.isPending}
            duplicateWarning={!editingGuest ? duplicateWarning : undefined}
          />
        </DialogContent>
      </Dialog>

      {/* Profile Modal */}
      <GuestProfileModal
        guest={selectedGuest}
        isOpen={isProfileModalOpen}
        onClose={() => {
          setIsProfileModalOpen(false);
          setSelectedGuest(null);
        }}
        onEdit={handleEditClick}
      />
    </div>
  );
}

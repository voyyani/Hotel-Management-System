import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGuest } from '@/hooks/useGuests';
import { useGuestDocuments } from '@/hooks/useGuestDocuments';
import { format } from 'date-fns';
import type { Database } from '@/types/database';

type Guest = Database['public']['Tables']['guests']['Row'];

interface GuestProfileModalProps {
  guest: Guest | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (guest: Guest) => void;
}

export function GuestProfileModal({ guest, isOpen, onClose, onEdit }: GuestProfileModalProps) {
  const { data: guestDetails, isLoading } = useGuest(guest?.id);
  const { documents, downloadDocument, deleteDocument } = useGuestDocuments(guest?.id);

  if (!guest) return null;

  const preferences = guestDetails?.preferences as any;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">
                {guest.first_name} {guest.last_name}
              </DialogTitle>
              <p className="text-sm text-gray-500">{guest.email || guest.phone}</p>
            </div>
            <div className="flex gap-2">
              <Badge variant={guest.is_active ? 'default' : 'secondary'}>
                {guest.is_active ? 'Active' : 'Inactive'}
              </Badge>
              <Button size="sm" onClick={() => onEdit(guest)}>
                Edit
              </Button>
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading guest details...</p>
          </div>
        ) : (
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">Information</TabsTrigger>
              <TabsTrigger value="history">Stay History</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            {/* Information Tab */}
            <TabsContent value="info" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-gray-900">{guest.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p className="text-gray-900">{guest.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Nationality</p>
                    <p className="text-gray-900">{guest.nationality || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                    <p className="text-gray-900">
                      {guest.date_of_birth
                        ? format(new Date(guest.date_of_birth), 'MMM dd, yyyy')
                        : 'Not provided'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Identification</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-gray-500">ID Type</p>
                    <p className="text-gray-900">{guest.id_type || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">ID Number</p>
                    <p className="text-gray-900">{guest.id_number || 'Not provided'}</p>
                  </div>
                </CardContent>
              </Card>

              {preferences && Object.keys(preferences).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Preferences</CardTitle>
                    <CardDescription>Guest preferences and special needs</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {preferences.floor_preference && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">Floor: </span>
                        <Badge variant="outline">{preferences.floor_preference}</Badge>
                      </div>
                    )}
                    {preferences.bed_type && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">Bed Type: </span>
                        <Badge variant="outline">{preferences.bed_type}</Badge>
                      </div>
                    )}
                    {preferences.dietary_restrictions &&
                      preferences.dietary_restrictions.length > 0 && (
                        <div>
                          <span className="text-sm font-medium text-gray-500">
                            Dietary Restrictions:{' '}
                          </span>
                          {preferences.dietary_restrictions.map((item: string, i: number) => (
                            <Badge key={i} variant="outline" className="ml-1">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      )}
                    {preferences.notes && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Notes:</p>
                        <p className="text-sm text-gray-700">{preferences.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Stay History Tab */}
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Reservation History</CardTitle>
                  <CardDescription>
                    {guestDetails?.reservations?.length || 0} total stay(s)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!guestDetails?.reservations || guestDetails.reservations.length === 0 ? (
                    <div className="py-8 text-center text-gray-500">
                      <p>No reservation history</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {guestDetails.reservations.map((reservation: any) => (
                        <div
                          key={reservation.id}
                          className="flex items-center justify-between rounded-lg border p-4"
                        >
                          <div className="flex-1">
                            <p className="font-medium">
                              Room {reservation.rooms?.room_number} -{' '}
                              {reservation.rooms?.room_types?.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {format(new Date(reservation.check_in_date), 'MMM dd, yyyy')} →{' '}
                              {format(new Date(reservation.check_out_date), 'MMM dd, yyyy')}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge
                              variant={
                                reservation.status === 'checked_out'
                                  ? 'default'
                                  : reservation.status === 'checked_in'
                                  ? 'secondary'
                                  : 'outline'
                              }
                            >
                              {reservation.status}
                            </Badge>
                            <p className="mt-1 text-sm font-medium">
                              ${reservation.total_amount}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                  <CardDescription>ID scans and other guest documents</CardDescription>
                </CardHeader>
                <CardContent>
                  {documents.length === 0 ? (
                    <div className="py-8 text-center text-gray-500">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <p className="mt-2">No documents uploaded yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {documents.map(doc => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
                              <svg
                                className="h-5 w-5 text-indigo-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                            </div>
                            <div>
                              <p className="font-medium">{doc.document_name}</p>
                              <p className="text-xs text-gray-500">
                                {doc.document_type} •{' '}
                                {doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : ''} •{' '}
                                {format(new Date(doc.created_at), 'MMM dd, yyyy')}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => downloadDocument(doc)}
                            >
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
                                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                />
                              </svg>
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                if (confirm('Delete this document?')) {
                                  deleteDocument.mutate(doc.id);
                                }
                              }}
                            >
                              <svg
                                className="h-4 w-4 text-red-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

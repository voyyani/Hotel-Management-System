import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';

type GuestDocument = Database['public']['Tables']['guest_documents']['Row'];

const BUCKET_NAME = 'guest-documents';

export interface UploadDocumentParams {
  guestId: string;
  file: File;
  documentType: string;
}

/**
 * Custom hook for managing guest document uploads and downloads
 */
export function useGuestDocuments(guestId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch guest documents
  const { data: documents, isLoading, error } = useQuery({
    queryKey: ['guest-documents', guestId],
    queryFn: async () => {
      if (!guestId) return [];

      const { data, error } = await supabase
        .from('guest_documents')
        .select('*')
        .eq('guest_id', guestId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as GuestDocument[];
    },
    enabled: !!guestId,
  });

  // Upload document
  const uploadDocument = useMutation({
    mutationFn: async ({ guestId, file, documentType }: UploadDocumentParams) => {
      if (!user?.id) throw new Error('User must be authenticated');

      // Generate unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${guestId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Create document record in database
      const { data, error: dbError } = await supabase
        .from('guest_documents')
        .insert({
          guest_id: guestId,
          document_type: documentType,
          document_name: file.name,
          file_path: fileName,
          file_size: file.size,
          mime_type: file.type,
          uploaded_by: user.id,
        })
        .select()
        .single();

      if (dbError) {
        // Rollback: delete uploaded file if database insert fails
        await supabase.storage.from(BUCKET_NAME).remove([fileName]);
        throw dbError;
      }

      return data as GuestDocument;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['guest-documents', variables.guestId] });
      queryClient.invalidateQueries({ queryKey: ['guest', variables.guestId] });
    },
  });

  // Delete document
  const deleteDocument = useMutation({
    mutationFn: async (documentId: string) => {
      // First, get the document to find the file path
      const { data: document, error: fetchError } = await supabase
        .from('guest_documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (fetchError) throw fetchError;
      if (!document) throw new Error('Document not found');

      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([document.file_path]);

      if (storageError) throw storageError;

      // Delete document record from database
      const { error: dbError } = await supabase
        .from('guest_documents')
        .delete()
        .eq('id', documentId);

      if (dbError) throw dbError;

      return document as GuestDocument;
    },
    onSuccess: (document) => {
      queryClient.invalidateQueries({ queryKey: ['guest-documents', document.guest_id] });
      queryClient.invalidateQueries({ queryKey: ['guest', document.guest_id] });
    },
  });

  // Get signed URL for document download/preview
  const getDocumentUrl = async (filePath: string): Promise<string> => {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    if (error) throw error;
    return data.signedUrl;
  };

  // Download document
  const downloadDocument = async (doc: GuestDocument) => {
    try {
      const signedUrl = await getDocumentUrl(doc.file_path);

      // Fetch the file
      const response = await fetch(signedUrl);
      const blob = await response.blob();

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = doc.document_name;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      throw error;
    }
  };

  return {
    documents: documents || [],
    isLoading,
    error,
    uploadDocument,
    deleteDocument,
    getDocumentUrl,
    downloadDocument,
  };
}

-- Private PDFs attached to approved student document requests.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('document-requests', 'document-requests', FALSE, 10485760, ARRAY['application/pdf'])
ON CONFLICT (id) DO UPDATE SET
  public = FALSE,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "document_requests_pdf_read" ON storage.objects;
DROP POLICY IF EXISTS "document_requests_pdf_upload" ON storage.objects;
DROP POLICY IF EXISTS "document_requests_pdf_delete" ON storage.objects;

CREATE POLICY "document_requests_pdf_read" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'document-requests'
    AND (
      public.is_admin()
      OR EXISTS (
        SELECT 1 FROM public.requests AS request
        WHERE request.file_url = storage.objects.name
          AND request.student_id = auth.uid()
          AND request.status IN ('Approved', 'Ready')
      )
    )
  );

CREATE POLICY "document_requests_pdf_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'document-requests'
    AND public.is_admin()
    AND name ILIKE '%.pdf'
  );

CREATE POLICY "document_requests_pdf_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'document-requests' AND public.is_admin());

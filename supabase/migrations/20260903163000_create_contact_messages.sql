-- Create contact_messages table to store submissions from contact form
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unread',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow anyone (anonymous or authenticated) to insert contact messages
DROP POLICY IF EXISTS contact_messages_insert_all ON public.contact_messages;
CREATE POLICY contact_messages_insert_all
  ON public.contact_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow only administrators to read contact messages
DROP POLICY IF EXISTS contact_messages_select_admin ON public.contact_messages;
CREATE POLICY contact_messages_select_admin
  ON public.contact_messages
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Allow only administrators to update contact messages (e.g. mark as read)
DROP POLICY IF EXISTS contact_messages_update_admin ON public.contact_messages;
CREATE POLICY contact_messages_update_admin
  ON public.contact_messages
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Allow only administrators to delete contact messages
DROP POLICY IF EXISTS contact_messages_delete_admin ON public.contact_messages;
CREATE POLICY contact_messages_delete_admin
  ON public.contact_messages
  FOR DELETE
  TO authenticated
  USING (public.is_admin());


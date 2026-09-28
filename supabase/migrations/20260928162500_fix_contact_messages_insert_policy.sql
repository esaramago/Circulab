-- Replace unrestricted WITH CHECK (true) on contact_messages_insert_all with specific validation constraints
-- This resolves the Supabase Security Advisor warning while keeping the public contact form operational.

DROP POLICY IF EXISTS contact_messages_insert_all ON public.contact_messages;

CREATE POLICY contact_messages_insert_all
  ON public.contact_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    status = 'unread'
    AND length(trim(name)) >= 2
    AND length(trim(email)) >= 5
    AND length(trim(subject)) >= 3
    AND length(trim(message)) >= 10
  );

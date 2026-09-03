-- Grant select/insert/update/delete privileges on contact_messages to API roles (anon and authenticated)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_messages TO anon, authenticated;


-- Allow authenticated users to read role definitions (lookup table).
-- Required for PostgREST embeds such as users.select('*, roles(*)').

CREATE POLICY roles_select_authenticated
  ON public.roles
  FOR SELECT
  TO authenticated
  USING (true);

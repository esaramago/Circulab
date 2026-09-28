-- Allow administrators and moderators to insert pins without restricting created_by to auth.uid()
-- This is necessary when approving user suggestions, where created_by is preserved from the original author.
DROP POLICY IF EXISTS pins_insert_moderator_admin ON public.pins;

CREATE POLICY pins_insert_moderator_admin
  ON public.pins
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_moderator_or_admin());

-- Allow administrators and moderators to read all user profiles
-- This allows moderators to view submitter emails on suggestions and send notification emails.
DROP POLICY IF EXISTS users_select_moderator_admin ON public.users;

CREATE POLICY users_select_moderator_admin
  ON public.users
  FOR SELECT
  TO authenticated
  USING (public.is_moderator_or_admin());

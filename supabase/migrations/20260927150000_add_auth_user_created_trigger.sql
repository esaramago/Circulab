-- Ensure handle_new_user() handles conflicts gracefully
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  default_role_id bigint;
BEGIN
  SELECT id INTO default_role_id
  FROM public.roles
  WHERE code = 'contributor'
  LIMIT 1;

  IF default_role_id IS NULL THEN
    RAISE EXCEPTION 'public.roles has no row with code = contributor';
  END IF;

  INSERT INTO public.users (id, email, role_id)
  VALUES (NEW.id, NEW.email, default_role_id)
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$function$;

-- Create trigger on auth.users for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Backfill any existing auth.users missing from public.users
INSERT INTO public.users (id, email, role_id)
SELECT
  u.id,
  u.email,
  r.id
FROM auth.users u
CROSS JOIN (
  SELECT id FROM public.roles WHERE code = 'contributor' LIMIT 1
) r
WHERE NOT EXISTS (
  SELECT 1 FROM public.users pu WHERE pu.id = u.id
);

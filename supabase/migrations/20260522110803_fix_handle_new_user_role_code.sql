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
  VALUES (NEW.id, NEW.email, default_role_id);

  RETURN NEW;
END;
$function$;

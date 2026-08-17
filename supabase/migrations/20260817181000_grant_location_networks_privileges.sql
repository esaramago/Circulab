-- Grant select/insert/update/delete privileges on networks and location_networks to API roles (anon and authenticated)
GRANT SELECT ON public.networks TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.location_networks TO anon, authenticated;

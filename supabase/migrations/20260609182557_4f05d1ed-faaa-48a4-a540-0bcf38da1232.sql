
REVOKE ALL ON FUNCTION public.enforce_variant_limit() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.enforce_variant_limit() TO service_role;

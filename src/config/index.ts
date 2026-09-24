const rawBaseUrl =
  import.meta.env.PUBLIC_SUPABASE_URL ||
  (import.meta.env.PUBLIC_SUPABASE_PROJECT_ID
    ? `https://${import.meta.env.PUBLIC_SUPABASE_PROJECT_ID}.supabase.co`
    : 'https://oasounywcfkxzgmfnxta.supabase.co')
const baseUrl = rawBaseUrl.replace(/\/+$/, '')

export const CONFIG = {
  images_url: `${baseUrl}/storage/v1/object/public/`,
  can_suggest: import.meta.env.PUBLIC_CAN_SUGGEST === 'true'
}
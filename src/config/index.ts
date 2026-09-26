const rawBaseUrl =
  import.meta.env.PUBLIC_SUPABASE_URL ||
  (typeof process !== 'undefined'
    ? process.env.PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    : undefined) ||
  (import.meta.env.PUBLIC_SUPABASE_PROJECT_ID ||
  (typeof process !== 'undefined'
    ? process.env.PUBLIC_SUPABASE_PROJECT_ID || process.env.SUPABASE_PROJECT_ID
    : undefined)
    ? `https://${import.meta.env.PUBLIC_SUPABASE_PROJECT_ID || (typeof process !== 'undefined' ? process.env.PUBLIC_SUPABASE_PROJECT_ID || process.env.SUPABASE_PROJECT_ID : '')}.supabase.co`
    : 'https://oasounywcfkxzgmfnxta.supabase.co')
const baseUrl = (rawBaseUrl || '').replace(/\/+$/, '')

export const CONFIG = {
  images_url: `${baseUrl}/storage/v1/object/public/`,
  can_suggest:
    import.meta.env.PUBLIC_CAN_SUGGEST === 'true' ||
    import.meta.env.CAN_SUGGEST === 'true' ||
    (typeof process !== 'undefined' &&
      (process.env.PUBLIC_CAN_SUGGEST === 'true' || process.env.CAN_SUGGEST === 'true')),
}
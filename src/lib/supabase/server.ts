// Re-exported from @michalsy/aiko-webapp-core/server (server-only)
import { createServerSupabaseClient } from '@michalsy/aiko-webapp-core/server'

export async function createClient() {
  return createServerSupabaseClient()
}

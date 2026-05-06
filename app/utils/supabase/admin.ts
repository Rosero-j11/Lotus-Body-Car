import { createClient } from '@supabase/supabase-js';

// Cliente con service_role key — bypasea RLS.
// SOLO usar en Route Handlers del servidor, nunca exponer al cliente.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Faltan variables de entorno para el cliente admin de Supabase');
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

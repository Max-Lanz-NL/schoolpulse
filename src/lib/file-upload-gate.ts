import type { SupabaseClient } from "@supabase/supabase-js";

export const FILE_UPLOADS_DISABLED_MESSAGE = "Bestandsuploads zijn momenteel niet beschikbaar.";

/**
 * Reads the server-authoritative upload gate. Errors are deliberately treated
 * as disabled so a configuration or connectivity problem cannot enable uploads.
 */
export async function areFileUploadsEnabled(supabase: SupabaseClient): Promise<boolean> {
  const { data, error } = await supabase.rpc("file_uploads_enabled");
  return !error && data === true;
}

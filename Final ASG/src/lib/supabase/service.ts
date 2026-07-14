import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase URL and Service Role Key are required in environment variables');
}

// Service role client bypasses RLS policies. To be used ONLY on the server side (Route Handlers, Server Actions)
export const supabaseService = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false, // Serverless context doesn't need to persist sessions
  },
});

export async function deleteStorageFile(url: string | null | undefined, bucket: string) {
  if (!url) return;
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || !url.startsWith(supabaseUrl)) {
    return;
  }

  const prefix = `/storage/v1/object/public/${bucket}/`;
  const prefixIndex = url.indexOf(prefix);
  if (prefixIndex === -1) {
    return;
  }

  const filePath = url.substring(prefixIndex + prefix.length);
  if (!filePath) return;

  try {
    const { error } = await supabaseService.storage
      .from(bucket)
      .remove([filePath]);
    if (error) {
      console.error(`Failed to delete storage file ${filePath} from bucket ${bucket}:`, error);
    }
  } catch (err) {
    console.error(`Error deleting storage file ${filePath} from bucket ${bucket}:`, err);
  }
}

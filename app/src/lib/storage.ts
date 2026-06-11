import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const bucket = process.env.SUPABASE_STORAGE_BUCKET || "btechleet";

// Server-only client with service role (full access)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

// ─── Upload file to Supabase Storage ───────────────────────────────────
export async function uploadToStorage(
  buffer: Buffer,
  path: string,
  contentType: string
): Promise<{ url: string; path: string }> {
  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, buffer, { contentType, upsert: true });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

// ─── Delete file from Supabase Storage ─────────────────────────────────
export async function deleteFromStorage(path: string): Promise<void> {
  const { error } = await supabaseAdmin.storage.from(bucket).remove([path]);
  if (error) throw new Error(`Storage delete failed: ${error.message}`);
}

// ─── Generate a unique storage path ────────────────────────────────────
export function generateStoragePath(folder: string, filename: string): string {
  const ext = filename.split(".").pop() || "bin";
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${folder}/${unique}.${ext}`;
}

// ─── Validate file type & size ─────────────────────────────────────────
const MAX_SIZES: Record<string, number> = {
  document: 20 * 1024 * 1024, // 20 MB
  image: 5 * 1024 * 1024,     // 5 MB
};

const ALLOWED_TYPES: Record<string, string[]> = {
  document: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  image: ["image/jpeg", "image/png", "image/webp", "image/gif"],
};

export function validateFile(
  file: { size: number; type: string },
  kind: "document" | "image" = "document"
): { valid: boolean; error?: string } {
  if (file.size > MAX_SIZES[kind]) {
    return { valid: false, error: `File too large. Max ${MAX_SIZES[kind] / 1024 / 1024}MB allowed.` };
  }
  if (!ALLOWED_TYPES[kind].includes(file.type)) {
    return { valid: false, error: `Invalid file type. Allowed: ${ALLOWED_TYPES[kind].join(", ")}` };
  }
  return { valid: true };
}

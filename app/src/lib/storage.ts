import { createClient, SupabaseClient } from "@supabase/supabase-js";
const bucket = process.env.SUPABASE_STORAGE_BUCKET || "btechleet";

// Lazy-initialized server-only client with service role (full access)
let _supabaseAdmin: SupabaseClient | null = null;
function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "",
      { auth: { persistSession: false } }
    );
  }
  return _supabaseAdmin;
}


// ─── Upload file to Supabase Storage ───────────────────────────────────
export async function uploadToStorage(
  buffer: Buffer,
  path: string,
  contentType: string
): Promise<{ url: string; path: string }> {
  const client = getSupabaseAdmin();
  const { error } = await client.storage
    .from(bucket)
    .upload(path, buffer, { contentType, upsert: true });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data } = client.storage.from(bucket).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

// ─── Delete file from Supabase Storage ─────────────────────────────────
export async function deleteFromStorage(path: string): Promise<void> {
  const { error } = await getSupabaseAdmin().storage.from(bucket).remove([path]);
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
  document: 20 * 1024 * 1024, // 20 MB (will compress to 5MB)
  image: 10 * 1024 * 1024,    // 10 MB (will compress to 2MB)
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
    return { valid: false, error: `File too large. Max ${MAX_SIZES[kind] / 1024 / 1024}MB allowed before compression.` };
  }
  if (!ALLOWED_TYPES[kind].includes(file.type)) {
    return { valid: false, error: `Invalid file type. Allowed: ${ALLOWED_TYPES[kind].join(", ")}` };
  }
  return { valid: true };
}

// ─── Process and Compress File ─────────────────────────────────────────
const TARGET_IMAGE_SIZE = 2 * 1024 * 1024; // 2 MB
const TARGET_PDF_SIZE = 5 * 1024 * 1024;   // 5 MB

export async function processAndCompressFile(
  buffer: Buffer,
  contentType: string
): Promise<Buffer> {
  // Image Compression
  if (contentType.startsWith("image/")) {
    if (buffer.length <= TARGET_IMAGE_SIZE) {
      return buffer;
    }
    
    // Convert to webp and aggressively compress to hit < 2MB
    let quality = 80;
    const sharp = (await import("sharp")).default;
    let compressed = await sharp(buffer)
      .resize(1920, 1920, { fit: "inside", withoutEnlargement: true })
      .webp({ quality })
      .toBuffer();
    
    while (compressed.length > TARGET_IMAGE_SIZE && quality > 10) {
      quality -= 10;
      compressed = await sharp(buffer)
        .resize(1920, 1920, { fit: "inside", withoutEnlargement: true })
        .webp({ quality })
        .toBuffer();
    }
    
    if (compressed.length > TARGET_IMAGE_SIZE) {
      throw new Error("Unable to compress image below 2MB. Please upload a smaller image.");
    }
    return compressed;
  }

  // PDF Compression
  if (contentType === "application/pdf") {
    if (buffer.length <= TARGET_PDF_SIZE) {
      return buffer;
    }
    
    try {
      const { PDFDocument } = await import("pdf-lib");
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      // Saving with useObjectStreams attempts to compress the internal PDF structure
      const uint8Array = await pdfDoc.save({ useObjectStreams: true });
      const compressedBuffer = Buffer.from(uint8Array);
      
      if (compressedBuffer.length > TARGET_PDF_SIZE) {
         throw new Error(`Unable to compress PDF below 5MB (currently ${(compressedBuffer.length / 1024 / 1024).toFixed(2)}MB). Please manually compress before uploading.`);
      }
      return compressedBuffer;
    } catch (err: any) {
      if (err.message.includes("Unable to compress PDF")) throw err;
      console.warn("Failed to compress PDF, checking original size...", err.message);
      if (buffer.length > TARGET_PDF_SIZE) {
        throw new Error(`PDF exceeds 5MB limit (${(buffer.length / 1024 / 1024).toFixed(2)}MB) and could not be compressed.`);
      }
      return buffer;
    }
  }

  // Other documents (Docx, etc.) cannot be compressed easily here.
  // We will enforce the 5MB limit for them as well.
  if (buffer.length > TARGET_PDF_SIZE) {
    throw new Error(`File exceeds 5MB limit (${(buffer.length / 1024 / 1024).toFixed(2)}MB). Please compress manually.`);
  }

  return buffer;
}

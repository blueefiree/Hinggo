import { supabaseAdmin, supabase } from "./supabase";

/**
 * Upload file to Supabase Storage.
 * - bucket: 'hinggo-public' for public images (products, test photos, transfer proofs)
 * - bucket: 'hinggo-private' for sensitive docs (KTP, proof of ownership)
 */
export async function uploadFile(
  bucket: "hinggo-public" | "hinggo-private",
  path: string,
  file: Buffer | Blob | Uint8Array,
  contentType: string
): Promise<{ url: string | null; error: string | null }> {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(path, file, {
        contentType,
        upsert: true,
      });

    if (error) {
      return { url: null, error: error.message };
    }

    if (bucket === "hinggo-public") {
      const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(path);
      return { url: publicData.publicUrl, error: null };
    }

    // For private bucket, return the storage path to generate signed URLs later
    return { url: path, error: null };
  } catch (err: any) {
    return { url: null, error: err.message || "Gagal mengunggah file" };
  }
}

/**
 * Generate a short-lived Signed URL for private documents (KTP & Proof of Ownership)
 * Valid for 60 minutes.
 */
export async function getPrivateSignedUrl(
  path: string,
  expiresInSeconds = 3600
): Promise<string | null> {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from("hinggo-private")
      .createSignedUrl(path, expiresInSeconds);

    if (error || !data) return null;
    return data.signedUrl;
  } catch (err) {
    return null;
  }
}

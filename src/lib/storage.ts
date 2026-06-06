import { supabase } from "@/integrations/supabase/client";

/**
 * Resolves a storage path or legacy public URL to a signed URL if needed.
 */
export async function resolveStoragePath(bucket: string, pathOrUrl: string | null | undefined): Promise<string | null> {
  if (!pathOrUrl) return null;

  // Handle legacy full public URLs
  if (pathOrUrl.startsWith('http')) {
    const isOurStorage = pathOrUrl.includes(".supabase.co/storage/v1/object/public/");
    if (isOurStorage) {
      const parts = pathOrUrl.split("/storage/v1/object/public/");
      if (parts.length > 1) {
        const bucketAndPath = parts[1];
        const pathStart = bucketAndPath.indexOf("/") + 1;
        const extractedPath = bucketAndPath.substring(pathStart);
        
        const { data, error } = await supabase.storage.from(bucket).createSignedUrl(extractedPath, 3600);
        if (error) {
          console.error(`Error resolving legacy URL for ${bucket}/${extractedPath}:`, error);
          return pathOrUrl; // Fallback to original
        }
        return data.signedUrl;
      }
    }
    return pathOrUrl;
  }

  // Handle paths
  try {
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(pathOrUrl, 3600);
    if (error) {
      console.error(`Error resolving path for ${bucket}/${pathOrUrl}:`, error);
      // Fallback to public URL in case bucket is still public or error is transient
      const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(pathOrUrl);
      return publicData.publicUrl;
    }
    return data.signedUrl;
  } catch (e) {
    console.error(e);
    return null;
  }
}

/**
 * Gets a public URL for a bucket (only use for public buckets like avatars).
 */
export function getPublicUrl(bucket: string, path: string | null | undefined) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

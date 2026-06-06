import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to resolve a storage path/URL to a usable URL (signed if private).
 */
export function useStorageUrl(bucket: string, pathOrUrl: string | null | undefined) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!pathOrUrl) {
      setUrl(null);
      return;
    }

    // If it's already a full public URL, we might still want to check if it's from our storage
    // to handle the transition to private buckets.
    const isOurStorage = pathOrUrl.includes(".supabase.co/storage/v1/object/public/");
    
    if (isOurStorage) {
      // Extract path from public URL: https://.../storage/v1/object/public/bucket/path
      const parts = pathOrUrl.split("/storage/v1/object/public/");
      if (parts.length > 1) {
        const bucketAndPath = parts[1];
        const pathStart = bucketAndPath.indexOf("/") + 1;
        const extractedPath = bucketAndPath.substring(pathStart);
        
        // Use the extracted path to get a signed URL
        resolvePath(extractedPath);
        return;
      }
    }

    if (pathOrUrl.startsWith("http")) {
      setUrl(pathOrUrl);
      return;
    }

    resolvePath(pathOrUrl);
  }, [bucket, pathOrUrl]);

  async function resolvePath(path: string) {
    setLoading(true);
    try {
      const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 3600);
      if (error) {
        console.error(`Error resolving storage URL for ${bucket}/${path}:`, error);
        // Fallback to public URL in case bucket is still public or error is transient
        const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(path);
        setUrl(publicData.publicUrl);
      } else {
        setUrl(data.signedUrl);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return { url, loading };
}

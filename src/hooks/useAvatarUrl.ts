import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useAvatarUrl = () => {
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAvatar = async () => {
    if (!user) {
      setAvatarUrl(null);
      setLoading(false);
      return;
    }

    try {
      const { data } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", user.id)
        .single();

      setAvatarUrl(data?.avatar_url ?? null);
    } catch {
      setAvatarUrl(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvatar();
  }, [user?.id]);

  const uploadAvatar = async (file: File): Promise<string> => {
    if (!user) throw new Error("No user");

    // Validate size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      throw new Error("La imagen no debe superar 2MB");
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const filePath = `${user.id}/avatar.${ext}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    // Save to profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", user.id);

    if (updateError) throw updateError;

    setAvatarUrl(publicUrl);
    return publicUrl;
  };

  return { avatarUrl, loading, uploadAvatar, refetch: fetchAvatar };
};

import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAvatarUrl } from "@/hooks/useAvatarUrl";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Camera, Loader2 } from "lucide-react";

export const AvatarUpload = () => {
  const { user } = useAuth();
  const { avatarUrl, uploadAvatar } = useAvatarUrl();
  const { toast } = useToast();
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const userName = user?.user_metadata?.full_name || "Usuario";
  const initials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Archivo demasiado grande",
        description: "La imagen no debe superar 2MB.",
        variant: "destructive",
      });
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      await uploadAvatar(file);
      setPreview(null);
      toast({
        title: "Avatar actualizado",
        description: "Tu foto de perfil se actualizó correctamente.",
      });
    } catch (err: any) {
      toast({
        title: "Error al subir avatar",
        description: err.message || "Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const displayUrl = preview || avatarUrl;

  return (
    <div className="flex items-center gap-4">
      <div className="relative group">
        <Avatar className="w-20 h-20">
          {displayUrl ? (
            <AvatarImage src={displayUrl} alt="Avatar" />
          ) : null}
          <AvatarFallback className="bg-soft-blue text-soft-blue-foreground font-semibold text-xl">
            {initials}
          </AvatarFallback>
        </Avatar>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          ) : (
            <Camera className="w-5 h-5 text-white" />
          )}
        </button>
      </div>
      <div>
        <p className="font-medium">{userName}</p>
        <p className="text-sm text-muted-foreground">{user?.email}</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? "Subiendo..." : "Cambiar avatar"}
        </Button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

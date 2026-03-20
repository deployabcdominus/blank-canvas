import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, Upload, X, Loader2, AlertTriangle, Clock, Camera } from "lucide-react";

interface TokenData {
  order_id: string;
  company_id: string;
  client: string;
  project_name: string;
  wo_number: string;
  token_valid: boolean;
  token_expired: boolean;
}

interface PhotoItem {
  id: string;
  file: File;
  preview: string;
  status: "uploading" | "saved" | "error";
  publicUrl?: string;
}

const POIPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [loading, setLoading] = useState(true);
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [accessError, setAccessError] = useState<"expired" | "invalid" | null>(null);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [installerName, setInstallerName] = useState("");
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    validateToken();
  }, []);

  const validateToken = async () => {
    if (!token) {
      setAccessError("invalid");
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase.rpc("validate_poi_token", { p_token: token });
      if (error || !data || data.length === 0) {
        setAccessError("invalid");
      } else {
        const row = data[0];
        if (!row.token_valid && row.token_expired) {
          setAccessError("expired");
        } else if (!row.token_valid) {
          setAccessError("invalid");
        } else {
          setTokenData(row as TokenData);
        }
      }
    } catch {
      setAccessError("invalid");
    }
    setLoading(false);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !tokenData) return;

    for (const file of Array.from(files)) {
      const id = crypto.randomUUID();
      const preview = URL.createObjectURL(file);
      const item: PhotoItem = { id, file, preview, status: "uploading" };
      setPhotos(prev => [...prev, item]);

      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${tokenData.company_id}/${tokenData.order_id}/${timestamp}-${safeName}`;

      try {
        const { error: uploadErr } = await supabase.storage
          .from("poi-photos")
          .upload(path, file, { contentType: file.type });

        if (uploadErr) throw uploadErr;

        const { data: urlData } = supabase.storage.from("poi-photos").getPublicUrl(path);
        const publicUrl = urlData.publicUrl;

        await supabase.from("poi_photos").insert({
          company_id: tokenData.company_id,
          production_order_id: tokenData.order_id,
          uploaded_by_name: installerName.trim() || "Field Installer",
          storage_path: path,
          public_url: publicUrl,
          mime_type: file.type,
          file_size_bytes: file.size,
        });

        setPhotos(prev => prev.map(p => p.id === id ? { ...p, status: "saved", publicUrl } : p));
      } catch {
        setPhotos(prev => prev.map(p => p.id === id ? { ...p, status: "error" } : p));
      }
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const removePhoto = (id: string) => {
    setPhotos(prev => {
      const photo = prev.find(p => p.id === id);
      if (photo) URL.revokeObjectURL(photo.preview);
      return prev.filter(p => p.id !== id);
    });
  };

  const handleComplete = async () => {
    if (!tokenData || completing) return;
    setCompleting(true);
    try {
      await supabase
        .from("production_orders")
        .update({
          poi_token_used: true,
          poi_completed_at: new Date().toISOString(),
          status: "Instalado",
        })
        .eq("id", tokenData.order_id);
      setCompleted(true);
    } catch {
      // silent
    }
    setCompleting(false);
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0f0f1a" }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#8b5cf6" }} />
      </div>
    );
  }

  // ── Error states ──
  if (accessError === "expired") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center" style={{ background: "#0f0f1a", color: "#fff" }}>
        <Clock className="w-16 h-16 mb-4" style={{ color: "#f59e0b" }} />
        <h1 className="text-xl font-bold mb-2">Link Expired</h1>
        <p style={{ color: "#9ca3af" }}>This link has expired. Contact your supervisor for a new one.</p>
      </div>
    );
  }

  if (accessError === "invalid") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center" style={{ background: "#0f0f1a", color: "#fff" }}>
        <AlertTriangle className="w-16 h-16 mb-4" style={{ color: "#ef4444" }} />
        <h1 className="text-xl font-bold mb-2">Invalid Access Link</h1>
        <p style={{ color: "#9ca3af" }}>This link is not valid. Please check with your office.</p>
      </div>
    );
  }

  // ── Completed ──
  if (completed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center" style={{ background: "#0f0f1a", color: "#fff" }}>
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: "rgba(16,185,129,0.15)" }}>
          <CheckCircle className="w-12 h-12" style={{ color: "#10b981" }} />
        </div>
        <h1 className="text-xl font-bold mb-2">Installation Documented Successfully</h1>
        <p style={{ color: "#9ca3af" }}>The office has been notified.</p>
      </div>
    );
  }

  const savedCount = photos.filter(p => p.status === "saved").length;

  // ── Main UI ──
  return (
    <div className="min-h-screen p-4 pb-24" style={{ background: "#0f0f1a", color: "#fff", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div className="text-center mb-6">
        <p className="text-xs font-bold tracking-widest mb-3" style={{ color: "#8b5cf6" }}>SIGN FLOW</p>
        <span
          className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3"
          style={{ background: "rgba(139,92,246,0.2)", color: "#8b5cf6", border: "1px solid rgba(139,92,246,0.4)" }}
        >
          {tokenData?.wo_number || "WO"}
        </span>
        <h1 className="text-lg font-bold">{tokenData?.client}</h1>
        <p className="text-sm" style={{ color: "#9ca3af" }}>{tokenData?.project_name}</p>
      </div>

      {/* Upload Section */}
      <div
        className="rounded-2xl p-5 mb-4"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(139,92,246,0.3)" }}
      >
        <h2 className="text-base font-bold mb-1">Installation Photos</h2>
        <p className="text-xs mb-4" style={{ color: "#9ca3af" }}>
          Upload at least 3 photos of the completed installation
        </p>

        {/* Upload button */}
        <label
          className="flex items-center justify-center gap-2 w-full py-4 rounded-xl cursor-pointer text-sm font-semibold transition-all active:scale-95"
          style={{ background: "rgba(139,92,246,0.15)", border: "2px dashed rgba(139,92,246,0.5)", color: "#8b5cf6" }}
        >
          <Camera className="w-5 h-5" />
          Take Photo / Upload
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
        </label>

        {/* Photo grid */}
        {photos.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mt-4">
            {photos.map(photo => (
              <div key={photo.id} className="relative rounded-xl overflow-hidden" style={{ aspectRatio: "1" }}>
                <img src={photo.preview} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => removePhoto(photo.id)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(0,0,0,0.6)" }}
                >
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
                <span
                  className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                  style={{
                    background: photo.status === "saved" ? "rgba(16,185,129,0.8)" :
                      photo.status === "uploading" ? "rgba(139,92,246,0.8)" : "rgba(239,68,68,0.8)",
                    color: "#fff",
                  }}
                >
                  {photo.status === "saved" ? "Saved" : photo.status === "uploading" ? "Uploading..." : "Error"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Installer Name */}
      <div
        className="rounded-2xl p-5 mb-4"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(139,92,246,0.3)" }}
      >
        <label className="text-xs font-semibold block mb-2" style={{ color: "#9ca3af" }}>
          Installer name (optional)
        </label>
        <input
          type="text"
          value={installerName}
          onChange={e => setInstallerName(e.target.value)}
          placeholder="Your name"
          className="w-full rounded-xl px-4 py-3 text-sm outline-none"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#fff",
          }}
        />
      </div>

      {/* Complete button */}
      {savedCount > 0 && (
        <button
          onClick={handleComplete}
          disabled={completing}
          className="w-full py-4 rounded-xl text-sm font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
          style={{ background: "#10b981", color: "#fff", opacity: completing ? 0.7 : 1 }}
        >
          {completing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          Mark as Complete
        </button>
      )}
    </div>
  );
};

export default POIPage;

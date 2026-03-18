import { useRef, useCallback, useState, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Eraser, PenTool, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface QCSignaturePadProps {
  orderId: string;
  companyId: string | null;
  allQcPassed: boolean;
  existingSignatureUrl: string | null;
  inspectorName: string;
  onSignatureSaved: (url: string) => void;
}

export function QCSignaturePad({
  orderId,
  companyId,
  allQcPassed,
  existingSignatureUrl,
  inspectorName,
  onSignatureSaved,
}: QCSignaturePadProps) {
  const sigRef = useRef<SignatureCanvas>(null);
  const [saving, setSaving] = useState(false);
  const [hasSig, setHasSig] = useState(false);

  useEffect(() => {
    setHasSig(!!existingSignatureUrl);
  }, [existingSignatureUrl]);

  const handleClear = useCallback(() => {
    sigRef.current?.clear();
    setHasSig(false);
  }, []);

  const handleSave = useCallback(async () => {
    if (!sigRef.current || sigRef.current.isEmpty()) return;
    setSaving(true);
    try {
      const dataUrl = sigRef.current.getTrimmedCanvas().toDataURL("image/png");
      const blob = await (await fetch(dataUrl)).blob();
      const path = `${companyId || "unknown"}/${orderId}/qc-signature.png`;

      const { error: uploadErr } = await supabase.storage
        .from("signatures")
        .upload(path, blob, { upsert: true, contentType: "image/png" });
      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage.from("signatures").getPublicUrl(path);
      const url = urlData.publicUrl + "?t=" + Date.now();

      // Persist to DB
      await supabase
        .from("production_orders")
        .update({
          qc_signature_url: url,
          qc_checklist: {
            design_verified: true,
            material_specs_confirmed: true,
            wiring_test_passed: true,
            final_sign_cleaned: true,
            qc_signature: inspectorName,
            qc_date: new Date().toISOString().split("T")[0],
          },
        } as any)
        .eq("id", orderId);

      onSignatureSaved(url);
      setHasSig(true);
    } catch (e: any) {
      console.error("Signature save error:", e);
    } finally {
      setSaving(false);
    }
  }, [orderId, companyId, inspectorName, onSignatureSaved]);

  if (!allQcPassed) {
    return (
      <div
        style={{
          marginTop: 8,
          padding: "10px 12px",
          border: "1px dashed #d97706",
          borderRadius: 6,
          background: "#fffbeb",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <AlertCircle size={16} style={{ color: "#d97706", flexShrink: 0 }} />
        <span style={{ fontSize: 10, color: "#92400e", fontWeight: 500 }}>
          Completa todos los puntos de control antes de firmar.
        </span>
      </div>
    );
  }

  if (existingSignatureUrl && hasSig) {
    return (
      <div style={{ marginTop: 8 }}>
        <div style={{ fontSize: 9, fontWeight: 600, color: "#555", marginBottom: 4 }}>
          QC Inspector Signature
        </div>
        <div
          style={{
            border: "1px solid #d4d4d8",
            borderRadius: 6,
            padding: 6,
            background: "#fff",
            position: "relative",
          }}
        >
          <img
            src={existingSignatureUrl}
            alt="QC Signature"
            style={{ maxHeight: 60, objectFit: "contain" }}
            crossOrigin="anonymous"
          />
          <Button
            data-print-hide
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute top-1 right-1 h-5 px-1.5 text-[8px] text-zinc-500 hover:text-red-500"
          >
            <Eraser size={10} className="mr-0.5" /> Re-sign
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 8 }} data-print-hide>
      <div style={{ fontSize: 9, fontWeight: 600, color: "#555", marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
        <PenTool size={10} /> QC Inspector Signature
      </div>
      <div
        style={{
          border: "1px solid #d4d4d8",
          borderRadius: 6,
          overflow: "hidden",
          background: "#fff",
          position: "relative",
        }}
      >
        <SignatureCanvas
          ref={sigRef}
          canvasProps={{
            width: 320,
            height: 80,
            style: { width: "100%", height: 80, cursor: "crosshair" },
          }}
          penColor="#1a1a2e"
          minWidth={1}
          maxWidth={2.5}
        />
        {/* Signature line */}
        <div
          style={{
            position: "absolute",
            bottom: 16,
            left: 16,
            right: 16,
            borderBottom: "1px solid #e5e5e5",
          }}
        />
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
        <Button
          variant="outline"
          size="sm"
          onClick={handleClear}
          className="h-6 text-[9px] px-2 border-zinc-300 text-zinc-600"
        >
          <Eraser size={10} className="mr-1" /> Clear
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={saving}
          className="h-6 text-[9px] px-3"
          style={{ background: "#16a34a", color: "white" }}
        >
          {saving ? <Loader2 size={10} className="mr-1 animate-spin" /> : <PenTool size={10} className="mr-1" />}
          Sign & Confirm
        </Button>
      </div>
    </div>
  );
}

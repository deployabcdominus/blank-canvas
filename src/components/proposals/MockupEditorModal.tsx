import { useState, useRef, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  ImagePlus,
  Layers,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Trash2,
  Download,
  Save,
  Loader2,
  Move,
  Upload,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/hooks/useCompany";
import { toast } from "sonner";

interface MockupEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposalId: string;
  clientName: string;
  onSaved: (mockupUrl: string) => void;
}

interface OverlayState {
  img: HTMLImageElement;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

type DragMode = "none" | "move" | "resize-br" | "resize-bl" | "resize-tr" | "resize-tl";

export const MockupEditorModal = ({
  isOpen,
  onClose,
  proposalId,
  clientName,
  onSaved,
}: MockupEditorModalProps) => {
  const { company } = useCompany();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
  const [overlay, setOverlay] = useState<OverlayState | null>(null);
  const [saving, setSaving] = useState(false);

  // Drag state
  const dragRef = useRef<{
    mode: DragMode;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    origW: number;
    origH: number;
  } | null>(null);

  const CANVAS_W = 800;
  const CANVAS_H = 600;

  // ── Draw everything ──
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    // Background
    if (bgImage) {
      const scale = Math.min(CANVAS_W / bgImage.width, CANVAS_H / bgImage.height);
      const w = bgImage.width * scale;
      const h = bgImage.height * scale;
      ctx.drawImage(bgImage, (CANVAS_W - w) / 2, (CANVAS_H - h) / 2, w, h);
    } else {
      // Empty state
      ctx.fillStyle = "hsl(0 0% 8%)";
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.fillStyle = "hsl(0 0% 25%)";
      ctx.font = "14px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Sube una imagen de fondo para comenzar", CANVAS_W / 2, CANVAS_H / 2);
    }

    // Overlay
    if (overlay) {
      ctx.save();
      ctx.translate(overlay.x + overlay.width / 2, overlay.y + overlay.height / 2);
      ctx.rotate((overlay.rotation * Math.PI) / 180);
      ctx.drawImage(
        overlay.img,
        -overlay.width / 2,
        -overlay.height / 2,
        overlay.width,
        overlay.height
      );
      ctx.restore();

      // Selection border
      ctx.save();
      ctx.strokeStyle = "hsl(25 95% 53%)";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(overlay.x, overlay.y, overlay.width, overlay.height);
      ctx.setLineDash([]);

      // Resize handles
      const handles = [
        { x: overlay.x, y: overlay.y },
        { x: overlay.x + overlay.width, y: overlay.y },
        { x: overlay.x, y: overlay.y + overlay.height },
        { x: overlay.x + overlay.width, y: overlay.y + overlay.height },
      ];
      handles.forEach((h) => {
        ctx.fillStyle = "hsl(25 95% 53%)";
        ctx.fillRect(h.x - 5, h.y - 5, 10, 10);
      });
      ctx.restore();
    }
  }, [bgImage, overlay]);

  useEffect(() => {
    draw();
  }, [draw]);

  // ── File uploads ──
  const loadImage = (file: File): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = reader.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = await loadImage(file);
    setBgImage(img);
    e.target.value = "";
  };

  const handleOverlayUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = await loadImage(file);
    const maxDim = 200;
    const scale = Math.min(maxDim / img.width, maxDim / img.height, 1);
    setOverlay({
      img,
      x: CANVAS_W / 2 - (img.width * scale) / 2,
      y: CANVAS_H / 2 - (img.height * scale) / 2,
      width: img.width * scale,
      height: img.height * scale,
      rotation: 0,
    });
    e.target.value = "";
  };

  // ── Canvas interaction ──
  const getCanvasPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const hitTest = (px: number, py: number): DragMode => {
    if (!overlay) return "none";
    const { x, y, width, height } = overlay;
    const hs = 12; // handle size

    // Corner handles
    if (Math.abs(px - (x + width)) < hs && Math.abs(py - (y + height)) < hs) return "resize-br";
    if (Math.abs(px - x) < hs && Math.abs(py - (y + height)) < hs) return "resize-bl";
    if (Math.abs(px - (x + width)) < hs && Math.abs(py - y) < hs) return "resize-tr";
    if (Math.abs(px - x) < hs && Math.abs(py - y) < hs) return "resize-tl";

    // Inside overlay
    if (px >= x && px <= x + width && py >= y && py <= y + height) return "move";

    return "none";
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (!overlay) return;
    e.preventDefault();
    const pos = getCanvasPos(e);
    const mode = hitTest(pos.x, pos.y);
    if (mode === "none") return;

    dragRef.current = {
      mode,
      startX: pos.x,
      startY: pos.y,
      origX: overlay.x,
      origY: overlay.y,
      origW: overlay.width,
      origH: overlay.height,
    };
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragRef.current || !overlay) return;
    e.preventDefault();
    const pos = getCanvasPos(e);
    const { mode, startX, startY, origX, origY, origW, origH } = dragRef.current;
    const dx = pos.x - startX;
    const dy = pos.y - startY;

    if (mode === "move") {
      setOverlay((prev) => prev ? { ...prev, x: origX + dx, y: origY + dy } : null);
    } else if (mode === "resize-br") {
      setOverlay((prev) =>
        prev
          ? { ...prev, width: Math.max(30, origW + dx), height: Math.max(30, origH + dy) }
          : null
      );
    } else if (mode === "resize-bl") {
      const newW = Math.max(30, origW - dx);
      setOverlay((prev) =>
        prev
          ? { ...prev, x: origX + origW - newW, width: newW, height: Math.max(30, origH + dy) }
          : null
      );
    } else if (mode === "resize-tr") {
      const newH = Math.max(30, origH - dy);
      setOverlay((prev) =>
        prev
          ? { ...prev, y: origY + origH - newH, width: Math.max(30, origW + dx), height: newH }
          : null
      );
    } else if (mode === "resize-tl") {
      const newW = Math.max(30, origW - dx);
      const newH = Math.max(30, origH - dy);
      setOverlay((prev) =>
        prev
          ? { ...prev, x: origX + origW - newW, y: origY + origH - newH, width: newW, height: newH }
          : null
      );
    }
  };

  const handlePointerUp = () => {
    dragRef.current = null;
  };

  // ── Controls ──
  const rotateOverlay = (deg: number) => {
    setOverlay((prev) => (prev ? { ...prev, rotation: prev.rotation + deg } : null));
  };

  const scaleOverlay = (factor: number) => {
    setOverlay((prev) => {
      if (!prev) return null;
      const newW = prev.width * factor;
      const newH = prev.height * factor;
      return {
        ...prev,
        x: prev.x - (newW - prev.width) / 2,
        y: prev.y - (newH - prev.height) / 2,
        width: newW,
        height: newH,
      };
    });
  };

  const removeOverlay = () => setOverlay(null);

  // ── Flatten with watermark & save ──
  const handleSave = async () => {
    if (!bgImage) {
      toast.error("Sube una imagen de fondo primero");
      return;
    }
    setSaving(true);

    try {
      // Create final canvas at full background resolution
      const finalCanvas = document.createElement("canvas");
      const fw = bgImage.width;
      const fh = bgImage.height;
      finalCanvas.width = fw;
      finalCanvas.height = fh;
      const ctx = finalCanvas.getContext("2d")!;

      // 1) Draw background at full resolution
      ctx.drawImage(bgImage, 0, 0, fw, fh);

      // 2) Draw overlay scaled to full resolution
      if (overlay) {
        const scaleX = fw / CANVAS_W;
        const scaleY = fh / CANVAS_H;
        ctx.save();
        const ox = overlay.x * scaleX;
        const oy = overlay.y * scaleY;
        const ow = overlay.width * scaleX;
        const oh = overlay.height * scaleY;
        ctx.translate(ox + ow / 2, oy + oh / 2);
        ctx.rotate((overlay.rotation * Math.PI) / 180);
        ctx.drawImage(overlay.img, -ow / 2, -oh / 2, ow, oh);
        ctx.restore();
      }

      // 3) Apply watermark — company logo + diagonal text
      ctx.save();
      ctx.globalAlpha = 0.2;

      // Company logo watermark (centered, large)
      if (company?.logo_url) {
        try {
          const logoImg = await loadImageFromUrl(company.logo_url);
          const logoMaxDim = Math.min(fw, fh) * 0.35;
          const logoScale = Math.min(logoMaxDim / logoImg.width, logoMaxDim / logoImg.height);
          const lw = logoImg.width * logoScale;
          const lh = logoImg.height * logoScale;
          ctx.drawImage(logoImg, (fw - lw) / 2, (fh - lh) / 2, lw, lh);
        } catch {
          // Skip logo if it fails to load
        }
      }

      // Diagonal text watermark
      const companyName = company?.name || "Sign Flow";
      const watermarkText = `Propuesta exclusiva de ${companyName} - Prohibida su reproducción`;
      
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = "white";
      ctx.font = `bold ${Math.max(14, fw * 0.018)}px Inter, sans-serif`;
      ctx.textAlign = "center";

      // Repeat watermark across the image diagonally
      const diagonal = Math.sqrt(fw * fw + fh * fh);
      const step = Math.max(60, fw * 0.08);

      ctx.translate(fw / 2, fh / 2);
      ctx.rotate(-Math.PI / 6);

      for (let y = -diagonal / 2; y < diagonal / 2; y += step) {
        ctx.fillText(watermarkText, 0, y);
      }

      ctx.restore();

      // 4) Export as blob
      const blob = await new Promise<Blob>((resolve) =>
        finalCanvas.toBlob((b) => resolve(b!), "image/png", 1)
      );

      // 5) Upload to Supabase Storage
      const filePath = `${proposalId}/mockup-${Date.now()}.png`;
      const { error: uploadErr } = await supabase.storage
        .from("proposal-mockups")
        .upload(filePath, blob, { contentType: "image/png", upsert: true });

      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage
        .from("proposal-mockups")
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // 6) Update proposal with mockup URL
      const { error: updateErr } = await supabase
        .from("proposals")
        .update({ mockup_url: publicUrl } as any)
        .eq("id", proposalId);

      if (updateErr) throw updateErr;

      onSaved(publicUrl);
      toast.success("Mockup guardado correctamente");
      onClose();
    } catch (err: any) {
      console.error("Error saving mockup:", err);
      toast.error("Error al guardar el mockup: " + (err.message || ""));
    } finally {
      setSaving(false);
    }
  };

  const loadImageFromUrl = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });

  // Hidden file inputs
  const bgInputRef = useRef<HTMLInputElement>(null);
  const overlayInputRef = useRef<HTMLInputElement>(null);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[960px] max-h-[95vh] overflow-y-auto p-0 gap-0 bg-[#0a0a0a] border-white/[0.06]">
        <DialogHeader className="p-5 pb-0">
          <DialogTitle className="text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-orange-400/70" />
            Generador de Mockup Visual
            <span className="text-xs text-zinc-500 font-normal ml-2">— {clientName}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="p-5 space-y-4">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={bgInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleBgUpload}
            />
            <input
              ref={overlayInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleOverlayUpload}
            />

            <Button
              variant="outline"
              size="sm"
              onClick={() => bgInputRef.current?.click()}
              className="border-white/[0.06] text-zinc-300 hover:text-white hover:border-orange-500/20 bg-white/[0.02]"
            >
              <ImagePlus className="w-4 h-4 mr-1.5" />
              Fondo
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => overlayInputRef.current?.click()}
              disabled={!bgImage}
              className="border-white/[0.06] text-zinc-300 hover:text-white hover:border-orange-500/20 bg-white/[0.02]"
            >
              <Upload className="w-4 h-4 mr-1.5" />
              Logo / Producto
            </Button>

            <div className="h-5 w-px bg-white/[0.06] mx-1" />

            <Button
              variant="ghost"
              size="icon"
              onClick={() => rotateOverlay(-15)}
              disabled={!overlay}
              className="text-zinc-400 hover:text-white h-8 w-8"
              title="Rotar izquierda"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => rotateOverlay(15)}
              disabled={!overlay}
              className="text-zinc-400 hover:text-white h-8 w-8"
              title="Rotar derecha"
            >
              <RotateCw className="w-4 h-4" />
            </Button>

            <div className="h-5 w-px bg-white/[0.06] mx-1" />

            <Button
              variant="ghost"
              size="icon"
              onClick={() => scaleOverlay(1.15)}
              disabled={!overlay}
              className="text-zinc-400 hover:text-white h-8 w-8"
              title="Aumentar"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => scaleOverlay(0.85)}
              disabled={!overlay}
              className="text-zinc-400 hover:text-white h-8 w-8"
              title="Reducir"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>

            <div className="h-5 w-px bg-white/[0.06] mx-1" />

            <Button
              variant="ghost"
              size="icon"
              onClick={removeOverlay}
              disabled={!overlay}
              className="text-zinc-400 hover:text-destructive h-8 w-8"
              title="Eliminar capa"
            >
              <Trash2 className="w-4 h-4" />
            </Button>

            <div className="flex-1" />

            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving || !bgImage}
              className="bg-gradient-to-b from-orange-500 to-orange-600 text-white hover:from-orange-500 hover:to-orange-700 shadow-[0_2px_8px_rgba(249,115,22,0.15)]"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-1.5" />
                  Guardar Mockup
                </>
              )}
            </Button>
          </div>

          {/* Canvas area */}
          <div
            ref={containerRef}
            className="relative rounded-xl overflow-hidden border border-white/[0.06]"
            style={{ background: "hsl(0 0% 5%)" }}
          >
            <canvas
              ref={canvasRef}
              width={CANVAS_W}
              height={CANVAS_H}
              className="w-full cursor-crosshair touch-none"
              style={{ display: "block", maxHeight: "65vh" }}
              onMouseDown={handlePointerDown}
              onMouseMove={handlePointerMove}
              onMouseUp={handlePointerUp}
              onMouseLeave={handlePointerUp}
              onTouchStart={handlePointerDown}
              onTouchMove={handlePointerMove}
              onTouchEnd={handlePointerUp}
            />

            {overlay && (
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-medium flex items-center gap-1.5"
                style={{ background: "hsl(0 0% 0% / 0.7)", color: "hsl(0 0% 60%)", backdropFilter: "blur(8px)" }}>
                <Move className="w-3 h-3" />
                Arrastra para mover · Esquinas para redimensionar
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex items-center gap-2 text-[11px] text-zinc-600">
            <Layers className="w-3.5 h-3.5" />
            <span>
              Al guardar se aplica automáticamente una marca de agua con el logo y nombre de tu empresa. Este proceso es irreversible.
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

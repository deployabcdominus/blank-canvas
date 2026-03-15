import { useState, useRef, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  ImagePlus,
  Layers,
  RotateCcw,
  Trash2,
  Save,
  Loader2,
  Move,
  Upload,
  Maximize2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/hooks/useCompany";
import { toast } from "sonner";
import {
  drawPerspectiveWarp,
  getDefaultCorners,
  type Corners,
  type Point,
} from "@/lib/perspective-warp";

/* ───────── Types ───────── */
interface MockupEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposalId: string;
  clientName: string;
  onSaved: (mockupUrl: string) => void;
}

interface OverlayState {
  img: HTMLImageElement;
  corners: Corners;
}

type DragTarget = "none" | "body" | "pin-0" | "pin-1" | "pin-2" | "pin-3";

const CANVAS_W = 900;
const CANVAS_H = 640;
const PIN_RADIUS = 7;
const PIN_HIT = 14;

/* ───────── Component ───────── */
export const MockupEditorModal = ({
  isOpen,
  onClose,
  proposalId,
  clientName,
  onSaved,
}: MockupEditorModalProps) => {
  const { company } = useCompany();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
  const [overlay, setOverlay] = useState<OverlayState | null>(null);
  const [saving, setSaving] = useState(false);
  const [perspectiveMode, setPerspectiveMode] = useState(true);

  // Drag state (mutable for perf)
  const dragRef = useRef<{
    target: DragTarget;
    startX: number;
    startY: number;
    origCorners: Corners;
  } | null>(null);

  /* ── Drawing ── */
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    if (bgImage) {
      const scale = Math.min(CANVAS_W / bgImage.width, CANVAS_H / bgImage.height);
      const w = bgImage.width * scale;
      const h = bgImage.height * scale;
      ctx.drawImage(bgImage, (CANVAS_W - w) / 2, (CANVAS_H - h) / 2, w, h);
    } else {
      ctx.fillStyle = "hsl(0 0% 6%)";
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.fillStyle = "hsl(0 0% 30%)";
      ctx.font = "15px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Sube una imagen de fondo para comenzar", CANVAS_W / 2, CANVAS_H / 2);
    }

    if (overlay) {
      // Draw warped image
      drawPerspectiveWarp(ctx, overlay.img, overlay.corners, 16);

      // Draw selection UI
      ctx.save();
      const c = overlay.corners;

      // Connecting lines
      ctx.strokeStyle = "rgba(249,115,22,0.7)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(c[0].x, c[0].y);
      ctx.lineTo(c[1].x, c[1].y);
      ctx.lineTo(c[2].x, c[2].y);
      ctx.lineTo(c[3].x, c[3].y);
      ctx.closePath();
      ctx.stroke();
      ctx.setLineDash([]);

      // Pin handles
      c.forEach((p, i) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, PIN_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = "hsl(25 95% 53%)";
        ctx.fill();
        ctx.strokeStyle = "hsl(0 0% 100% / 0.8)";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Label
        ctx.fillStyle = "white";
        ctx.font = "bold 9px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(String(i + 1), p.x, p.y + 3);
      });

      ctx.restore();
    }
  }, [bgImage, overlay]);

  useEffect(() => {
    draw();
  }, [draw]);

  /* ── File loading ── */
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

  const loadImageFromUrl = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
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
    const maxDim = 220;
    const scale = Math.min(maxDim / img.width, maxDim / img.height, 1);
    const w = img.width * scale;
    const h = img.height * scale;
    setOverlay({
      img,
      corners: getDefaultCorners(CANVAS_W / 2, CANVAS_H / 2, w, h),
    });
    e.target.value = "";
  };

  /* ── Canvas interaction ── */
  const getCanvasPos = (e: React.MouseEvent | React.TouchEvent): Point => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const sx = CANVAS_W / rect.width;
    const sy = CANVAS_H / rect.height;
    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * sx,
        y: (e.touches[0].clientY - rect.top) * sy,
      };
    }
    return {
      x: (e.clientX - rect.left) * sx,
      y: (e.clientY - rect.top) * sy,
    };
  };

  const hitTest = (px: number, py: number): DragTarget => {
    if (!overlay) return "none";
    const c = overlay.corners;

    // Check pins first
    for (let i = 0; i < 4; i++) {
      if (Math.abs(px - c[i].x) < PIN_HIT && Math.abs(py - c[i].y) < PIN_HIT) {
        return `pin-${i}` as DragTarget;
      }
    }

    // Check if inside quad (simple point-in-polygon)
    if (pointInQuad(px, py, c)) return "body";

    return "none";
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (!overlay) return;
    e.preventDefault();
    const pos = getCanvasPos(e);
    const target = hitTest(pos.x, pos.y);
    if (target === "none") return;

    dragRef.current = {
      target,
      startX: pos.x,
      startY: pos.y,
      origCorners: overlay.corners.map(p => ({ ...p })) as Corners,
    };
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragRef.current || !overlay) return;
    e.preventDefault();
    const pos = getCanvasPos(e);
    const { target, startX, startY, origCorners } = dragRef.current;
    const dx = pos.x - startX;
    const dy = pos.y - startY;

    if (target === "body") {
      // Move all corners
      const newCorners = origCorners.map(p => ({
        x: p.x + dx,
        y: p.y + dy,
      })) as Corners;
      setOverlay(prev => prev ? { ...prev, corners: newCorners } : null);
    } else if (target.startsWith("pin-")) {
      const idx = parseInt(target.split("-")[1]);
      const newCorners = origCorners.map((p, i) =>
        i === idx ? { x: p.x + dx, y: p.y + dy } : { ...p }
      ) as Corners;
      setOverlay(prev => prev ? { ...prev, corners: newCorners } : null);
    }
  };

  const handlePointerUp = () => {
    dragRef.current = null;
  };

  /* ── Controls ── */
  const resetPerspective = () => {
    if (!overlay) return;
    const bounds = getBounds(overlay.corners);
    const cx = (bounds.minX + bounds.maxX) / 2;
    const cy = (bounds.minY + bounds.maxY) / 2;
    const w = bounds.maxX - bounds.minX;
    const h = bounds.maxY - bounds.minY;
    setOverlay(prev =>
      prev ? { ...prev, corners: getDefaultCorners(cx, cy, w, h) } : null
    );
  };

  const removeOverlay = () => setOverlay(null);

  /* ── Save with watermark ── */
  const handleSave = async () => {
    if (!bgImage) {
      toast.error("Sube una imagen de fondo primero");
      return;
    }
    setSaving(true);

    try {
      const finalCanvas = document.createElement("canvas");
      const fw = bgImage.width;
      const fh = bgImage.height;
      finalCanvas.width = fw;
      finalCanvas.height = fh;
      const ctx = finalCanvas.getContext("2d")!;

      // 1) Background at full resolution
      ctx.drawImage(bgImage, 0, 0, fw, fh);

      // 2) Overlay warped, scaled to full res
      if (overlay) {
        const scaleX = fw / CANVAS_W;
        const scaleY = fh / CANVAS_H;
        const scaledCorners = overlay.corners.map(p => ({
          x: p.x * scaleX,
          y: p.y * scaleY,
        })) as Corners;
        drawPerspectiveWarp(ctx, overlay.img, scaledCorners, 20);
      }

      // 3) Watermark
      ctx.save();
      ctx.globalAlpha = 0.2;

      if (company?.logo_url) {
        try {
          const logoImg = await loadImageFromUrl(company.logo_url);
          const logoMax = Math.min(fw, fh) * 0.35;
          const logoScale = Math.min(logoMax / logoImg.width, logoMax / logoImg.height);
          const lw = logoImg.width * logoScale;
          const lh = logoImg.height * logoScale;
          ctx.drawImage(logoImg, (fw - lw) / 2, (fh - lh) / 2, lw, lh);
        } catch {
          // skip
        }
      }

      const companyName = company?.name || "Sign Flow";
      const watermarkText = `Propuesta exclusiva de ${companyName} - Prohibida su reproducción`;
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = "white";
      ctx.font = `bold ${Math.max(14, fw * 0.018)}px Inter, sans-serif`;
      ctx.textAlign = "center";

      const diagonal = Math.sqrt(fw * fw + fh * fh);
      const step = Math.max(60, fw * 0.08);
      ctx.translate(fw / 2, fh / 2);
      ctx.rotate(-Math.PI / 6);
      for (let y = -diagonal / 2; y < diagonal / 2; y += step) {
        ctx.fillText(watermarkText, 0, y);
      }
      ctx.restore();

      // 4) Export
      const blob = await new Promise<Blob>(resolve =>
        finalCanvas.toBlob(b => resolve(b!), "image/png", 1)
      );

      const filePath = `${proposalId}/mockup-${Date.now()}.png`;
      const { error: uploadErr } = await supabase.storage
        .from("proposal-mockups")
        .upload(filePath, blob, { contentType: "image/png", upsert: true });
      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage
        .from("proposal-mockups")
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      const { error: updateErr } = await supabase
        .from("proposals")
        .update({ mockup_url: publicUrl } as any)
        .eq("id", proposalId);
      if (updateErr) throw updateErr;

      onSaved(publicUrl);
      toast.success("Mockup realista guardado correctamente");
      onClose();
    } catch (err: any) {
      console.error("Error saving mockup:", err);
      toast.error("Error al guardar: " + (err.message || ""));
    } finally {
      setSaving(false);
    }
  };

  const bgInputRef = useRef<HTMLInputElement>(null);
  const overlayInputRef = useRef<HTMLInputElement>(null);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[1020px] max-h-[95vh] overflow-y-auto p-0 gap-0 bg-[#080808] border-white/[0.06]">
        <DialogHeader className="p-5 pb-0">
          <DialogTitle className="text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-orange-400/70" />
            Generador de Mockup con Perspectiva
            <span className="text-xs text-zinc-500 font-normal ml-2">— {clientName}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="p-5 space-y-4">
          {/* ── Toolbar ── */}
          <div className="flex flex-wrap items-center gap-2">
            <input ref={bgInputRef} type="file" accept="image/*" className="hidden" onChange={handleBgUpload} />
            <input ref={overlayInputRef} type="file" accept="image/*" className="hidden" onChange={handleOverlayUpload} />

            <Button
              variant="outline" size="sm"
              onClick={() => bgInputRef.current?.click()}
              className="border-white/[0.06] text-zinc-300 hover:text-white hover:border-orange-500/20 bg-white/[0.02]"
            >
              <ImagePlus className="w-4 h-4 mr-1.5" />
              Fondo
            </Button>

            <Button
              variant="outline" size="sm"
              onClick={() => overlayInputRef.current?.click()}
              disabled={!bgImage}
              className="border-white/[0.06] text-zinc-300 hover:text-white hover:border-orange-500/20 bg-white/[0.02]"
            >
              <Upload className="w-4 h-4 mr-1.5" />
              Logo / Producto
            </Button>

            <div className="h-5 w-px bg-white/[0.06] mx-1" />

            <Button
              variant={perspectiveMode ? "default" : "ghost"}
              size="sm"
              onClick={() => setPerspectiveMode(!perspectiveMode)}
              disabled={!overlay}
              className={perspectiveMode
                ? "bg-orange-500/20 text-orange-300 border border-orange-500/30 hover:bg-orange-500/30"
                : "text-zinc-400 hover:text-white"}
            >
              <Maximize2 className="w-4 h-4 mr-1.5" />
              Perspectiva
            </Button>

            <Button
              variant="ghost" size="icon"
              onClick={resetPerspective}
              disabled={!overlay}
              className="text-zinc-400 hover:text-white h-8 w-8"
              title="Restaurar forma"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost" size="icon"
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
                <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />Guardando...</>
              ) : (
                <><Save className="w-4 h-4 mr-1.5" />Finalizar Mockup Realista</>
              )}
            </Button>
          </div>

          {/* ── Canvas ── */}
          <div className="relative rounded-xl overflow-hidden border border-white/[0.06]" style={{ background: "hsl(0 0% 4%)" }}>
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
              <div
                className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-medium flex items-center gap-1.5"
                style={{ background: "hsl(0 0% 0% / 0.75)", color: "hsl(0 0% 60%)", backdropFilter: "blur(8px)" }}
              >
                <Move className="w-3 h-3" />
                Arrastra para mover · Arrastra los pins para ajustar perspectiva
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex items-center gap-2 text-[11px] text-zinc-600">
            <Layers className="w-3.5 h-3.5" />
            <span>
              Ajusta los 4 pins para que el logo se adapte a la perspectiva de la superficie. Al guardar se aplica marca de agua irreversible.
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/* ── Helpers ── */
function pointInQuad(px: number, py: number, c: Corners): boolean {
  // Simple cross-product test for convex quad
  const cross = (ax: number, ay: number, bx: number, by: number) => ax * by - ay * bx;
  const signs: boolean[] = [];
  for (let i = 0; i < 4; i++) {
    const j = (i + 1) % 4;
    const dx = c[j].x - c[i].x;
    const dy = c[j].y - c[i].y;
    signs.push(cross(dx, dy, px - c[i].x, py - c[i].y) > 0);
  }
  return signs.every(s => s) || signs.every(s => !s);
}

function getBounds(corners: Corners) {
  const xs = corners.map(p => p.x);
  const ys = corners.map(p => p.y);
  return {
    minX: Math.min(...xs),
    minY: Math.min(...ys),
    maxX: Math.max(...xs),
    maxY: Math.max(...ys),
  };
}

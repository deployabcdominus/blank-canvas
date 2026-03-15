import { useState, useRef, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ImagePlus, Layers, RotateCcw, Trash2, Save, Loader2, Move, Upload,
  Maximize2, MapPin, Pipette, Paintbrush,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/hooks/useCompany";
import { toast } from "sonner";
import {
  drawPerspectiveWarp, getDefaultCorners,
  type Corners, type Point,
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
type EditorTool = "perspective" | "brush";

const CANVAS_W = 900;
const CANVAS_H = 640;
const PIN_HIT = 14;

/* ───────── Component ───────── */
export const MockupEditorModal = ({
  isOpen, onClose, proposalId, clientName, onSaved,
}: MockupEditorModalProps) => {
  const { company } = useCompany();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
  const [overlay, setOverlay] = useState<OverlayState | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTool, setActiveTool] = useState<EditorTool>("perspective");

  // Street View
  const [svAddress, setSvAddress] = useState("");
  const [svLoading, setSvLoading] = useState(false);

  // Brush state
  const [brushColor, setBrushColor] = useState("#888888");
  const [brushSize, setBrushSize] = useState(20);
  const [brushStrokes, setBrushStrokes] = useState<Array<{ points: Point[]; color: string; size: number }>>([]);
  const currentStrokeRef = useRef<Point[]>([]);
  const isBrushingRef = useRef(false);

  // Eyedropper
  const [pickingColor, setPickingColor] = useState(false);

  // Drag state
  const dragRef = useRef<{
    target: DragTarget;
    startX: number; startY: number;
    origCorners: Corners;
  } | null>(null);

  /* ── Draw ── */
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
      ctx.fillText("Sube una imagen o busca una fachada con Street View", CANVAS_W / 2, CANVAS_H / 2);
    }

    // Draw brush strokes (healing brush)
    brushStrokes.forEach(stroke => {
      if (stroke.points.length < 2) return;
      ctx.save();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.size;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
      ctx.restore();
    });

    // Overlay with perspective warp
    if (overlay) {
      drawPerspectiveWarp(ctx, overlay.img, overlay.corners, 16);

      if (activeTool === "perspective") {
        ctx.save();
        const c = overlay.corners;
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

        c.forEach((p, i) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
          ctx.fillStyle = "hsl(25 95% 53%)";
          ctx.fill();
          ctx.strokeStyle = "rgba(255,255,255,0.8)";
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.fillStyle = "white";
          ctx.font = "bold 9px Inter, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(String(i + 1), p.x, p.y + 3);
        });
        ctx.restore();
      }
    }
  }, [bgImage, overlay, brushStrokes, activeTool]);

  useEffect(() => { draw(); }, [draw]);

  /* ── Image loading ── */
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

  const loadImageFromDataUrl = (dataUrl: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = dataUrl;
    });

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBgImage(await loadImage(file));
    setBrushStrokes([]);
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
    setOverlay({ img, corners: getDefaultCorners(CANVAS_W / 2, CANVAS_H / 2, w, h) });
    setActiveTool("perspective");
    e.target.value = "";
  };

  /* ── Street View ── */
  const handleStreetView = async () => {
    if (!svAddress.trim()) return;
    setSvLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("street-view", {
        body: { address: svAddress.trim() },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      if (data?.image) {
        const img = await loadImageFromDataUrl(data.image);
        setBgImage(img);
        setBrushStrokes([]);
        toast.success(`Fachada cargada: ${data.formatted_address}`);
      }
    } catch (err: any) {
      toast.error(err.message || "Error al obtener Street View");
    } finally {
      setSvLoading(false);
    }
  };

  /* ── Canvas interaction ── */
  const getCanvasPos = (e: React.MouseEvent | React.TouchEvent): Point => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const sx = CANVAS_W / rect.width;
    const sy = CANVAS_H / rect.height;
    if ("touches" in e) {
      return { x: (e.touches[0].clientX - rect.left) * sx, y: (e.touches[0].clientY - rect.top) * sy };
    }
    return { x: (e.clientX - rect.left) * sx, y: (e.clientY - rect.top) * sy };
  };

  const hitTest = (px: number, py: number): DragTarget => {
    if (!overlay) return "none";
    const c = overlay.corners;
    for (let i = 0; i < 4; i++) {
      if (Math.abs(px - c[i].x) < PIN_HIT && Math.abs(py - c[i].y) < PIN_HIT) return `pin-${i}` as DragTarget;
    }
    if (pointInQuad(px, py, c)) return "body";
    return "none";
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const pos = getCanvasPos(e);

    // Eyedropper
    if (pickingColor) {
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx) {
        const pixel = ctx.getImageData(pos.x, pos.y, 1, 1).data;
        const hex = `#${pixel[0].toString(16).padStart(2, "0")}${pixel[1].toString(16).padStart(2, "0")}${pixel[2].toString(16).padStart(2, "0")}`;
        setBrushColor(hex);
        setPickingColor(false);
      }
      return;
    }

    if (activeTool === "brush" && bgImage) {
      isBrushingRef.current = true;
      currentStrokeRef.current = [pos];
      return;
    }

    if (activeTool === "perspective" && overlay) {
      const target = hitTest(pos.x, pos.y);
      if (target === "none") return;
      dragRef.current = {
        target, startX: pos.x, startY: pos.y,
        origCorners: overlay.corners.map(p => ({ ...p })) as Corners,
      };
    }
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const pos = getCanvasPos(e);

    if (activeTool === "brush" && isBrushingRef.current) {
      currentStrokeRef.current.push(pos);
      // Live preview: temporarily add current stroke
      const tempStroke = { points: [...currentStrokeRef.current], color: brushColor, size: brushSize };
      setBrushStrokes(prev => [...prev.filter(s => s !== prev[prev.length - 1] || prev.length === brushStrokes.length), ...prev.length > brushStrokes.length ? [] : [], tempStroke]);
      return;
    }

    if (activeTool === "perspective" && dragRef.current && overlay) {
      const { target, startX, startY, origCorners } = dragRef.current;
      const dx = pos.x - startX;
      const dy = pos.y - startY;

      if (target === "body") {
        const newCorners = origCorners.map(p => ({ x: p.x + dx, y: p.y + dy })) as Corners;
        setOverlay(prev => prev ? { ...prev, corners: newCorners } : null);
      } else if (target.startsWith("pin-")) {
        const idx = parseInt(target.split("-")[1]);
        const newCorners = origCorners.map((p, i) => i === idx ? { x: p.x + dx, y: p.y + dy } : { ...p }) as Corners;
        setOverlay(prev => prev ? { ...prev, corners: newCorners } : null);
      }
    }
  };

  const handlePointerUp = () => {
    if (isBrushingRef.current && currentStrokeRef.current.length > 1) {
      setBrushStrokes(prev => [...prev, { points: [...currentStrokeRef.current], color: brushColor, size: brushSize }]);
    }
    isBrushingRef.current = false;
    currentStrokeRef.current = [];
    dragRef.current = null;
  };

  /* ── Controls ── */
  const resetPerspective = () => {
    if (!overlay) return;
    const bounds = getBounds(overlay.corners);
    const cx = (bounds.minX + bounds.maxX) / 2;
    const cy = (bounds.minY + bounds.maxY) / 2;
    setOverlay(prev => prev ? { ...prev, corners: getDefaultCorners(cx, cy, bounds.maxX - bounds.minX, bounds.maxY - bounds.minY) } : null);
  };

  /* ── Save ── */
  const handleSave = async () => {
    if (!bgImage) { toast.error("Sube una imagen de fondo primero"); return; }
    setSaving(true);

    try {
      const finalCanvas = document.createElement("canvas");
      const fw = bgImage.width, fh = bgImage.height;
      finalCanvas.width = fw;
      finalCanvas.height = fh;
      const ctx = finalCanvas.getContext("2d")!;

      ctx.drawImage(bgImage, 0, 0, fw, fh);

      // Brush strokes scaled
      const scaleX = fw / CANVAS_W, scaleY = fh / CANVAS_H;
      brushStrokes.forEach(stroke => {
        if (stroke.points.length < 2) return;
        ctx.save();
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.size * Math.max(scaleX, scaleY);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.moveTo(stroke.points[0].x * scaleX, stroke.points[0].y * scaleY);
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x * scaleX, stroke.points[i].y * scaleY);
        }
        ctx.stroke();
        ctx.restore();
      });

      // Overlay
      if (overlay) {
        const scaledCorners = overlay.corners.map(p => ({ x: p.x * scaleX, y: p.y * scaleY })) as Corners;
        drawPerspectiveWarp(ctx, overlay.img, scaledCorners, 20);
      }

      // Watermark
      ctx.save();
      ctx.globalAlpha = 0.2;
      if (company?.logo_url) {
        try {
          const logoImg = await loadImageFromUrl(company.logo_url);
          const logoMax = Math.min(fw, fh) * 0.35;
          const ls = Math.min(logoMax / logoImg.width, logoMax / logoImg.height);
          const lw = logoImg.width * ls, lh = logoImg.height * ls;
          ctx.drawImage(logoImg, (fw - lw) / 2, (fh - lh) / 2, lw, lh);
        } catch { /* skip */ }
      }

      const companyName = company?.name || "Sign Flow";
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = "white";
      ctx.font = `bold ${Math.max(14, fw * 0.018)}px Inter, sans-serif`;
      ctx.textAlign = "center";
      const diagonal = Math.sqrt(fw * fw + fh * fh);
      const step = Math.max(60, fw * 0.08);
      ctx.translate(fw / 2, fh / 2);
      ctx.rotate(-Math.PI / 6);
      for (let y = -diagonal / 2; y < diagonal / 2; y += step) {
        ctx.fillText(`Propuesta exclusiva de ${companyName} - Prohibida su reproducción`, 0, y);
      }
      ctx.restore();

      const blob = await new Promise<Blob>(res => finalCanvas.toBlob(b => res(b!), "image/png", 1));
      const filePath = `${proposalId}/mockup-${Date.now()}.png`;
      const { error: uploadErr } = await supabase.storage.from("proposal-mockups").upload(filePath, blob, { contentType: "image/png", upsert: true });
      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage.from("proposal-mockups").getPublicUrl(filePath);
      await (supabase as any).from("proposals").update({ mockup_url: urlData.publicUrl }).eq("id", proposalId);

      onSaved(urlData.publicUrl);
      toast.success("Mockup realista guardado");
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

  const cursorStyle = pickingColor ? "crosshair" : activeTool === "brush" ? `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="${brushSize}" height="${brushSize}"><circle cx="${brushSize/2}" cy="${brushSize/2}" r="${brushSize/2-1}" fill="none" stroke="orange" stroke-width="1.5"/></svg>') ${brushSize/2} ${brushSize/2}, crosshair` : "default";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[1060px] max-h-[95vh] overflow-y-auto p-0 gap-0 bg-[#080808] border-white/[0.06]">
        <DialogHeader className="p-5 pb-0">
          <DialogTitle className="text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-orange-400/70" />
            Generador de Mockup con Perspectiva
            <span className="text-xs text-zinc-500 font-normal ml-2">— {clientName}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="p-5 space-y-4">
          {/* Street View search */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                value={svAddress}
                onChange={e => setSvAddress(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleStreetView()}
                placeholder="Buscar fachada por dirección (Street View)..."
                className="pl-9 bg-white/[0.02] border-white/[0.06] text-white placeholder:text-zinc-600 h-9"
              />
            </div>
            <Button
              variant="outline" size="sm"
              onClick={handleStreetView}
              disabled={svLoading || !svAddress.trim()}
              className="border-white/[0.06] text-zinc-300 hover:text-white hover:border-orange-500/20 bg-white/[0.02] h-9"
            >
              {svLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
              <span className="ml-1.5 hidden sm:inline">Buscar</span>
            </Button>
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <input ref={bgInputRef} type="file" accept="image/*" className="hidden" onChange={handleBgUpload} />
            <input ref={overlayInputRef} type="file" accept="image/*" className="hidden" onChange={handleOverlayUpload} />

            <Button variant="outline" size="sm" onClick={() => bgInputRef.current?.click()}
              className="border-white/[0.06] text-zinc-300 hover:text-white hover:border-orange-500/20 bg-white/[0.02]">
              <ImagePlus className="w-4 h-4 mr-1.5" />Fondo
            </Button>
            <Button variant="outline" size="sm" onClick={() => overlayInputRef.current?.click()} disabled={!bgImage}
              className="border-white/[0.06] text-zinc-300 hover:text-white hover:border-orange-500/20 bg-white/[0.02]">
              <Upload className="w-4 h-4 mr-1.5" />Logo / Producto
            </Button>

            <div className="h-5 w-px bg-white/[0.06] mx-1" />

            {/* Tool toggle */}
            <Button
              variant={activeTool === "perspective" ? "default" : "ghost"} size="sm"
              onClick={() => setActiveTool("perspective")} disabled={!overlay}
              className={activeTool === "perspective" ? "bg-orange-500/20 text-orange-300 border border-orange-500/30" : "text-zinc-400 hover:text-white"}>
              <Maximize2 className="w-4 h-4 mr-1.5" />Perspectiva
            </Button>
            <Button
              variant={activeTool === "brush" ? "default" : "ghost"} size="sm"
              onClick={() => setActiveTool("brush")} disabled={!bgImage}
              className={activeTool === "brush" ? "bg-orange-500/20 text-orange-300 border border-orange-500/30" : "text-zinc-400 hover:text-white"}>
              <Paintbrush className="w-4 h-4 mr-1.5" />Parche
            </Button>

            {activeTool === "brush" && (
              <>
                <div className="h-5 w-px bg-white/[0.06] mx-1" />
                <Button variant="ghost" size="icon" onClick={() => setPickingColor(true)}
                  className={`h-8 w-8 ${pickingColor ? "text-orange-400" : "text-zinc-400 hover:text-white"}`} title="Capturar color">
                  <Pipette className="w-4 h-4" />
                </Button>
                <input type="color" value={brushColor} onChange={e => setBrushColor(e.target.value)}
                  className="w-7 h-7 rounded border border-white/10 bg-transparent cursor-pointer" title="Color del pincel" />
                <input type="range" min={5} max={60} value={brushSize} onChange={e => setBrushSize(Number(e.target.value))}
                  className="w-20 accent-orange-500" title={`Tamaño: ${brushSize}px`} />
              </>
            )}

            <div className="h-5 w-px bg-white/[0.06] mx-1" />

            <Button variant="ghost" size="icon" onClick={resetPerspective} disabled={!overlay}
              className="text-zinc-400 hover:text-white h-8 w-8" title="Restaurar forma">
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setOverlay(null)} disabled={!overlay}
              className="text-zinc-400 hover:text-destructive h-8 w-8" title="Eliminar capa">
              <Trash2 className="w-4 h-4" />
            </Button>

            <div className="flex-1" />

            <Button size="sm" onClick={handleSave} disabled={saving || !bgImage}
              className="bg-gradient-to-b from-orange-500 to-orange-600 text-white hover:from-orange-500 hover:to-orange-700 shadow-[0_2px_8px_rgba(249,115,22,0.15)]">
              {saving ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />Guardando...</> : <><Save className="w-4 h-4 mr-1.5" />Finalizar Mockup Realista</>}
            </Button>
          </div>

          {/* Canvas */}
          <div className="relative rounded-xl overflow-hidden border border-white/[0.06]" style={{ background: "hsl(0 0% 4%)" }}>
            <canvas
              ref={canvasRef} width={CANVAS_W} height={CANVAS_H}
              className="w-full touch-none" style={{ display: "block", maxHeight: "60vh", cursor: cursorStyle }}
              onMouseDown={handlePointerDown} onMouseMove={handlePointerMove}
              onMouseUp={handlePointerUp} onMouseLeave={handlePointerUp}
              onTouchStart={handlePointerDown} onTouchMove={handlePointerMove} onTouchEnd={handlePointerUp}
            />
            {overlay && activeTool === "perspective" && (
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-medium flex items-center gap-1.5"
                style={{ background: "hsl(0 0% 0% / 0.75)", color: "hsl(0 0% 60%)", backdropFilter: "blur(8px)" }}>
                <Move className="w-3 h-3" />Arrastra para mover · Pins para perspectiva
              </div>
            )}
            {activeTool === "brush" && (
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-medium flex items-center gap-1.5"
                style={{ background: "hsl(0 0% 0% / 0.75)", color: "hsl(0 0% 60%)", backdropFilter: "blur(8px)" }}>
                <Paintbrush className="w-3 h-3" />Pinta sobre el letrero viejo · Usa el cuentagotas para capturar color
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-zinc-600">
            <Layers className="w-3.5 h-3.5" />
            <span>Al guardar se aplica marca de agua irreversible con el logo y nombre de tu empresa.</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/* ── Helpers ── */
function pointInQuad(px: number, py: number, c: Corners): boolean {
  const cross = (ax: number, ay: number, bx: number, by: number) => ax * by - ay * bx;
  const signs: boolean[] = [];
  for (let i = 0; i < 4; i++) {
    const j = (i + 1) % 4;
    signs.push(cross(c[j].x - c[i].x, c[j].y - c[i].y, px - c[i].x, py - c[i].y) > 0);
  }
  return signs.every(s => s) || signs.every(s => !s);
}

function getBounds(corners: Corners) {
  const xs = corners.map(p => p.x), ys = corners.map(p => p.y);
  return { minX: Math.min(...xs), minY: Math.min(...ys), maxX: Math.max(...xs), maxY: Math.max(...ys) };
}

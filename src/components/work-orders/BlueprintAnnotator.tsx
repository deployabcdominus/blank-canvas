import React, { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Ruler, Type, MousePointer, Trash2, Upload, ZoomIn, ZoomOut, RotateCcw,
} from "lucide-react";

// ── Types ──
export interface Annotation {
  id: string;
  type: "line" | "label";
  // Line: two endpoints + label
  x1: number; y1: number; x2: number; y2: number;
  text: string;
  // All coords are 0-1 normalized
}

interface BlueprintAnnotatorProps {
  imageUrl: string | null;
  annotations: Annotation[];
  onChange: (annotations: Annotation[]) => void;
  onImageUpload: (file: File) => Promise<void>;
  readOnly?: boolean;
}

type Tool = "select" | "line" | "label";

const COLORS = {
  line: "hsl(25, 95%, 55%)",        // orange
  lineArrow: "hsl(25, 95%, 55%)",
  label: "hsl(0, 0%, 95%)",         // white
  hover: "hsl(25, 95%, 70%)",
  selected: "hsl(25, 100%, 65%)",
};

function genId() {
  return `a-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function BlueprintAnnotator({
  imageUrl,
  annotations,
  onChange,
  onImageUpload,
  readOnly = false,
}: BlueprintAnnotatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tool, setTool] = useState<Tool>("select");
  const [drawing, setDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentPos, setCurrentPos] = useState<{ x: number; y: number } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const [labelText, setLabelText] = useState("");
  const [imgLoaded, setImgLoaded] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ w: 600, h: 400 });

  // Load image
  useEffect(() => {
    if (!imageUrl) { setImgLoaded(false); return; }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      setImgLoaded(true);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Resize canvas to container
  useEffect(() => {
    const resize = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const w = Math.floor(rect.width);
      const img = imgRef.current;
      const aspect = img ? img.height / img.width : 2 / 3;
      const h = Math.min(Math.floor(w * aspect), 500);
      setCanvasSize({ w, h });
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [imgLoaded]);

  // Draw
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { w, h } = canvasSize;
    canvas.width = w * 2; // retina
    canvas.height = h * 2;
    ctx.scale(2, 2);

    // Background
    ctx.fillStyle = "hsl(240, 6%, 10%)";
    ctx.fillRect(0, 0, w, h);

    // Image
    if (imgRef.current && imgLoaded) {
      const img = imgRef.current;
      const imgAspect = img.width / img.height;
      const canvasAspect = w / h;
      let dw: number, dh: number, dx: number, dy: number;
      if (imgAspect > canvasAspect) {
        dw = w; dh = w / imgAspect; dx = 0; dy = (h - dh) / 2;
      } else {
        dh = h; dw = h * imgAspect; dy = 0; dx = (w - dw) / 2;
      }
      ctx.drawImage(img, dx, dy, dw, dh);
    }

    // Draw annotations
    const allAnnotations = [...annotations];
    for (const ann of allAnnotations) {
      const x1 = ann.x1 * w, y1 = ann.y1 * h;
      const x2 = ann.x2 * w, y2 = ann.y2 * h;
      const isSelected = ann.id === selectedId;

      if (ann.type === "line") {
        // Line
        ctx.strokeStyle = isSelected ? COLORS.selected : COLORS.line;
        ctx.lineWidth = isSelected ? 2.5 : 1.5;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // Arrows at both ends
        drawArrowhead(ctx, x2, y2, x1, y1, 8, ctx.strokeStyle);
        drawArrowhead(ctx, x1, y1, x2, y2, 8, ctx.strokeStyle);

        // Perpendicular ticks
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const perpAngle = angle + Math.PI / 2;
        const tickLen = 6;
        for (const [px, py] of [[x1, y1], [x2, y2]]) {
          ctx.beginPath();
          ctx.moveTo(px - Math.cos(perpAngle) * tickLen, py - Math.sin(perpAngle) * tickLen);
          ctx.lineTo(px + Math.cos(perpAngle) * tickLen, py + Math.sin(perpAngle) * tickLen);
          ctx.stroke();
        }

        // Label
        if (ann.text) {
          const mx = (x1 + x2) / 2;
          const my = (y1 + y2) / 2;
          ctx.font = "bold 12px monospace";
          const tm = ctx.measureText(ann.text);
          const pad = 4;
          ctx.fillStyle = "hsla(0, 0%, 0%, 0.7)";
          ctx.fillRect(mx - tm.width / 2 - pad, my - 8 - pad, tm.width + pad * 2, 16 + pad * 2);
          ctx.fillStyle = COLORS.label;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(ann.text, mx, my);
        }
      } else if (ann.type === "label") {
        // Standalone label
        ctx.font = "bold 13px monospace";
        const tm = ctx.measureText(ann.text || "...");
        const pad = 5;
        ctx.fillStyle = "hsla(0, 0%, 0%, 0.65)";
        ctx.fillRect(x1 - pad, y1 - 9 - pad, tm.width + pad * 2, 18 + pad * 2);
        ctx.strokeStyle = isSelected ? COLORS.selected : COLORS.line;
        ctx.lineWidth = 1;
        ctx.strokeRect(x1 - pad, y1 - 9 - pad, tm.width + pad * 2, 18 + pad * 2);
        ctx.fillStyle = COLORS.label;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(ann.text || "...", x1, y1);
      }
    }

    // Drawing preview
    if (drawing && startPos && currentPos && tool === "line") {
      ctx.strokeStyle = COLORS.hover;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(startPos.x * w, startPos.y * h);
      ctx.lineTo(currentPos.x * w, currentPos.y * h);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [canvasSize, imgLoaded, annotations, selectedId, drawing, startPos, currentPos, tool]);

  useEffect(() => { draw(); }, [draw]);

  // Helpers
  function drawArrowhead(ctx: CanvasRenderingContext2D, tipX: number, tipY: number, tailX: number, tailY: number, size: number, color: string) {
    const angle = Math.atan2(tipY - tailY, tipX - tailX);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(tipX - size * Math.cos(angle - Math.PI / 6), tipY - size * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(tipX - size * Math.cos(angle + Math.PI / 6), tipY - size * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
  }

  function getNormPos(e: React.MouseEvent): { x: number; y: number } {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height)),
    };
  }

  function findAnnotationAt(pos: { x: number; y: number }): Annotation | null {
    const threshold = 0.03;
    for (const ann of [...annotations].reverse()) {
      if (ann.type === "line") {
        const dist = pointToLineDistance(pos, { x: ann.x1, y: ann.y1 }, { x: ann.x2, y: ann.y2 });
        if (dist < threshold) return ann;
      } else {
        if (Math.abs(pos.x - ann.x1) < 0.08 && Math.abs(pos.y - ann.y1) < 0.04) return ann;
      }
    }
    return null;
  }

  function pointToLineDistance(p: { x: number; y: number }, a: { x: number; y: number }, b: { x: number; y: number }): number {
    const dx = b.x - a.x, dy = b.y - a.y;
    const len2 = dx * dx + dy * dy;
    if (len2 === 0) return Math.hypot(p.x - a.x, p.y - a.y);
    let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
  }

  // Event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (readOnly) return;
    const pos = getNormPos(e);

    if (tool === "select") {
      const hit = findAnnotationAt(pos);
      setSelectedId(hit?.id || null);
      if (hit && hit.type === "line") {
        // Double-click to edit label
      }
      return;
    }

    if (tool === "line") {
      setDrawing(true);
      setStartPos(pos);
      setCurrentPos(pos);
    }

    if (tool === "label") {
      const id = genId();
      const newAnn: Annotation = { id, type: "label", x1: pos.x, y1: pos.y, x2: pos.x, y2: pos.y, text: "" };
      onChange([...annotations, newAnn]);
      setSelectedId(id);
      setEditingLabel(id);
      setLabelText("");
      setTool("select");
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!drawing) return;
    setCurrentPos(getNormPos(e));
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!drawing || !startPos) return;
    const endPos = getNormPos(e);
    setDrawing(false);

    // Min distance
    const dist = Math.hypot(endPos.x - startPos.x, endPos.y - startPos.y);
    if (dist < 0.02) { setStartPos(null); setCurrentPos(null); return; }

    const id = genId();
    const newAnn: Annotation = {
      id, type: "line",
      x1: startPos.x, y1: startPos.y,
      x2: endPos.x, y2: endPos.y,
      text: "",
    };
    onChange([...annotations, newAnn]);
    setSelectedId(id);
    setEditingLabel(id);
    setLabelText("");
    setStartPos(null);
    setCurrentPos(null);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (readOnly) return;
    const pos = getNormPos(e);
    const hit = findAnnotationAt(pos);
    if (hit) {
      setSelectedId(hit.id);
      setEditingLabel(hit.id);
      setLabelText(hit.text);
    }
  };

  const confirmLabel = () => {
    if (!editingLabel) return;
    onChange(annotations.map(a => a.id === editingLabel ? { ...a, text: labelText } : a));
    setEditingLabel(null);
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    onChange(annotations.filter(a => a.id !== selectedId));
    setSelectedId(null);
  };

  const clearAll = () => {
    onChange([]);
    setSelectedId(null);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await onImageUpload(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <Label className="text-sm font-semibold flex items-center gap-1.5">
          <Ruler className="w-4 h-4 text-primary" />
          Plano de Fabricación
        </Label>
        {!readOnly && (
          <div className="flex gap-1">
            <Button
              type="button"
              size="sm"
              variant={tool === "select" ? "default" : "outline"}
              onClick={() => setTool("select")}
              className="h-7 px-2 text-xs"
            >
              <MousePointer className="w-3.5 h-3.5" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant={tool === "line" ? "default" : "outline"}
              onClick={() => setTool("line")}
              className="h-7 px-2 text-xs"
              title="Línea de cota"
            >
              <Ruler className="w-3.5 h-3.5" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant={tool === "label" ? "default" : "outline"}
              onClick={() => setTool("label")}
              className="h-7 px-2 text-xs"
              title="Etiqueta de texto"
            >
              <Type className="w-3.5 h-3.5" />
            </Button>
            {selectedId && (
              <Button type="button" size="sm" variant="outline" onClick={deleteSelected} className="h-7 px-2 text-xs text-destructive">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
            {annotations.length > 0 && (
              <Button type="button" size="sm" variant="outline" onClick={clearAll} className="h-7 px-2 text-xs text-muted-foreground">
                <RotateCcw className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        )}
      </div>

      <div ref={containerRef} className="relative rounded-xl overflow-hidden border border-border/30 bg-muted/10">
        {!imageUrl ? (
          <div
            className="flex flex-col items-center justify-center gap-3 py-16 cursor-pointer hover:bg-muted/20 transition-colors"
            onClick={() => !readOnly && fileInputRef.current?.click()}
          >
            <Upload className="w-10 h-10 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Subir imagen del diseño</p>
            <p className="text-xs text-muted-foreground/60">JPG, PNG o WebP</p>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            width={canvasSize.w * 2}
            height={canvasSize.h * 2}
            style={{ width: canvasSize.w, height: canvasSize.h, cursor: tool === "line" ? "crosshair" : tool === "label" ? "text" : "default" }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onDoubleClick={handleDoubleClick}
          />
        )}

        {/* Inline label editor */}
        {editingLabel && (
          <div className="absolute bottom-3 left-3 right-3 flex gap-2">
            <Input
              autoFocus
              value={labelText}
              onChange={(e) => setLabelText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") confirmLabel(); if (e.key === "Escape") setEditingLabel(null); }}
              placeholder='Ej: L = 2.40m'
              className="h-8 text-xs bg-background/90 backdrop-blur border-primary/30"
            />
            <Button type="button" size="sm" onClick={confirmLabel} className="h-8 px-3 text-xs">OK</Button>
          </div>
        )}
      </div>

      {/* Upload button when image exists */}
      {imageUrl && !readOnly && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="text-xs h-7"
        >
          <Upload className="w-3.5 h-3.5 mr-1" /> Cambiar imagen
        </Button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Annotations summary */}
      {annotations.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {annotations.filter(a => a.text).map(a => (
            <span
              key={a.id}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono border cursor-pointer transition-colors ${
                a.id === selectedId
                  ? "bg-primary/20 text-primary border-primary/30"
                  : "bg-muted/20 text-muted-foreground border-border/20 hover:border-primary/20"
              }`}
              onClick={() => setSelectedId(a.id)}
            >
              {a.type === "line" ? <Ruler className="w-3 h-3" /> : <Type className="w-3 h-3" />}
              {a.text}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

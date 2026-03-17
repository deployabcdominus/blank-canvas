import jsPDF from "jspdf";

interface PdfWorkOrder {
  id: string;
  client: string;
  project: string;
  status: string;
  priority: string;
  progress: number;
  estimatedDelivery?: string | null;
  startDate?: string;
  notes?: string | null;
  assignedOperator?: string | null;
  installerCompany?: string | null;
  blueprintUrl?: string | null;
  materials: Array<{ item: string; quantity: string; measures?: string; status?: string }>;
  technicalDetails?: Record<string, string | number | undefined>;
}

const VIOLET = [124, 58, 237]; // hsl(263 70% 58%) ≈ rgb
const DARK_TEXT: [number, number, number] = [30, 30, 30];
const MID_TEXT: [number, number, number] = [100, 100, 100];
const LIGHT_LINE: [number, number, number] = [200, 200, 210];
const SECTION_BG: [number, number, number] = [245, 243, 255]; // very light violet

function drawSectionTitle(doc: jsPDF, title: string, x: number, y: number): number {
  doc.setFillColor(...SECTION_BG);
  doc.roundedRect(x, y, 160, 7, 1, 1, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...(VIOLET as [number, number, number]));
  doc.text(title.toUpperCase(), x + 3, y + 5);
  doc.setTextColor(...DARK_TEXT);
  return y + 10;
}

function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

export async function generateProductionPDF(order: PdfWorkOrder): Promise<void> {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageW = 297;
  const pageH = 210;
  const margin = 12;
  const contentW = pageW - margin * 2;

  // ── White background ──
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageW, pageH, "F");

  // ── HEADER ──
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...DARK_TEXT);
  doc.text(order.client || "Sin Cliente", margin, margin + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MID_TEXT);
  doc.text(order.project || "Sin descripción", margin, margin + 12);

  // Right side: Order ID, dates, status
  const rightX = pageW - margin;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...(VIOLET as [number, number, number]));
  doc.text(`ORDEN #${order.id.slice(0, 8).toUpperCase()}`, rightX, margin + 4, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MID_TEXT);
  const deliveryText = order.estimatedDelivery
    ? `Entrega: ${order.estimatedDelivery}`
    : "Sin fecha de entrega";
  doc.text(deliveryText, rightX, margin + 9, { align: "right" });
  doc.text(`Estado: ${order.status} | Prioridad: ${order.priority} | Progreso: ${order.progress}%`, rightX, margin + 14, { align: "right" });

  if (order.assignedOperator) {
    doc.text(`Operario: ${order.assignedOperator}`, rightX, margin + 19, { align: "right" });
  }
  if (order.installerCompany) {
    doc.text(`Subcontratista: ${order.installerCompany}`, rightX, margin + 24, { align: "right" });
  }

  // Separator line
  const sepY = margin + 28;
  doc.setDrawColor(...LIGHT_LINE);
  doc.setLineWidth(0.3);
  doc.line(margin, sepY, pageW - margin, sepY);

  // ── BODY SPLIT: Left 60% | Right 40% ──
  const bodyY = sepY + 4;
  const leftW = contentW * 0.58;
  const rightW = contentW * 0.40;
  const rightStartX = margin + leftW + contentW * 0.02;

  // ── LEFT: Technical Details + Materials Table ──
  let curY = bodyY;

  // Technical details
  const techEntries = Object.entries(order.technicalDetails || {}).filter(
    ([k, v]) => v !== undefined && v !== "" && k !== "installerNotes"
  );
  if (techEntries.length > 0) {
    curY = drawSectionTitle(doc, "Especificaciones Técnicas", margin, curY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...DARK_TEXT);
    techEntries.forEach(([key, val]) => {
      const label = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      doc.setFont("helvetica", "bold");
      doc.text(`${label}:`, margin + 2, curY + 3);
      doc.setFont("helvetica", "normal");
      doc.text(String(val), margin + 40, curY + 3);
      curY += 5;
    });
    curY += 3;
  }

  // Materials table
  curY = drawSectionTitle(doc, "Materiales de Producción", margin, curY);

  const colWidths = [leftW * 0.50, leftW * 0.15, leftW * 0.20, leftW * 0.15];
  const headers = ["Material", "Cant.", "Medidas", "Estado"];

  // Table header
  doc.setFillColor(...SECTION_BG);
  doc.rect(margin, curY, leftW, 6, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...(VIOLET as [number, number, number]));
  let colX = margin + 2;
  headers.forEach((h, i) => {
    doc.text(h, colX, curY + 4);
    colX += colWidths[i];
  });
  curY += 7;

  // Table rows
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...DARK_TEXT);

  const mats = order.materials.filter((m) => m.item?.trim());
  if (mats.length === 0) {
    doc.setTextColor(...MID_TEXT);
    doc.text("Sin materiales registrados", margin + 2, curY + 4);
    curY += 8;
  } else {
    mats.forEach((mat, i) => {
      if (i % 2 === 0) {
        doc.setFillColor(250, 250, 252);
        doc.rect(margin, curY, leftW, 6, "F");
      }
      doc.setDrawColor(...LIGHT_LINE);
      doc.setLineWidth(0.1);
      doc.line(margin, curY + 6, margin + leftW, curY + 6);

      colX = margin + 2;
      doc.setTextColor(...DARK_TEXT);
      doc.text((mat.item || "—").substring(0, 35), colX, curY + 4);
      colX += colWidths[0];
      doc.text(String(mat.quantity || "—"), colX, curY + 4);
      colX += colWidths[1];
      doc.text((mat.measures || "—").substring(0, 15), colX, curY + 4);
      colX += colWidths[2];
      doc.text((mat.status || "pendiente").substring(0, 12), colX, curY + 4);
      curY += 6;
    });
  }
  curY += 4;

  // Notes section
  if (order.notes) {
    curY = drawSectionTitle(doc, "Notas Internas", margin, curY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MID_TEXT);
    const noteLines = doc.splitTextToSize(order.notes, leftW - 4);
    doc.text(noteLines, margin + 2, curY + 4);
    curY += noteLines.length * 4 + 4;
  }

  // ── RIGHT: Blueprint Image ──
  let blueprintImg: HTMLImageElement | null = null;
  if (order.blueprintUrl) {
    blueprintImg = await loadImage(order.blueprintUrl);
  }

  let bpY = bodyY;
  bpY = drawSectionTitle(doc, "Plano de Fabricación", rightStartX, bpY);

  if (blueprintImg) {
    const maxW = rightW;
    const maxH = pageH - bpY - 40; // leave room for footer
    const ratio = Math.min(maxW / blueprintImg.naturalWidth, maxH / blueprintImg.naturalHeight);
    const imgW = blueprintImg.naturalWidth * ratio;
    const imgH = blueprintImg.naturalHeight * ratio;

    // Border frame
    doc.setDrawColor(...LIGHT_LINE);
    doc.setLineWidth(0.3);
    doc.rect(rightStartX, bpY, imgW, imgH);

    doc.addImage(blueprintImg, "PNG", rightStartX, bpY, imgW, imgH);
    bpY += imgH + 4;
  } else {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(...MID_TEXT);
    doc.text("Sin plano de fabricación adjunto", rightStartX + 2, bpY + 6);
    bpY += 12;
  }

  // ── FOOTER: Signature lines ──
  const footerY = pageH - 22;
  doc.setDrawColor(...LIGHT_LINE);
  doc.setLineWidth(0.2);
  doc.line(margin, footerY - 4, pageW - margin, footerY - 4);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...MID_TEXT);

  // Operator signature
  const sigW = 70;
  doc.line(margin, footerY + 8, margin + sigW, footerY + 8);
  doc.text("Firma de Operario", margin, footerY + 12);
  doc.text("Nombre: _______________________", margin, footerY + 16);

  // QC signature
  const qcX = margin + sigW + 20;
  doc.line(qcX, footerY + 8, qcX + sigW, footerY + 8);
  doc.text("Control de Calidad", qcX, footerY + 12);
  doc.text("Nombre: _______________________", qcX, footerY + 16);

  // Date
  const dateX = pageW - margin;
  doc.text(`Generado: ${new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}`, dateX, footerY + 16, { align: "right" });

  // ── Download ──
  const filename = `Hoja_Produccion_${(order.client || "orden").replace(/\s+/g, "_")}_${order.id.slice(0, 8)}.pdf`;
  doc.save(filename);
}

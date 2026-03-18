import jsPDF from "jspdf";

/* ── Types ── */

interface StaffEntry {
  user_id: string | null;
  name: string;
  is_verified: boolean;
  status: string;
}

interface PdfData {
  woNumber: string;
  client: string;
  project: string;
  status: string;
  progress: number;
  createdAt?: string;
  estimatedDelivery?: string | null;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  siteAddress: string;
  materialSpecs: Record<string, string>;
  staff: Record<string, StaffEntry>;
  qcChecklist: Record<string, boolean | string | null>;
  blueprintUrl: string | null;
  annotations: Array<{ text?: string }>;
  companyName?: string;
  companyLogoUrl?: string | null;
}

/* ── Color Palette ── */
const INK: [number, number, number] = [20, 20, 30];
const GRAY: [number, number, number] = [100, 100, 105];
const LIGHT: [number, number, number] = [180, 180, 190];
const LINE: [number, number, number] = [200, 200, 210];
const ACCENT: [number, number, number] = [124, 58, 237];
const BG_SECTION: [number, number, number] = [245, 243, 255];
const WHITE: [number, number, number] = [255, 255, 255];
const GREEN: [number, number, number] = [22, 163, 74];

/* ── Helpers ── */
function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

function sectionHeader(doc: jsPDF, text: string, x: number, y: number, w: number): number {
  doc.setFillColor(...BG_SECTION);
  doc.roundedRect(x, y, w, 5.5, 0.8, 0.8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(...ACCENT);
  doc.text(text.toUpperCase(), x + 2, y + 3.8);
  doc.setTextColor(...INK);
  return y + 7;
}

function kvRow(doc: jsPDF, label: string, value: string, x: number, y: number, labelW = 22): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(...GRAY);
  doc.text(label, x, y);
  doc.setFont("courier", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...INK);
  doc.text((value || "—").substring(0, 55), x + labelW, y);
  return y + 4;
}

function thinLine(doc: jsPDF, x1: number, y1: number, x2: number, y2: number) {
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.15);
  doc.line(x1, y1, x2, y2);
}

/* ── Main Export ── */
export async function generateProductionSheetPDF(data: PdfData): Promise<void> {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const W = 297, H = 210;
  const mx = 8, my = 7;
  const cw = W - mx * 2;

  // White canvas
  doc.setFillColor(...WHITE);
  doc.rect(0, 0, W, H, "F");

  // ═══════════════════════════════════════════
  // HEADER
  // ═══════════════════════════════════════════

  // Left: Company logo or name
  let logoImg: HTMLImageElement | null = null;
  if (data.companyLogoUrl) logoImg = await loadImage(data.companyLogoUrl);

  if (logoImg) {
    const ratio = Math.min(45 / logoImg.naturalWidth, 10 / logoImg.naturalHeight);
    const lw = logoImg.naturalWidth * ratio;
    const lh = logoImg.naturalHeight * ratio;
    doc.addImage(logoImg, "PNG", mx, my, lw, lh);
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...INK);
    doc.text(data.companyName || "MY COMPANY", mx, my + 4);
  }

  // Center: Title block
  const cx = W / 2;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...INK);
  doc.text("WORK ORDER", cx, my + 4, { align: "center" });
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text("PRODUCTION SHEET", cx, my + 8, { align: "center" });

  // WO number in mono
  doc.setFont("courier", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...ACCENT);
  doc.text(data.woNumber, cx, my + 12.5, { align: "center" });

  // Project name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...INK);
  doc.text((data.project || "—").substring(0, 50), cx, my + 17, { align: "center" });

  // Right: Status badge (ink-saving: border only)
  const rx = W - mx;
  const statusText = data.status.toUpperCase();
  const stW = doc.getTextWidth(statusText) + 8;
  doc.setDrawColor(...GRAY);
  doc.setLineWidth(0.4);
  doc.roundedRect(rx - stW - 2, my, stW + 2, 6, 1.2, 1.2);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(...INK);
  doc.text(statusText, rx - stW / 2 - 1, my + 4, { align: "center" });

  // Dates
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...GRAY);
  doc.text(`Created: ${data.createdAt || "—"}`, rx, my + 10, { align: "right" });
  doc.text(`Install: ${data.estimatedDelivery || "—"}`, rx, my + 14, { align: "right" });
  doc.text(`Progress: ${data.progress}%`, rx, my + 18, { align: "right" });

  // Separator line
  const sepY = my + 21;
  doc.setFillColor(...ACCENT);
  doc.rect(mx, sepY, cw, 0.6, "F");

  // ═══════════════════════════════════════════
  // BODY: Blueprint (left 65%) | Data (right 35%)
  // ═══════════════════════════════════════════
  const bodyY = sepY + 3;
  const leftW = cw * 0.63;
  const gap = 4;
  const rightX = mx + leftW + gap;
  const rightW = cw - leftW - gap;

  // ── Blueprint Area ──
  let bpImg: HTMLImageElement | null = null;
  if (data.blueprintUrl) bpImg = await loadImage(data.blueprintUrl);

  const bpH = 82;
  // Frame
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.3);
  doc.rect(mx, bodyY, leftW, bpH);

  if (bpImg) {
    const ratio = Math.min((leftW - 4) / bpImg.naturalWidth, (bpH - 4) / bpImg.naturalHeight);
    const iw = bpImg.naturalWidth * ratio;
    const ih = bpImg.naturalHeight * ratio;
    const ix = mx + (leftW - iw) / 2;
    const iy = bodyY + (bpH - ih) / 2;
    doc.addImage(bpImg, "PNG", ix, iy, iw, ih);
  } else {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(...LIGHT);
    doc.text("DISEÑO PENDIENTE DE CARGA", mx + leftW / 2, bodyY + bpH / 2 - 2, { align: "center" });
    doc.setFontSize(7);
    doc.text("Upload a technical drawing to display here", mx + leftW / 2, bodyY + bpH / 2 + 3, { align: "center" });
  }

  // Annotation tags below blueprint
  const annTexts = (data.annotations || []).filter(a => a.text).map(a => a.text!);
  if (annTexts.length > 0) {
    let ax = mx;
    const annY = bodyY + bpH + 1.5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(5.5);
    annTexts.forEach(txt => {
      const tw = doc.getTextWidth(txt) + 4;
      doc.setFillColor(...ACCENT);
      doc.roundedRect(ax, annY, tw, 3.5, 0.5, 0.5, "F");
      doc.setTextColor(...WHITE);
      doc.text(txt, ax + 2, annY + 2.5);
      ax += tw + 1.5;
    });
  }

  // ── Right Panel: Project Details + Materials ──
  let ry = bodyY;

  // Project Details
  ry = sectionHeader(doc, "Project Details", rightX, ry, rightW);
  ry = kvRow(doc, "Client:", data.client, rightX + 2, ry);
  ry = kvRow(doc, "Site:", data.siteAddress, rightX + 2, ry);
  ry = kvRow(doc, "Contact:", data.contactName, rightX + 2, ry);
  ry = kvRow(doc, "Phone:", data.contactPhone, rightX + 2, ry);
  ry = kvRow(doc, "Email:", data.contactEmail, rightX + 2, ry);
  ry += 2;

  // Technical Specs / Materials
  ry = sectionHeader(doc, "Technical Specifications / Materials", rightX, ry, rightW);
  const matFields = [
    { label: "FACE:", key: "face_material_spec" },
    { label: "RETURNS:", key: "returns_material_spec" },
    { label: "BACKS:", key: "backs_material_spec" },
    { label: "TRIM CAP:", key: "trim_cap_spec" },
    { label: "LEDs:", key: "led_mfg_spec" },
    { label: "PWR SUPPLY:", key: "power_supply_spec" },
  ];
  matFields.forEach(f => {
    ry = kvRow(doc, f.label, data.materialSpecs[f.key] || "", rightX + 2, ry, 24);
  });

  // ═══════════════════════════════════════════
  // BOTTOM GRID: Staff (left 50%) | QC (right 50%)
  // ═══════════════════════════════════════════
  const gridY = Math.max(bodyY + bpH + 8, ry + 4);
  const halfW = cw / 2 - 2;

  // ── Responsible Staff ──
  let sy = sectionHeader(doc, "Responsible Staff", mx, gridY, halfW);
  const staffRoles = [
    { key: "pm", label: "Project Manager" },
    { key: "cnc", label: "CNC Cutting" },
    { key: "fabrication", label: "Fabrication" },
    { key: "wiring", label: "Wiring / LEDs" },
    { key: "qc", label: "Quality Control" },
  ];

  // Column headers
  doc.setFont("helvetica", "bold");
  doc.setFontSize(5.5);
  doc.setTextColor(...GRAY);
  doc.text("ROLE", mx + 2, sy);
  doc.text("ASSIGNED", mx + 30, sy);
  doc.text("STATUS", mx + 68, sy);
  doc.text("✓", mx + 88, sy);
  thinLine(doc, mx, sy + 1.5, mx + halfW, sy + 1.5);
  sy += 3.5;

  staffRoles.forEach(r => {
    const entry = (data.staff as any)[r.key] as StaffEntry | undefined;
    const name = entry?.name || "—";
    const status = entry?.status || "pending";
    const verified = entry?.is_verified ? "☑" : "☐";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...INK);
    doc.text(r.label, mx + 2, sy);
    doc.setFont("courier", "normal");
    doc.text(name.substring(0, 18), mx + 30, sy);
    doc.setFont("helvetica", "normal");
    const statusColor = (status === "done" || status === "verified") ? GREEN : GRAY;
    doc.setTextColor(...statusColor);
    doc.text(status, mx + 68, sy);
    const verColor = entry?.is_verified ? GREEN : GRAY;
    doc.setTextColor(...verColor);
    doc.text(verified, mx + 88, sy);
    sy += 4.5;
  });

  // Signature line for staff
  sy += 2;
  thinLine(doc, mx + 2, sy, mx + 55, sy);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.5);
  doc.setTextColor(...GRAY);
  doc.text("Operator Signature", mx + 2, sy + 3);
  doc.text("Date: ___/___/______", mx + 35, sy + 3);

  // ── QC Checklist ──
  const qcX = mx + halfW + 4;
  let qy = sectionHeader(doc, "QC Checklist", qcX, gridY, halfW);

  const qcItems = [
    { key: "design_verified", label: "Design & Dimensions Verified" },
    { key: "material_specs_confirmed", label: "Material Specs Confirmed" },
    { key: "wiring_test_passed", label: "Wiring / Load Test Passed" },
    { key: "final_sign_cleaned", label: "Final Sign Cleaned & Inspected" },
  ];

  qcItems.forEach(item => {
    const checked = !!data.qcChecklist[item.key];
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    const qcColor = checked ? GREEN : INK;
    doc.setTextColor(...qcColor);
    doc.text(checked ? "☑" : "☐", qcX + 2, qy);
    doc.text(item.label, qcX + 7, qy);
    if (checked) {
      // Strikethrough
      const tw = doc.getTextWidth(item.label);
      thinLine(doc, qcX + 7, qy - 0.8, qcX + 7 + tw, qy - 0.8);
    }
    qy += 4.5;
  });

  // QC Signature
  qy += 3;
  thinLine(doc, qcX + 2, qy, qcX + 60, qy);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.5);
  doc.setTextColor(...GRAY);
  doc.text("QC Inspector: " + (data.qcChecklist.qc_signature || "________________"), qcX + 2, qy + 3);
  doc.text("Date: " + (data.qcChecklist.qc_date || "___/___/______"), qcX + 55, qy + 3);

  // All QC passed indicator
  const allPassed = qcItems.every(item => !!data.qcChecklist[item.key]);
  if (allPassed) {
    qy += 7;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...GREEN);
    doc.text("✓ ALL QC CHECKS PASSED", qcX + 2, qy);
  }

  // ═══════════════════════════════════════════
  // FOOTER
  // ═══════════════════════════════════════════
  const footY = H - 7;
  thinLine(doc, mx, footY - 3, W - mx, footY - 3);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.5);
  doc.setTextColor(...GRAY);
  doc.text(
    `Generated by Sign Flow — ${new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}`,
    mx, footY
  );
  doc.setFont("courier", "normal");
  doc.text(`CONFIDENTIAL — ${data.client}`, W - mx, footY, { align: "right" });

  // ── Save ──
  const fn = `Production_Sheet_${(data.client || "order").replace(/\s+/g, "_")}_${data.woNumber.replace(/[^a-zA-Z0-9]/g, "")}.pdf`;
  doc.save(fn);
}

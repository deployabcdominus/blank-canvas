import jsPDF from "jspdf";

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
}

const V: [number, number, number] = [124, 58, 237]; // Violet
const D: [number, number, number] = [26, 26, 46];
const M: [number, number, number] = [100, 100, 100];
const L: [number, number, number] = [220, 220, 230];
const BG: [number, number, number] = [245, 243, 255];

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
  doc.setFillColor(...BG);
  doc.roundedRect(x, y, w, 6, 1, 1, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...V);
  doc.text(text.toUpperCase(), x + 2, y + 4);
  doc.setTextColor(...D);
  return y + 8;
}

function labelValue(doc: jsPDF, label: string, value: string, x: number, y: number, labelW: number = 22): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...M);
  doc.text(label, x, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...D);
  doc.text((value || "—").substring(0, 60), x + labelW, y);
  return y + 4.5;
}

export async function generateProductionSheetPDF(data: PdfData): Promise<void> {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const W = 297, H = 210;
  const mx = 10, my = 8;
  const cw = W - mx * 2;

  // White background
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, W, H, "F");

  // ═══ HEADER ═══
  // Left: Company
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...D);
  doc.text("THE SIGN SPACE CORP.", mx, my + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...M);
  doc.text("Kendall, FL 33186 · (305) 555-0199 · info@thesignspace.com", mx, my + 10);

  // Center: Title
  const cx = W / 2;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...D);
  doc.text("WORK ORDER", cx, my + 5, { align: "center" });
  doc.setFontSize(10);
  doc.text("PRODUCTION SHEET", cx, my + 10, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...M);
  doc.text(data.woNumber, cx, my + 15, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...D);
  doc.text((data.project || "—").substring(0, 50), cx, my + 20, { align: "center" });

  // Right: Status & dates
  const rx = W - mx;
  doc.setFillColor(...V);
  doc.roundedRect(rx - 35, my, 35, 7, 1.5, 1.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text(data.status.toUpperCase(), rx - 17.5, my + 5, { align: "center" });
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...M);
  doc.text(`Created: ${data.createdAt || "—"}`, rx, my + 12, { align: "right" });
  doc.text(`Install: ${data.estimatedDelivery || "—"}`, rx, my + 16, { align: "right" });

  // Gradient separator
  const sepY = my + 24;
  doc.setFillColor(...V);
  doc.rect(mx, sepY, cw, 0.8, "F");

  // ═══ BODY ═══
  const bodyY = sepY + 3;
  const leftW = cw * 0.58;
  const rightX = mx + leftW + 4;
  const rightW = cw - leftW - 4;

  // ── Left: Blueprint ──
  let bpImg: HTMLImageElement | null = null;
  if (data.blueprintUrl) bpImg = await loadImage(data.blueprintUrl);

  const bpH = 75;
  doc.setDrawColor(...L);
  doc.setLineWidth(0.3);
  doc.rect(mx, bodyY, leftW, bpH);

  if (bpImg) {
    const ratio = Math.min(leftW / bpImg.naturalWidth, bpH / bpImg.naturalHeight);
    const iw = bpImg.naturalWidth * ratio;
    const ih = bpImg.naturalHeight * ratio;
    const ix = mx + (leftW - iw) / 2;
    const iy = bodyY + (bpH - ih) / 2;
    doc.addImage(bpImg, "PNG", ix, iy, iw, ih);
  } else {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(...M);
    doc.text("No technical drawing uploaded", mx + leftW / 2, bodyY + bpH / 2, { align: "center" });
  }

  // Annotation tags below blueprint
  const annTexts = (data.annotations || []).filter(a => a.text).map(a => a.text!);
  if (annTexts.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6);
    let ax = mx;
    const annY = bodyY + bpH + 2;
    annTexts.forEach(txt => {
      const tw = doc.getTextWidth(txt) + 4;
      doc.setFillColor(...V);
      doc.roundedRect(ax, annY, tw, 4, 0.5, 0.5, "F");
      doc.setTextColor(255, 255, 255);
      doc.text(txt, ax + 2, annY + 3);
      ax += tw + 2;
    });
  }

  // ── Right: Project details + Materials ──
  let ry = bodyY;

  // Project Details
  ry = sectionHeader(doc, "Project Details", rightX, ry, rightW);
  ry = labelValue(doc, "Client:", data.client, rightX + 2, ry);
  ry = labelValue(doc, "Site:", data.siteAddress, rightX + 2, ry);
  ry = labelValue(doc, "Contact:", data.contactName, rightX + 2, ry);
  ry = labelValue(doc, "Phone:", data.contactPhone, rightX + 2, ry);
  ry = labelValue(doc, "Email:", data.contactEmail, rightX + 2, ry);
  ry += 2;

  // Material Specs
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
    ry = labelValue(doc, f.label, data.materialSpecs[f.key] || "", rightX + 2, ry, 26);
  });

  // ═══ BOTTOM GRID: Staff + QC ═══
  const gridY = Math.max(bodyY + bpH + 10, ry + 4);
  const halfW = cw / 2 - 2;

  // Staff
  let sy = sectionHeader(doc, "Responsible Staff", mx, gridY, halfW);
  const staffRoles = [
    { key: "pm", label: "Project Manager" },
    { key: "cnc", label: "CNC Cutting" },
    { key: "fabrication", label: "Fabrication" },
    { key: "wiring", label: "Wiring / LEDs" },
    { key: "qc", label: "Quality Control" },
  ];
  staffRoles.forEach(r => {
    const entry = (data.staff as any)[r.key] as StaffEntry | undefined;
    const name = entry?.name || "—";
    const status = entry?.status || "pending";
    const verified = entry?.is_verified ? "✓" : "☐";

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...M);
    doc.text(r.label + ":", mx + 2, sy);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...D);
    doc.text(name.substring(0, 20), mx + 34, sy);
    doc.text(status, mx + 70, sy);
    doc.text(verified, mx + 90, sy);
    sy += 5;
  });

  // QC Checklist
  let qy = sectionHeader(doc, "QC Checklist", mx + halfW + 4, gridY, halfW);
  const qcX = mx + halfW + 6;
  const qcItems = [
    { key: "design_verified", label: "Design & Dimensions Verified" },
    { key: "material_specs_confirmed", label: "Material Specs Confirmed" },
    { key: "wiring_test_passed", label: "Wiring / Load Test Passed" },
    { key: "final_sign_cleaned", label: "Final Sign Cleaned & Inspected" },
  ];
  qcItems.forEach(item => {
    const checked = !!data.qcChecklist[item.key];
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(checked ? [22, 163, 74] as any : D);
    doc.text(checked ? "☑" : "☐", qcX, qy);
    doc.text(item.label, qcX + 5, qy);
    qy += 5;
  });

  // QC Signature
  qy += 2;
  doc.setDrawColor(...L);
  doc.setLineWidth(0.2);
  doc.line(qcX, qy, qcX + 60, qy);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(...M);
  doc.text("QC Signature: " + (data.qcChecklist.qc_signature || ""), qcX, qy + 3);
  doc.text("Date: " + (data.qcChecklist.qc_date || ""), qcX + 50, qy + 3);

  // ═══ FOOTER ═══
  const footY = H - 8;
  doc.setDrawColor(...L);
  doc.setLineWidth(0.2);
  doc.line(mx, footY - 3, W - mx, footY - 3);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(...M);
  doc.text(`Generated by Sign Flow — ${new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}`, mx, footY);
  doc.text(`CONFIDENTIAL — ${data.client}`, W - mx, footY, { align: "right" });

  // ── Download ──
  const fn = `Production_Sheet_${(data.client || "order").replace(/\s+/g, "_")}_${data.woNumber}.pdf`;
  doc.save(fn);
}

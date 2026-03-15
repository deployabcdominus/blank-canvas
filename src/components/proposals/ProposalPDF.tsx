import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";

const BRAND = "#E8750A";
const DARK = "#0a0a0a";
const GRAY = "#71717a";
const LIGHT = "#e4e4e7";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    padding: 40,
    backgroundColor: "#FFFFFF",
    color: "#18181b",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
    paddingBottom: 16,
    borderBottom: `2px solid ${BRAND}`,
  },
  logo: { width: 70, height: 70, objectFit: "contain", borderRadius: 8 },
  companyInfo: { alignItems: "flex-end" },
  companyName: { fontSize: 14, fontFamily: "Helvetica-Bold", color: DARK, marginBottom: 3 },
  companyDetail: { fontSize: 8, color: GRAY, marginBottom: 1 },

  heroTitle: { fontSize: 20, fontFamily: "Helvetica-Bold", color: DARK, marginBottom: 4 },
  heroSub: { fontSize: 10, color: GRAY, marginBottom: 20 },

  badge: {
    backgroundColor: "#FFF7ED",
    borderRadius: 6,
    padding: "4 10",
    alignSelf: "flex-start",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#fed7aa",
  },
  badgeText: { fontSize: 9, color: BRAND, fontFamily: "Helvetica-Bold", textTransform: "uppercase" },

  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: GRAY,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  table: { borderWidth: 1, borderColor: "#e4e4e7", borderRadius: 8, overflow: "hidden" },
  tableRow: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: "#f4f4f5" },
  tableLabel: { flex: 1, padding: "8 12", color: GRAY, fontSize: 9 },
  tableValue: { flex: 1, padding: "8 12", textAlign: "right", fontFamily: "Helvetica-Bold", fontSize: 9, color: DARK },

  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: BRAND,
  },
  totalLabel: { fontSize: 11, fontFamily: "Helvetica-Bold", color: DARK, marginRight: 16 },
  totalValue: { fontSize: 18, fontFamily: "Times-Bold", color: BRAND },

  notes: { backgroundColor: "#fafafa", borderRadius: 6, padding: 12, marginTop: 8, borderWidth: 1, borderColor: "#f4f4f5" },
  notesText: { fontSize: 9, color: "#3f3f46", lineHeight: 1.6 },

  mockupImage: { width: "100%", borderRadius: 8, marginBottom: 16, objectFit: "contain" },

  watermark: {
    position: "absolute",
    top: "45%",
    left: "15%",
    fontSize: 32,
    fontFamily: "Helvetica-Bold",
    color: BRAND,
    opacity: 0.06,
    transform: "rotate(-30deg)",
  },

  footer: {
    position: "absolute",
    bottom: 28,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.5,
    borderTopColor: "#e4e4e7",
    paddingTop: 8,
  },
  footerText: { fontSize: 7, color: "#a1a1aa" },
});

interface ProposalPDFProps {
  proposal: {
    client: string;
    project: string;
    value: number;
    status: string;
    description?: string;
    createdAt: string;
    sentDate?: string | null;
    approvedTotal?: number | null;
    mockupUrl?: string | null;
  };
  company: {
    name: string;
    logo_url?: string | null;
  };
}

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });

export function ProposalPDF({ proposal, company }: ProposalPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Watermark */}
        <Text style={styles.watermark}>{company.name}</Text>

        {/* Header */}
        <View style={styles.header}>
          <View>
            {company.logo_url ? (
              <Image src={company.logo_url} style={styles.logo} />
            ) : (
              <Text style={styles.companyName}>{company.name}</Text>
            )}
          </View>
          <View style={styles.companyInfo}>
            {company.logo_url && <Text style={styles.companyName}>{company.name}</Text>}
            <Text style={styles.companyDetail}>Propuesta Comercial</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.heroTitle}>{proposal.project || "Propuesta"}</Text>
        <Text style={styles.heroSub}>Preparada para {proposal.client}</Text>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>{proposal.status}</Text>
        </View>

        {/* Mockup if available */}
        {proposal.mockupUrl && (
          <Image src={proposal.mockupUrl} style={styles.mockupImage} />
        )}

        {/* Info table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información del proyecto</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Cliente</Text>
              <Text style={styles.tableValue}>{proposal.client}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Proyecto</Text>
              <Text style={styles.tableValue}>{proposal.project}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Fecha de emisión</Text>
              <Text style={styles.tableValue}>{formatDate(proposal.createdAt)}</Text>
            </View>
            {proposal.sentDate && (
              <View style={styles.tableRow}>
                <Text style={styles.tableLabel}>Fecha de envío</Text>
                <Text style={styles.tableValue}>{formatDate(proposal.sentDate)}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Total */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>
            {formatCurrency(proposal.approvedTotal ?? proposal.value)}
          </Text>
        </View>

        {/* Notes */}
        {proposal.description && !proposal.description.match(/^Propuesta creada a partir del lead:/i) && (
          <View style={[styles.section, { marginTop: 20 }]}>
            <Text style={styles.sectionTitle}>Notas y condiciones</Text>
            <View style={styles.notes}>
              <Text style={styles.notesText}>{proposal.description}</Text>
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{company.name} · Propuesta confidencial</Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) =>
              `Página ${pageNumber} de ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}

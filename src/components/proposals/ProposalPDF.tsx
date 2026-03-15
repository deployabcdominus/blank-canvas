import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";

const BRAND_ORANGE = "#E8750A";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    padding: 40,
    backgroundColor: "#FFFFFF",
    color: "#0F1523",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 32,
    paddingBottom: 20,
    borderBottom: "1px solid #E5E7EB",
  },
  logo: { width: 80, height: 80, objectFit: "contain" },
  companyInfo: { alignItems: "flex-end" },
  companyName: { fontSize: 16, fontFamily: "Helvetica-Bold", color: "#0F1523", marginBottom: 4 },
  companyDetail: { fontSize: 9, color: "#6B7699", marginBottom: 2 },
  proposalTitle: { fontSize: 22, fontFamily: "Helvetica-Bold", color: BRAND_ORANGE, marginBottom: 6 },
  proposalNumber: { fontSize: 10, color: "#6B7699", marginBottom: 24 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", color: "#0F1523", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, borderBottom: "0.5px solid #F3F4F6" },
  label: { color: "#6B7699", flex: 1 },
  value: { color: "#0F1523", fontFamily: "Helvetica-Bold", textAlign: "right" },
  totalRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 12, paddingTop: 10, borderTop: `1.5px solid ${BRAND_ORANGE}` },
  totalLabel: { fontSize: 12, fontFamily: "Helvetica-Bold", color: "#0F1523", marginRight: 16 },
  totalValue: { fontSize: 16, fontFamily: "Times-Bold", color: BRAND_ORANGE },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", borderTop: "0.5px solid #E5E7EB", paddingTop: 10 },
  footerText: { fontSize: 8, color: "#9BA8C5" },
  badge: { backgroundColor: "#FFF4EB", borderRadius: 4, padding: "3 8", alignSelf: "flex-start", marginBottom: 16 },
  badgeText: { fontSize: 9, color: BRAND_ORANGE, fontFamily: "Helvetica-Bold" },
  notes: { backgroundColor: "#FAFAFA", borderRadius: 4, padding: 12, marginTop: 8 },
  notesText: { fontSize: 9, color: "#3D4663", lineHeight: 1.5 },
  /* Amounts use serif for elegance */
  amountValue: { fontFamily: "Times-Bold", fontSize: 11, color: "#0F1523", textAlign: "right" },
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
          </View>
        </View>

        {/* Title */}
        <Text style={styles.proposalTitle}>Propuesta Comercial</Text>
        <Text style={styles.proposalNumber}>{proposal.project}</Text>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>{proposal.status.toUpperCase()}</Text>
        </View>

        {/* Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Cliente</Text>
            <Text style={styles.value}>{proposal.client}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Proyecto</Text>
            <Text style={styles.value}>{proposal.project}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Fecha de emisión</Text>
            <Text style={styles.value}>{formatDate(proposal.createdAt)}</Text>
          </View>
          {proposal.sentDate && (
            <View style={styles.row}>
              <Text style={styles.label}>Fecha de envío</Text>
              <Text style={styles.value}>{formatDate(proposal.sentDate)}</Text>
            </View>
          )}
        </View>

        {/* Total */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>
            {formatCurrency(proposal.approvedTotal ?? proposal.value)}
          </Text>
        </View>

        {/* Description / Notes */}
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
          <Text style={styles.footerText}>{company.name}</Text>
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

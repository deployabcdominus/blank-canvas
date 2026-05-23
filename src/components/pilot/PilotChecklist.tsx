import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { resolveCompanyId } from "@/lib/resolve-company";
import { useLanguage } from "@/i18n/LanguageContext";
import { Loader2 } from "lucide-react";

interface ChecklistItem {
  key: string;
  category: string;
  labelEn: string;
  labelEs: string;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  // Lead Intake
  { key: "lead_incomplete", category: "Lead Intake", labelEn: "Can create a lead with incomplete information", labelEs: "Puede crear un lead con información incompleta" },
  { key: "lead_source", category: "Lead Intake", labelEn: "Can select lead source", labelEs: "Puede seleccionar la fuente del lead" },
  { key: "lead_broker", category: "Lead Intake", labelEn: "Can add broker info", labelEs: "Puede agregar información del broker" },
  { key: "lead_salesperson", category: "Lead Intake", labelEn: "Can assign salesperson", labelEs: "Puede asignar un vendedor" },
  { key: "lead_price", category: "Lead Intake", labelEn: "Can add agreed price", labelEs: "Puede agregar el precio acordado" },
  { key: "lead_followup", category: "Lead Intake", labelEn: "Can mark follow-up required", labelEs: "Puede marcar seguimiento requerido" },
  // Proposal
  { key: "proposal_create", category: "Proposal", labelEn: "Can create proposal from lead", labelEs: "Puede crear una propuesta desde un lead" },
  { key: "proposal_sent", category: "Proposal", labelEn: "Can mark proposal sent", labelEs: "Puede marcar una propuesta como enviada" },
  { key: "proposal_method", category: "Proposal", labelEn: "Can select sent method", labelEs: "Puede seleccionar el método de envío" },
  { key: "proposal_approve", category: "Proposal", labelEn: "Can mark client approved", labelEs: "Puede marcar como aprobado por el cliente" },
  { key: "proposal_payment", category: "Proposal", labelEn: "Can approve with payment", labelEs: "Puede aprobar con pago" },
  { key: "proposal_override", category: "Proposal", labelEn: "Can approve without payment using admin override", labelEs: "Puede aprobar sin pago usando anulación de administrador" },
  // Production
  { key: "prod_generate", category: "Production", labelEn: "Can generate production order from approved proposal", labelEs: "Puede generar una orden de producción desde una propuesta aprobada" },
  { key: "prod_tech", category: "Production", labelEn: "Can edit technical details", labelEs: "Puede editar detalles técnicos" },
  { key: "prod_team", category: "Production", labelEn: "Can assign production team", labelEs: "Puede asignar el equipo de producción" },
  { key: "prod_mockup", category: "Production", labelEn: "Can upload or reference mockups", labelEs: "Puede subir o referenciar maquetas" },
  { key: "prod_print", category: "Production", labelEn: "Can print Shop Sheet", labelEs: "Puede imprimir la Hoja de Taller" },
  { key: "prod_status", category: "Production", labelEn: "Can move through production statuses", labelEs: "Puede moverse a través de los estados de producción" },
  { key: "prod_qc", category: "Production", labelEn: "Can complete QC", labelEs: "Puede completar el Control de Calidad" },
  // Installation
  { key: "inst_create", category: "Installation", labelEn: "Can create installation job from Ready for Install", labelEs: "Puede crear un trabajo de instalación desde Listo para Instalar" },
  { key: "inst_company", category: "Installation", labelEn: "Can assign installer company", labelEs: "Puede asignar la empresa instaladora" },
  { key: "inst_assign", category: "Installation", labelEn: "Can assign installer", labelEs: "Puede asignar el instalador" },
  { key: "inst_schedule", category: "Installation", labelEn: "Can schedule installation", labelEs: "Puede programar la instalación" },
  { key: "inst_photos", category: "Installation", labelEn: "Can upload before/during/final/issue photos from mobile", labelEs: "Puede subir fotos de antes/durante/final/problemas desde el móvil" },
  { key: "inst_complete", category: "Installation", labelEn: "Can mark completed pending admin review", labelEs: "Puede marcar como completado pendiente de revisión de administrador" },
  { key: "inst_admin", category: "Installation", labelEn: "Admin can approve or request follow-up", labelEs: "El administrador puede aprobar o solicitar seguimiento" },
  // Closing
  { key: "close_accept", category: "Closing", labelEn: "Can record client acceptance", labelEs: "Puede registrar la aceptación del cliente" },
  { key: "close_balance", category: "Closing", labelEn: "Can track final balance", labelEs: "Puede rastrear el saldo final" },
  { key: "close_payment", category: "Closing", labelEn: "Can mark final payment received or not required", labelEs: "Puede marcar el pago final como recibido o no requerido" },
  { key: "close_project", category: "Closing", labelEn: "Can close project", labelEs: "Puede cerrar el proyecto" },
  { key: "close_reopen", category: "Closing", labelEn: "Admin can reopen project with reason", labelEs: "El administrador puede reabrir el proyecto con una razón" },
];

export const PilotChecklist = () => {
  const { user } = useAuth();
  const { locale } = useLanguage();
  const isEn = locale === "en";
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatuses = async () => {
      if (!user) return;
      const companyId = await resolveCompanyId(user.id);
      if (!companyId) return;

      const { data, error } = await supabase
        .from("pilot_checklist")
        .select("item_key, status")
        .eq("company_id", companyId);

      if (error) console.error("Error fetching checklist:", error);
      else {
        const statusMap: Record<string, string> = {};
        data?.forEach((item) => {
          statusMap[item.item_key] = item.status;
        });
        setStatuses(statusMap);
      }
      setLoading(false);
    };

    fetchStatuses();
  }, [user]);

  const toggleStatus = async (key: string) => {
    if (!user) return;
    const companyId = await resolveCompanyId(user.id);
    if (!companyId) return;

    const currentStatus = statuses[key] || "pending";
    const newStatus = currentStatus === "completed" ? "pending" : "completed";

    const { error } = await supabase
      .from("pilot_checklist")
      .upsert({
        company_id: companyId,
        item_key: key,
        status: newStatus,
        updated_by: user.id,
      }, { onConflict: "company_id, item_key" });

    if (error) {
      console.error("Error updating checklist:", error);
    } else {
      setStatuses((prev) => ({ ...prev, [key]: newStatus }));
    }
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  const categories = Array.from(new Set(CHECKLIST_ITEMS.map((i) => i.category)));

  return (
    <div className="space-y-6">
      {categories.map((cat) => (
        <Card key={cat}>
          <CardHeader className="py-3 px-4 bg-muted/30">
            <CardTitle className="text-sm font-bold uppercase tracking-wider">{cat}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {CHECKLIST_ITEMS.filter((i) => i.category === cat).map((item) => (
                <div key={item.key} className="flex items-center space-x-3 p-4 hover:bg-muted/10 transition-colors">
                  <Checkbox
                    id={item.key}
                    checked={statuses[item.key] === "completed"}
                    onCheckedChange={() => toggleStatus(item.key)}
                  />
                  <label
                    htmlFor={item.key}
                    className={`text-sm leading-tight cursor-pointer ${statuses[item.key] === "completed" ? "text-muted-foreground line-through" : ""}`}
                  >
                    {isEn ? item.labelEn : item.labelEs}
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

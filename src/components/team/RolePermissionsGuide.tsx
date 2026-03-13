import { useState } from "react";
import { Crown, Wrench, TrendingUp, Users, Eye, ChevronDown, CheckCircle, MinusCircle, XCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type AppRole = "admin" | "sales" | "operations" | "member" | "viewer";
type PermLevel = "full" | "partial" | "none";

const ROLES = [
  {
    key: "admin" as AppRole,
    label: "Admin",
    tagline: "Control total",
    icon: Crown,
    color: "text-violet-500",
    activeBorder: "border-violet-500",
    activeBg: "bg-violet-500/10",
    description: "Acceso completo. Ve finanzas, gestiona el equipo y cambia la configuración.",
    idealFor: "Dueño, socio, director general",
    tip: "Asigna este rol solo a dueños o socios. Un Admin puede ver todos los ingresos, eliminar datos y cambiar la configuración de la empresa.",
  },
  {
    key: "sales" as AppRole,
    label: "Ventas",
    tagline: "Comercial",
    icon: TrendingUp,
    color: "text-sky-500",
    activeBorder: "border-sky-500",
    activeBg: "bg-sky-500/10",
    description: "Gestiona leads, propuestas y cobros. Sin acceso a operaciones ni equipo.",
    idealFor: "Vendedor, ejecutivo de cuenta, cotizador",
    tip: "Ideal para vendedores. Ven ingresos y propuestas pero no pueden tocar órdenes de instalación ni gestionar al equipo.",
  },
  {
    key: "operations" as AppRole,
    label: "Operaciones",
    tagline: "Campo",
    icon: Wrench,
    color: "text-amber-500",
    activeBorder: "border-amber-500",
    activeBg: "bg-amber-500/10",
    description: "Gestiona órdenes, instalaciones y subcontratistas. Sin acceso a finanzas.",
    idealFor: "Coordinador de obra, jefe de instalación",
    tip: "Para coordinadores de obra. Autonomía total en campo sin acceso a cotizaciones ni pagos.",
  },
  {
    key: "member" as AppRole,
    label: "Miembro",
    tagline: "Colaborador",
    icon: Users,
    color: "text-purple-500",
    activeBorder: "border-purple-500",
    activeBg: "bg-purple-500/10",
    description: "Acceso básico a leads, propuestas y clientes. No puede eliminar ni ver finanzas.",
    idealFor: "Asistente comercial, auxiliar de ventas",
    tip: "Para asistentes que apoyan en cotizaciones. Acceso limitado sin riesgo de borrar información clave.",
  },
  {
    key: "viewer" as AppRole,
    label: "Viewer",
    tagline: "Solo lectura",
    icon: Eye,
    color: "text-slate-400",
    activeBorder: "border-slate-400",
    activeBg: "bg-slate-400/10",
    description: "Solo puede ver órdenes e instalaciones. No puede modificar nada.",
    idealFor: "Auditor, consultor externo",
    tip: "El rol más seguro. Solo puede leer información operativa. Ideal para alguien que necesita monitorear sin alterar nada.",
  },
];

const MODULES: { label: string; perms: Record<AppRole, { note: string; level: PermLevel }> }[] = [
  {
    label: "Dashboard",
    perms: {
      admin:      { note: "Ve todas las métricas e ingresos", level: "full" },
      sales:      { note: "Ve métricas incluyendo finanzas", level: "full" },
      operations: { note: "Ve métricas operativas", level: "full" },
      member:     { note: "Ve métricas generales", level: "full" },
      viewer:     { note: "Solo lectura de métricas", level: "full" },
    },
  },
  {
    label: "Clientes",
    perms: {
      admin:      { note: "Ver, crear, editar y eliminar", level: "full" },
      sales:      { note: "Ver, crear y editar — sin eliminar", level: "partial" },
      operations: { note: "Ver, crear y editar — sin eliminar", level: "partial" },
      member:     { note: "Ver, crear y editar — sin eliminar", level: "partial" },
      viewer:     { note: "Sin acceso", level: "none" },
    },
  },
  {
    label: "Proyectos",
    perms: {
      admin:      { note: "Acceso total", level: "full" },
      sales:      { note: "Ver, crear y editar — sin eliminar", level: "partial" },
      operations: { note: "Ver, crear y editar — sin eliminar", level: "partial" },
      member:     { note: "Ver, crear y editar — sin eliminar", level: "partial" },
      viewer:     { note: "Sin acceso", level: "none" },
    },
  },
  {
    label: "Leads",
    perms: {
      admin:      { note: "Gestión completa y asignación masiva", level: "full" },
      sales:      { note: "Ver, crear, editar y asignar", level: "partial" },
      operations: { note: "Sin acceso", level: "none" },
      member:     { note: "Ver, crear, editar y convertir", level: "partial" },
      viewer:     { note: "Sin acceso", level: "none" },
    },
  },
  {
    label: "Propuestas",
    perms: {
      admin:      { note: "Acceso total", level: "full" },
      sales:      { note: "Ver, crear, editar y enviar", level: "partial" },
      operations: { note: "Sin acceso", level: "none" },
      member:     { note: "Ver, crear, editar y enviar", level: "partial" },
      viewer:     { note: "Sin acceso", level: "none" },
    },
  },
  {
    label: "Pagos",
    perms: {
      admin:      { note: "Ver, registrar y eliminar (RLS)", level: "full" },
      sales:      { note: "Ver y registrar — sin eliminar", level: "partial" },
      operations: { note: "Sin acceso", level: "none" },
      member:     { note: "Sin acceso", level: "none" },
      viewer:     { note: "Sin acceso", level: "none" },
    },
  },
  {
    label: "Órdenes de servicio",
    perms: {
      admin:      { note: "Acceso total", level: "full" },
      sales:      { note: "Sin acceso", level: "none" },
      operations: { note: "Ver, crear, editar y cerrar", level: "partial" },
      member:     { note: "Sin acceso", level: "none" },
      viewer:     { note: "Solo lectura — no puede modificar", level: "partial" },
    },
  },
  {
    label: "Subcontratistas",
    perms: {
      admin:      { note: "Acceso total", level: "full" },
      sales:      { note: "Sin acceso", level: "none" },
      operations: { note: "Ver, crear y editar — sin eliminar", level: "partial" },
      member:     { note: "Sin acceso", level: "none" },
      viewer:     { note: "Sin acceso", level: "none" },
    },
  },
  {
    label: "Gestión de equipo",
    perms: {
      admin:      { note: "Invitar, editar rol y eliminar miembros", level: "full" },
      sales:      { note: "Sin acceso", level: "none" },
      operations: { note: "Sin acceso", level: "none" },
      member:     { note: "Sin acceso", level: "none" },
      viewer:     { note: "Sin acceso", level: "none" },
    },
  },
  {
    label: "Configuración",
    perms: {
      admin:      { note: "Perfil, organización e integraciones", level: "full" },
      sales:      { note: "Solo perfil personal", level: "partial" },
      operations: { note: "Solo perfil personal", level: "partial" },
      member:     { note: "Solo perfil personal", level: "partial" },
      viewer:     { note: "Solo perfil personal", level: "partial" },
    },
  },
];

const PermBadge = ({ level }: { level: PermLevel }) => {
  if (level === "full")
    return (
      <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-full px-2.5 py-0.5">
        <CheckCircle size={11} /> Completo
      </span>
    );
  if (level === "partial")
    return (
      <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-full px-2.5 py-0.5">
        <MinusCircle size={11} /> Parcial
      </span>
    );
  return (
    <span className="flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-full px-2.5 py-0.5">
      <XCircle size={11} /> Sin acceso
    </span>
  );
};

export default function RolePermissionsGuide() {
  const [open, setOpen] = useState(false);
  const [activeRole, setActiveRole] = useState<AppRole>("admin");

  const role = ROLES.find((r) => r.key === activeRole)!;
  const RoleIcon = role.icon;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden mb-6">
      {/* Header — siempre visible, toggle al hacer click */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-muted/50 transition-colors text-left"
      >
        <div className="flex items-center gap-2.5">
          <Crown size={15} className="text-primary" />
          <span className="text-sm font-semibold text-foreground">Guía de roles y permisos</span>
          <span className="text-xs text-muted-foreground">— ¿qué puede hacer cada miembro?</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-full px-2.5 py-1">
            <AlertTriangle size={10} />
            Solo Admin puede invitar usuarios
          </span>
          <ChevronDown
            size={16}
            className={cn("text-muted-foreground transition-transform duration-200", open && "rotate-180")}
          />
        </div>
      </button>

      {/* Expandable content */}
      {open && (
        <div className="border-t border-border">
          {/* Role tabs */}
          <div className="flex gap-2 p-4 pb-0 overflow-x-auto">
            {ROLES.map((r) => {
              const Icon = r.icon;
              const isActive = activeRole === r.key;
              return (
                <button
                  key={r.key}
                  onClick={() => setActiveRole(r.key)}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-2 rounded-lg border text-sm font-medium whitespace-nowrap transition-all duration-150",
                    isActive
                      ? cn("border-2", r.activeBorder, r.activeBg, r.color)
                      : "border-border text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon size={13} />
                  {r.label}
                </button>
              );
            })}
          </div>

          {/* Content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 p-4 gap-4">
            {/* Left: module list */}
            <div className="lg:col-span-2 space-y-1">
              {MODULES.map((m) => {
                const perm = m.perms[activeRole];
                return (
                  <div
                    key={m.label}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-muted/40 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{m.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{perm.note}</p>
                    </div>
                    <PermBadge level={perm.level} />
                  </div>
                );
              })}
            </div>

            {/* Right: role detail */}
            <div className="space-y-3">
              {/* Role card */}
              <div className={cn("rounded-xl border p-4", role.activeBg, role.activeBorder, "border")}>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className={cn("p-1.5 rounded-lg bg-background/60", role.color)}>
                    <RoleIcon size={16} />
                  </div>
                  <div>
                    <p className={cn("text-sm font-bold", role.color)}>{role.label}</p>
                    <p className="text-xs text-muted-foreground">{role.tagline}</p>
                  </div>
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed">{role.description}</p>
              </div>

              {/* Ideal para */}
              <div className="rounded-lg bg-muted/50 border border-border px-3.5 py-2.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Ideal para</p>
                <p className="text-sm font-medium text-foreground">{role.idealFor}</p>
              </div>

              {/* Tip */}
              <div className="flex gap-2.5 rounded-lg bg-primary/5 border border-primary/15 px-3.5 py-3">
                <Info size={13} className="text-primary mt-0.5 flex-shrink-0" />
                <p className="text-xs text-foreground/75 leading-relaxed">{role.tip}</p>
              </div>
            </div>
          </div>

          {/* Footer legend */}
          <div className="flex items-center gap-4 px-5 py-2.5 border-t border-border bg-muted/20">
            <span className="text-xs text-muted-foreground">Leyenda:</span>
            <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400"><CheckCircle size={11} /> Completo</span>
            <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400"><MinusCircle size={11} /> Parcial</span>
            <span className="flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400"><XCircle size={11} /> Sin acceso</span>
            <span className="ml-auto text-[10px] text-muted-foreground/60 italic hidden md:block">
              Basado en ProtectedRoute + useUserRole() + RLS Supabase
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
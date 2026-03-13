import { useState } from "react";
import {
  Crown, BarChart2, Users, DollarSign, FolderOpen,
  FileText, CreditCard, ClipboardList, Wrench, Settings,
  Eye, TrendingUp, CheckCircle, XCircle, MinusCircle,
  AlertTriangle, ChevronRight, Info
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type AppRole = "admin" | "sales" | "operations" | "member" | "viewer";

type PermLevel = "full" | "partial" | "none";

interface Permission {
  action: string;
  note: string;
  level: PermLevel;
}

interface Module {
  id: string;
  icon: React.ReactNode;
  label: string;
  perms: Record<AppRole, Permission>;
}

interface RoleDef {
  key: AppRole;
  label: string;
  tagline: string;
  description: string;
  color: string;
  bgLight: string;
  bgDark: string;
  textColor: string;
  borderActive: string;
  tip: string;
  idealFor: string;
}

// ─── Data — fuente: auditoría real del código ─────────────────────────────────

const ROLES: RoleDef[] = [
  {
    key: "admin",
    label: "Admin",
    tagline: "Control total",
    description: "Acceso completo a toda la plataforma. Puede ver finanzas, gestionar el equipo y cambiar la configuración de la empresa.",
    color: "#5B6AF2",
    bgLight: "rgba(91,106,242,0.08)",
    bgDark: "rgba(91,106,242,0.15)",
    textColor: "#3D4ECC",
    borderActive: "#5B6AF2",
    tip: "Asigna este rol solo a dueños o socios. Un Admin puede ver todos los ingresos, eliminar datos y cambiar la configuración de la empresa.",
    idealFor: "Dueño, socio, director general",
  },
  {
    key: "sales",
    label: "Ventas",
    tagline: "Comercial",
    description: "Gestiona leads, propuestas y cobros. No tiene acceso a operaciones en campo ni a la configuración del equipo.",
    color: "#0EA5E9",
    bgLight: "rgba(14,165,233,0.08)",
    bgDark: "rgba(14,165,233,0.15)",
    textColor: "#0369A1",
    borderActive: "#0EA5E9",
    tip: "Ideal para vendedores y ejecutivos de cuenta. Ven ingresos y propuestas pero no pueden tocar órdenes de instalación ni al equipo.",
    idealFor: "Vendedor, ejecutivo de cuenta, cotizador",
  },
  {
    key: "operations",
    label: "Operaciones",
    tagline: "Campo y producción",
    description: "Gestiona órdenes de servicio, instalaciones y subcontratistas. No ve finanzas ni módulos comerciales.",
    color: "#D97706",
    bgLight: "rgba(217,119,6,0.08)",
    bgDark: "rgba(217,119,6,0.15)",
    textColor: "#92400E",
    borderActive: "#D97706",
    tip: "Para coordinadores de obra y jefes de instalación. Tienen autonomía total en campo sin acceso a cotizaciones ni pagos.",
    idealFor: "Coordinador de obra, jefe de instalación",
  },
  {
    key: "member",
    label: "Miembro",
    tagline: "Colaborador",
    description: "Acceso básico a leads, propuestas y clientes. Puede crear y editar, pero no eliminar ni ver finanzas.",
    color: "#7C3AED",
    bgLight: "rgba(124,58,237,0.08)",
    bgDark: "rgba(124,58,237,0.15)",
    textColor: "#5B21B6",
    borderActive: "#7C3AED",
    tip: "Útil para asistentes o colaboradores que apoyan en cotizaciones. Tienen acceso limitado sin riesgo de borrar información clave.",
    idealFor: "Asistente comercial, auxiliar de ventas",
  },
  {
    key: "viewer",
    label: "Viewer",
    tagline: "Solo lectura",
    description: "Puede ver órdenes e instalaciones pero no modificar nada. Perfecto para auditores o clientes internos.",
    color: "#6B7699",
    bgLight: "rgba(107,118,153,0.08)",
    bgDark: "rgba(107,118,153,0.15)",
    textColor: "#4B5563",
    borderActive: "#9BA8C5",
    tip: "El rol más seguro. Solo puede leer información operativa. Ideal para alguien que necesita monitorear el progreso sin poder alterar nada.",
    idealFor: "Auditor, consultor externo, supervisor externo",
  },
];

const MODULES: Module[] = [
  {
    id: "dashboard",
    icon: <BarChart2 size={15} />,
    label: "Dashboard",
    perms: {
      admin:      { action: "Acceso completo", note: "Ve todas las métricas e ingresos", level: "full" },
      sales:      { action: "Acceso completo", note: "Ve métricas incluyendo finanzas", level: "full" },
      operations: { action: "Acceso completo", note: "Ve métricas operativas", level: "full" },
      member:     { action: "Acceso completo", note: "Ve métricas generales", level: "full" },
      viewer:     { action: "Acceso completo", note: "Solo lectura de métricas", level: "full" },
    },
  },
  {
    id: "clients",
    icon: <Users size={15} />,
    label: "Clientes",
    perms: {
      admin:      { action: "Ver, crear, editar, eliminar", note: "Acceso total incluyendo eliminar", level: "full" },
      sales:      { action: "Ver, crear, editar", note: "No puede eliminar clientes", level: "partial" },
      operations: { action: "Ver, crear, editar", note: "No puede eliminar clientes", level: "partial" },
      member:     { action: "Ver, crear, editar", note: "No puede eliminar clientes", level: "partial" },
      viewer:     { action: "Sin acceso", note: "Ruta bloqueada", level: "none" },
    },
  },
  {
    id: "projects",
    icon: <FolderOpen size={15} />,
    label: "Proyectos",
    perms: {
      admin:      { action: "Ver, crear, editar, eliminar", note: "Acceso total", level: "full" },
      sales:      { action: "Ver, crear, editar", note: "No puede eliminar", level: "partial" },
      operations: { action: "Ver, crear, editar", note: "No puede eliminar", level: "partial" },
      member:     { action: "Ver, crear, editar", note: "No puede eliminar", level: "partial" },
      viewer:     { action: "Sin acceso", note: "Ruta bloqueada", level: "none" },
    },
  },
  {
    id: "leads",
    icon: <TrendingUp size={15} />,
    label: "Leads",
    perms: {
      admin:      { action: "Ver, crear, editar, eliminar, asignar", note: "Gestión completa y asignación masiva", level: "full" },
      sales:      { action: "Ver, crear, editar, asignar", note: "Puede asignar leads, no eliminar", level: "partial" },
      operations: { action: "Sin acceso", note: "Ruta bloqueada para este rol", level: "none" },
      member:     { action: "Ver, crear, editar, convertir", note: "Puede convertir leads en clientes", level: "partial" },
      viewer:     { action: "Sin acceso", note: "Ruta bloqueada", level: "none" },
    },
  },
  {
    id: "proposals",
    icon: <FileText size={15} />,
    label: "Propuestas",
    perms: {
      admin:      { action: "Ver, crear, editar, enviar, eliminar", note: "Acceso total", level: "full" },
      sales:      { action: "Ver, crear, editar, enviar", note: "No puede eliminar propuestas", level: "partial" },
      operations: { action: "Sin acceso", note: "Ruta bloqueada para este rol", level: "none" },
      member:     { action: "Ver, crear, editar, enviar", note: "No puede eliminar propuestas", level: "partial" },
      viewer:     { action: "Sin acceso", note: "Ruta bloqueada", level: "none" },
    },
  },
  {
    id: "payments",
    icon: <CreditCard size={15} />,
    label: "Pagos",
    perms: {
      admin:      { action: "Ver, registrar, eliminar", note: "Acceso total incluyendo eliminar (RLS)", level: "full" },
      sales:      { action: "Ver y registrar", note: "No puede eliminar pagos (bloqueado en RLS)", level: "partial" },
      operations: { action: "Sin acceso", note: "Ruta bloqueada para este rol", level: "none" },
      member:     { action: "Sin acceso", note: "Ruta bloqueada para este rol", level: "none" },
      viewer:     { action: "Sin acceso", note: "Ruta bloqueada", level: "none" },
    },
  },
  {
    id: "workorders",
    icon: <ClipboardList size={15} />,
    label: "Órdenes de servicio",
    perms: {
      admin:      { action: "Ver, crear, editar, cerrar, eliminar", note: "Acceso total", level: "full" },
      sales:      { action: "Sin acceso", note: "Ruta bloqueada para este rol", level: "none" },
      operations: { action: "Ver, crear, editar, cerrar", note: "No puede eliminar órdenes", level: "partial" },
      member:     { action: "Sin acceso", note: "Ruta bloqueada para este rol", level: "none" },
      viewer:     { action: "Solo lectura", note: "Ve órdenes, no puede modificar nada", level: "partial" },
    },
  },
  {
    id: "subcontractors",
    icon: <Wrench size={15} />,
    label: "Subcontratistas",
    perms: {
      admin:      { action: "Ver, crear, editar, eliminar", note: "Acceso total", level: "full" },
      sales:      { action: "Sin acceso", note: "Ruta bloqueada para este rol", level: "none" },
      operations: { action: "Ver, crear, editar", note: "No puede eliminar subcontratistas", level: "partial" },
      member:     { action: "Sin acceso", note: "Ruta bloqueada para este rol", level: "none" },
      viewer:     { action: "Sin acceso", note: "Ruta bloqueada", level: "none" },
    },
  },
  {
    id: "team",
    icon: <Users size={15} />,
    label: "Gestión de equipo",
    perms: {
      admin:      { action: "Invitar, ver, editar rol, eliminar", note: "Control total del equipo", level: "full" },
      sales:      { action: "Sin acceso", note: "Ruta bloqueada", level: "none" },
      operations: { action: "Sin acceso", note: "Ruta bloqueada", level: "none" },
      member:     { action: "Sin acceso", note: "Ruta bloqueada", level: "none" },
      viewer:     { action: "Sin acceso", note: "Ruta bloqueada", level: "none" },
    },
  },
  {
    id: "settings",
    icon: <Settings size={15} />,
    label: "Configuración",
    perms: {
      admin:      { action: "Perfil + Organización + Integraciones", note: "Acceso completo a todas las pestañas", level: "full" },
      sales:      { action: "Solo perfil personal", note: "Organización e Integraciones ocultas", level: "partial" },
      operations: { action: "Solo perfil personal", note: "Organización e Integraciones ocultas", level: "partial" },
      member:     { action: "Solo perfil personal", note: "Organización e Integraciones ocultas", level: "partial" },
      viewer:     { action: "Solo perfil personal", note: "Organización e Integraciones ocultas", level: "partial" },
    },
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const PermIcon = ({ level }: { level: PermLevel }) => {
  if (level === "full")
    return (
      <span style={{ color: "#16A34A", display: "flex", alignItems: "center" }}>
        <CheckCircle size={14} />
      </span>
    );
  if (level === "partial")
    return (
      <span style={{ color: "#D97706", display: "flex", alignItems: "center" }}>
        <MinusCircle size={14} />
      </span>
    );
  return (
    <span style={{ color: "#DC2626", display: "flex", alignItems: "center" }}>
      <XCircle size={14} />
    </span>
  );
};

const levelLabel: Record<PermLevel, string> = {
  full: "Acceso completo",
  partial: "Acceso parcial",
  none: "Sin acceso",
};

const levelColors: Record<PermLevel, { bg: string; text: string; border: string }> = {
  full:    { bg: "#F0FDF4", text: "#166534", border: "rgba(22,163,74,0.2)" },
  partial: { bg: "#FFFBEB", text: "#92400E", border: "rgba(217,119,6,0.2)" },
  none:    { bg: "#FFF1F2", text: "#9F1239", border: "rgba(220,38,38,0.15)" },
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function RolePermissionsGuide() {
  const [activeRole, setActiveRole] = useState<AppRole>("admin");
  const [hoveredModule, setHoveredModule] = useState<string | null>(null);

  const role = ROLES.find((r) => r.key === activeRole)!;
  const roleModules = MODULES.map((m) => ({
    ...m,
    perm: m.perms[activeRole],
  }));

  const counts = {
    full:    roleModules.filter((m) => m.perm.level === "full").length,
    partial: roleModules.filter((m) => m.perm.level === "partial").length,
    none:    roleModules.filter((m) => m.perm.level === "none").length,
  };

  return (
    <div
      style={{
        background: "var(--bg-surface, rgba(255,255,255,0.72))",
        borderRadius: 20,
        border: "1px solid var(--border-default, rgba(99,115,165,0.18))",
        overflow: "hidden",
        fontFamily: "var(--font-sans, system-ui, sans-serif)",
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          padding: "20px 24px 16px",
          borderBottom: "1px solid var(--border-default, rgba(99,115,165,0.12))",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: "rgba(91,106,242,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#5B6AF2",
              }}
            >
              <Crown size={14} />
            </div>
            <span
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "var(--text-primary, #0F1523)",
              }}
            >
              Roles y permisos
            </span>
          </div>
          <p
            style={{
              fontSize: 13,
              color: "var(--text-tertiary, #6B7699)",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            Selecciona un rol para ver exactamente a qué tiene acceso cada miembro de tu equipo.
          </p>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 10px",
            background: "rgba(217,119,6,0.08)",
            border: "1px solid rgba(217,119,6,0.2)",
            borderRadius: 8,
            flexShrink: 0,
          }}
        >
          <AlertTriangle size={12} style={{ color: "#D97706" }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: "#92400E" }}>
            Solo Admin puede invitar usuarios
          </span>
        </div>
      </div>

      {/* ── Role Selector ── */}
      <div
        style={{
          padding: "16px 24px",
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          gap: 8,
          borderBottom: "1px solid var(--border-default, rgba(99,115,165,0.12))",
        }}
      >
        {ROLES.map((r) => {
          const isActive = activeRole === r.key;
          return (
            <button
              key={r.key}
              onClick={() => setActiveRole(r.key)}
              style={{
                padding: "10px 8px",
                borderRadius: 12,
                border: isActive
                  ? `2px solid ${r.borderActive}`
                  : "1.5px solid var(--border-default, rgba(99,115,165,0.15))",
                background: isActive ? r.bgLight : "transparent",
                cursor: "pointer",
                transition: "all 180ms cubic-bezier(0.34,1.56,0.64,1)",
                textAlign: "center",
                transform: isActive ? "translateY(-1px)" : "none",
                boxShadow: isActive
                  ? `0 4px 16px ${r.color}22`
                  : "none",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: isActive ? `${r.color}18` : "var(--border-subtle, rgba(99,115,165,0.08))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 6px",
                  transition: "background 180ms ease",
                }}
              >
                {r.key === "admin"      && <Crown size={15} style={{ color: isActive ? r.color : "var(--text-tertiary,#6B7699)" }} />}
                {r.key === "sales"      && <TrendingUp size={15} style={{ color: isActive ? r.color : "var(--text-tertiary,#6B7699)" }} />}
                {r.key === "operations" && <Wrench size={15} style={{ color: isActive ? r.color : "var(--text-tertiary,#6B7699)" }} />}
                {r.key === "member"     && <Users size={15} style={{ color: isActive ? r.color : "var(--text-tertiary,#6B7699)" }} />}
                {r.key === "viewer"     && <Eye size={15} style={{ color: isActive ? r.color : "var(--text-tertiary,#6B7699)" }} />}
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? r.color : "var(--text-primary,#0F1523)",
                  marginBottom: 1,
                }}
              >
                {r.label}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: isActive ? r.textColor : "var(--text-tertiary,#6B7699)",
                  fontWeight: 500,
                }}
              >
                {r.tagline}
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Body ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px" }}>

        {/* Left: Module list */}
        <div
          style={{
            padding: "16px 20px",
            borderRight: "1px solid var(--border-default, rgba(99,115,165,0.12))",
          }}
        >
          {/* Summary badges */}
          <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
            {(["full","partial","none"] as PermLevel[]).map((lv) => (
              <div
                key={lv}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "3px 10px",
                  borderRadius: 20,
                  background: levelColors[lv].bg,
                  border: `1px solid ${levelColors[lv].border}`,
                }}
              >
                <PermIcon level={lv} />
                <span style={{ fontSize: 11, fontWeight: 600, color: levelColors[lv].text }}>
                  {counts[lv]} {levelLabel[lv].toLowerCase()}
                </span>
              </div>
            ))}
          </div>

          {/* Module rows */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {roleModules.map((m) => {
              const isHovered = hoveredModule === m.id;
              const lv = m.perm.level;
              const colors = levelColors[lv];
              return (
                <div
                  key={m.id}
                  onMouseEnter={() => setHoveredModule(m.id)}
                  onMouseLeave={() => setHoveredModule(null)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "9px 12px",
                    borderRadius: 10,
                    background: isHovered
                      ? "var(--bg-surface-hover, rgba(255,255,255,0.85))"
                      : "transparent",
                    border: isHovered
                      ? "1px solid var(--border-default, rgba(99,115,165,0.18))"
                      : "1px solid transparent",
                    transition: "all 150ms ease",
                    cursor: "default",
                  }}
                >
                  {/* Module icon */}
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      background: "var(--border-subtle, rgba(99,115,165,0.07))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--text-secondary, #3D4663)",
                      flexShrink: 0,
                    }}
                  >
                    {m.icon}
                  </div>

                  {/* Module label */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "var(--text-primary, #0F1523)",
                        marginBottom: 1,
                      }}
                    >
                      {m.label}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--text-tertiary, #6B7699)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {m.perm.note}
                    </div>
                  </div>

                  {/* Permission badge */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "3px 9px",
                      borderRadius: 20,
                      background: colors.bg,
                      border: `1px solid ${colors.border}`,
                      flexShrink: 0,
                    }}
                  >
                    <PermIcon level={lv} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: colors.text }}>
                      {lv === "full" ? "Completo" : lv === "partial" ? "Parcial" : "Sin acceso"}
                    </span>
                  </div>

                  <ChevronRight
                    size={13}
                    style={{
                      color: "var(--text-tertiary, #9BA8C5)",
                      opacity: isHovered ? 1 : 0,
                      transition: "opacity 150ms ease",
                      flexShrink: 0,
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Role detail */}
        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Role card */}
          <div
            style={{
              padding: 16,
              borderRadius: 14,
              background: role.bgLight,
              border: `1.5px solid ${role.color}30`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: `${role.color}20`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: role.color,
                }}
              >
                {role.key === "admin"      && <Crown size={17} />}
                {role.key === "sales"      && <TrendingUp size={17} />}
                {role.key === "operations" && <Wrench size={17} />}
                {role.key === "member"     && <Users size={17} />}
                {role.key === "viewer"     && <Eye size={17} />}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary,#0F1523)" }}>
                  {role.label}
                </div>
                <div style={{ fontSize: 11, color: role.textColor, fontWeight: 600 }}>
                  {role.tagline}
                </div>
              </div>
            </div>
            <p style={{ fontSize: 12, color: "var(--text-secondary,#3D4663)", margin: 0, lineHeight: 1.6 }}>
              {role.description}
            </p>
          </div>

          {/* Ideal para */}
          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--text-tertiary,#6B7699)",
                marginBottom: 6,
              }}
            >
              Ideal para
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--text-primary,#0F1523)",
                fontWeight: 500,
                padding: "8px 12px",
                background: "var(--bg-base, rgba(240,243,255,0.6))",
                borderRadius: 8,
                border: "1px solid var(--border-subtle, rgba(99,115,165,0.1))",
              }}
            >
              {role.idealFor}
            </div>
          </div>

          {/* Access summary */}
          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--text-tertiary,#6B7699)",
                marginBottom: 8,
              }}
            >
              Resumen de acceso
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {(["full","partial","none"] as PermLevel[]).map((lv) => {
                const mods = roleModules.filter((m) => m.perm.level === lv);
                if (!mods.length) return null;
                const colors = levelColors[lv];
                return (
                  <div
                    key={lv}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 8,
                      background: colors.bg,
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        marginBottom: 4,
                      }}
                    >
                      <PermIcon level={lv} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: colors.text }}>
                        {levelLabel[lv]}
                      </span>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {mods.map((m) => (
                        <span
                          key={m.id}
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            padding: "2px 7px",
                            borderRadius: 20,
                            background: `${colors.text}15`,
                            color: colors.text,
                          }}
                        >
                          {m.label}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tip */}
          <div
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              background: "rgba(91,106,242,0.06)",
              border: "1px solid rgba(91,106,242,0.15)",
              display: "flex",
              gap: 8,
              alignItems: "flex-start",
              marginTop: "auto",
            }}
          >
            <Info size={13} style={{ color: "#5B6AF2", marginTop: 1, flexShrink: 0 }} />
            <p style={{ fontSize: 11, color: "var(--text-secondary,#3D4663)", margin: 0, lineHeight: 1.6 }}>
              {role.tip}
            </p>
          </div>
        </div>
      </div>

      {/* ── Footer legend ── */}
      <div
        style={{
          padding: "10px 24px",
          borderTop: "1px solid var(--border-default, rgba(99,115,165,0.12))",
          display: "flex",
          gap: 20,
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 11, color: "var(--text-tertiary,#9BA8C5)", fontWeight: 500 }}>
          Leyenda:
        </span>
        {(["full","partial","none"] as PermLevel[]).map((lv) => (
          <div key={lv} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <PermIcon level={lv} />
            <span style={{ fontSize: 11, color: "var(--text-secondary,#6B7699)" }}>
              {levelLabel[lv]}
            </span>
          </div>
        ))}
        <span
          style={{
            marginLeft: "auto",
            fontSize: 10,
            color: "var(--text-tertiary,#9BA8C5)",
            fontStyle: "italic",
          }}
        >
          Basado en ProtectedRoute + useUserRole() + RLS de Supabase
        </span>
      </div>
    </div>
  );
}
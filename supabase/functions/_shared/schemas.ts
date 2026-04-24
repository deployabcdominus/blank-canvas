import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

/**
 * Sanitiza un string eliminando etiquetas HTML y scripts
 */
const sanitizeString = (val: string) => {
  if (!val) return val;
  return val
    .replace(/<[^>]*>?/gm, "") // Eliminar etiquetas HTML
    .trim();
};

export const SanitizedString = z.string().transform(sanitizeString);

export const UserRoleSchema = z.enum(["superadmin", "admin", "operations", "installer", "viewer"]);

export const CreateUserSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  fullName: SanitizedString.pipe(z.string().min(2, "Nombre demasiado corto")),
  companyId: z.string().uuid("ID de empresa inválido"),
  role: UserRoleSchema,
});

export const ManageUserSchema = z.object({
  action: z.enum([
    "create",
    "update-role",
    "toggle-active",
    "bulk-activate-users",
    "bulk-deactivate-users",
    "bulk-update-role",
    "bulk-assign-company",
    "bulk-remove-company",
    "list-company-users",
    "list-all-users",
    "delete-company",
    "remove-from-company",
    "reset-password",
    "delete-user",
  ]),
  userId: z.string().uuid().optional(),
  userIds: z.array(z.string().uuid()).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  fullName: SanitizedString.pipe(z.string().min(2)).optional(),
  companyId: z.string().uuid().optional(),
  role: UserRoleSchema.optional(),
});

export const EmailPayloadSchema = z.object({
  type: z.enum(["invitation", "order_status", "proposal_sent"]),
  to: z.string().email("Destinatario inválido"),
  data: z.record(z.string(), z.string().or(z.number())),
});

export const AiBriefingSchema = z.object({
  businessData: z.record(z.string(), z.any()),
});

export const ApproveProposalSchema = z.object({
  approvalToken: z.string().min(1, "Token es requerido"),
  signerName: SanitizedString.pipe(z.string().min(1, "Nombre del firmante es requerido")),
  signatureData: z.string().optional().nullable(),
});

export const AcceptInvitationSchema = z.object({
  invitationId: z.string().uuid("ID de invitación inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  fullName: SanitizedString.pipe(z.string().min(2, "Nombre demasiado corto")),
});

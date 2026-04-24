import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

export const UserRoleSchema = z.enum(["superadmin", "admin", "operations", "installer", "viewer"]);

export const CreateUserSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  fullName: z.string().min(2, "Nombre demasiado corto"),
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
  fullName: z.string().min(2).optional(),
  companyId: z.string().uuid().optional(),
  role: UserRoleSchema.optional(),
});

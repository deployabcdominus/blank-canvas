/**
 * Zod schemas for data validation
 */
import { z } from 'zod';

// Lead Schema
export const leadSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Nome é obrigatório"),
  company: z.string().min(1, "Empresa é obrigatória"),
  service: z.string().min(1, "Serviço é obrigatório"),
  status: z.string().min(1, "Status é obrigatório"),
  contact: z.object({
    phone: z.string().min(1, "Telefone é obrigatório"),
    email: z.string().email("Email inválido"),
    location: z.string().min(1, "Localização é obrigatória"),
  }),
  value: z.string(),
  daysAgo: z.number(),
  website: z.string().optional(),
});

export type Lead = z.infer<typeof leadSchema>;

// Proposal Schema
export const proposalSchema = z.object({
  id: z.number(),
  client: z.string().min(1, "Cliente é obrigatório"),
  company: z.string().min(1, "Empresa é obrigatória"),
  project: z.string().min(1, "Projeto é obrigatório"),
  value: z.string(),
  description: z.string(),
  status: z.string(),
  date: z.string(),
});

export type Proposal = z.infer<typeof proposalSchema>;

// Production Order Schema
export const productionOrderSchema = z.object({
  id: z.number(),
  client: z.string().min(1, "Cliente é obrigatório"),
  project: z.string().min(1, "Projeto é obrigatório"),
  status: z.string(),
  progress: z.number().min(0).max(100),
  materials: z.array(z.string()),
  startDate: z.string(),
  estimatedCompletion: z.string(),
});

export type ProductionOrder = z.infer<typeof productionOrderSchema>;

// Installer Company Schema
export const installerCompanySchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Nome é obrigatório"),
  contact: z.object({
    phone: z.string(),
    email: z.string().email("Email inválido").optional().or(z.literal('')),
    address: z.string(),
  }),
  logo: z.string().optional(),
});

export type InstallerCompany = z.infer<typeof installerCompanySchema>;

// Team Schema
export const permissionFlagsSchema = z.object({
  viewLeads: z.boolean(),
  editLeads: z.boolean(),
  viewProposals: z.boolean(),
  editProposals: z.boolean(),
  viewProduction: z.boolean(),
  editProduction: z.boolean(),
  viewInstallation: z.boolean(),
  editInstallation: z.boolean(),
  manageTeam: z.boolean(),
});

export const roleSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string(),
  permissions: permissionFlagsSchema,
});

export const teamMemberSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Nome é obrigatório"),
  roleId: z.number(),
  installerCompanyId: z.number().nullable(),
  contact: z.object({
    phone: z.string(),
    email: z.string().email("Email inválido").optional().or(z.literal('')),
  }),
  avatar: z.string().optional(),
});

export const installationSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Nome é obrigatório"),
  client: z.string(),
  location: z.string(),
  scheduledDate: z.string(),
  status: z.string(),
  productionOrderId: z.number().nullable(),
});

export const allocationSchema = z.object({
  id: z.number(),
  memberId: z.number(),
  installationId: z.number(),
});

// Settings Schema
export const settingsSchema = z.object({
  appName: z.string().min(1, "Nome da aplicação é obrigatório"),
  appTagline: z.string(),
  theme: z.enum(['light', 'dark']),
  glassEffect: z.boolean(),
  brandLogo: z.string().optional(),
});

export type AppSettings = z.infer<typeof settingsSchema>;

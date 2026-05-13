import { z } from "zod";

const requiredText = z.string().trim().min(1, "Campo obrigatório");
const configurableSeconds = z.coerce
  .number()
  .int("Informe um número inteiro")
  .min(1, "Informe pelo menos 1 segundo")
  .max(60, "Informe no máximo 60 segundos");

export const settingsSchema = z.object({
  homeTitle: requiredText,
  homeSubtitle: requiredText,
  aboutTitle: requiredText,
  aboutText: requiredText,
  primaryButtonLabel: requiredText,
  primaryButtonHref: requiredText,
  secondaryButtonLabel: requiredText,
  secondaryButtonHref: requiredText,
  homeCarouselIntervalSeconds: configurableSeconds.default(5),
});

export const contactSchema = z.object({
  phone: requiredText,
  whatsapp: requiredText,
  instagram: requiredText,
  email: z.string().trim().email("E-mail inválido"),
});

export const empreendimentoSchema = z.object({
  name: requiredText,
  slug: requiredText.regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífen"),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  shortDescription: requiredText,
  fullDescription: requiredText,
  conceptText: z.string().trim().optional().nullable(),
  commercialCalls: z.array(requiredText).default([]),
  technicalInfo: z.array(requiredText).default([]),
  institutionalTexts: z.array(requiredText).default([]),
  keyHighlights: z.array(requiredText).default([]),
  convenienceItems: z.array(requiredText).default([]),
  seoTitle: z.string().trim().max(120).optional().nullable(),
  seoDescription: z.string().trim().max(220).optional().nullable(),
  location: requiredText,
  logoPath: z.string().trim().optional().nullable(),
  logoDisplayDurationSeconds: configurableSeconds.default(3),
  coverImagePath: z.string().trim().optional().nullable(),
  pdfPath: z.string().trim().optional().nullable(),
  differentials: z.array(requiredText).default([]),
});

export const userSchema = z.object({
  name: requiredText,
  email: z.string().trim().email(),
  password: z.string().min(6).optional(),
  role: z.enum(["ADMIN", "EDITOR", "VISUALIZADOR"]),
  isActive: z.boolean().default(true),
});

export const imageKindSchema = z.enum(["GALLERY", "FLOOR_PLAN"]);

export const imageMetadataSchema = z.object({
  title: requiredText,
  caption: z.string().trim().optional().nullable(),
  altText: z.string().trim().optional().nullable(),
});

export const reorderImagesSchema = z.object({
  imageIds: z.array(z.string().trim().min(1)).min(1),
  kind: imageKindSchema.optional(),
});

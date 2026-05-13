import path from "path";
import { promises as fs } from "fs";
import crypto from "crypto";

function normalizeSegment(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_\s]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();
}

export function normalizeSlug(value: string) {
  return normalizeSegment(value);
}

type SaveUploadedFileOptions = {
  baseFolder?: "uploads" | "brand";
};

export async function saveUploadedFile(
  file: File,
  targetFolders: string[],
  options?: SaveUploadedFileOptions,
) {
  const baseFolder = options?.baseFolder ?? "uploads";
  const ext = path.extname(file.name || "") || ".bin";
  const base = normalizeSegment(path.basename(file.name || "arquivo", ext)) || "arquivo";
  const fileName = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${base}${ext.toLowerCase()}`;

  const safeFolders = targetFolders.map((folder) => normalizeSegment(folder));
  const relativeFolder = path.posix.join(baseFolder, ...safeFolders);
  const absoluteFolder = path.join(process.cwd(), "public", ...relativeFolder.split("/"));

  await fs.mkdir(absoluteFolder, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  const absolutePath = path.join(absoluteFolder, fileName);
  await fs.writeFile(absolutePath, buffer);

  return `/${path.posix.join(relativeFolder, fileName)}`;
}

export async function deletePublicFile(relativePath: string | null | undefined) {
  if (!relativePath) {
    return;
  }

  const isUploadAsset = relativePath.startsWith("/uploads/");
  const isEmpreendimentoBrandAsset = relativePath.startsWith("/brand/empreendimentos/");

  if (!isUploadAsset && !isEmpreendimentoBrandAsset) {
    return;
  }

  const absolutePath = path.join(process.cwd(), "public", ...relativePath.replace(/^\//, "").split("/"));

  try {
    await fs.unlink(absolutePath);
  } catch {
    // arquivo já removido ou inexistente
  }
}

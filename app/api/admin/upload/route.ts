import path from "path";
import { NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { normalizeSlug, saveUploadedFile } from "@/lib/uploads";

const allowedMediaTypes = new Set(["logo", "capa", "galeria", "planta", "pdf"]);
const allowedLogoExtensions = new Set([".svg", ".png", ".jpg", ".jpeg", ".webp"]);

export async function POST(request: Request) {
  const auth = await requireApiAuth(["ADMIN", "EDITOR"]);
  if ("response" in auth) return auth.response;

  const formData = await request.formData();
  const fileEntry = formData.get("file");
  const slugEntry = formData.get("empreendimentoSlug");
  const typeEntry = formData.get("mediaType");

  if (!(fileEntry instanceof File)) {
    return NextResponse.json({ error: "Arquivo e obrigatorio" }, { status: 400 });
  }

  if (typeof slugEntry !== "string" || !slugEntry.trim()) {
    return NextResponse.json({ error: "Slug do empreendimento e obrigatorio" }, { status: 400 });
  }

  if (typeof typeEntry !== "string" || !allowedMediaTypes.has(typeEntry)) {
    return NextResponse.json({ error: "Tipo de midia invalido" }, { status: 400 });
  }

  const ext = path.extname(fileEntry.name).toLowerCase();

  if (typeEntry === "pdf") {
    if (ext !== ".pdf") {
      return NextResponse.json({ error: "Envie um arquivo PDF" }, { status: 400 });
    }
  } else if (!fileEntry.type.startsWith("image/")) {
    return NextResponse.json({ error: "Envie uma imagem valida" }, { status: 400 });
  }

  if (typeEntry === "logo" && !allowedLogoExtensions.has(ext)) {
    return NextResponse.json(
      { error: "Formato de logo invalido. Use SVG, PNG, JPG ou WEBP." },
      { status: 400 },
    );
  }

  const empreendimentoSlug = normalizeSlug(slugEntry);
  if (!empreendimentoSlug) {
    return NextResponse.json({ error: "Slug invalido" }, { status: 400 });
  }

  const filePath =
    typeEntry === "logo"
      ? await saveUploadedFile(
          fileEntry,
          ["empreendimentos", empreendimentoSlug],
          { baseFolder: "brand" },
        )
      : await saveUploadedFile(fileEntry, [
          "empreendimentos",
          empreendimentoSlug,
          typeEntry === "planta" ? "plantas" : typeEntry,
        ]);

  return NextResponse.json({ filePath });
}

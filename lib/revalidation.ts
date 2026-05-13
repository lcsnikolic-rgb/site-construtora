import { revalidatePath } from "next/cache";
import { appPath } from "@/lib/paths";

function revalidatePublicRoute(path: string) {
  revalidatePath(path);

  const visiblePath = appPath(path);
  if (visiblePath !== path) {
    revalidatePath(visiblePath);
  }
}

export function revalidateHomePage() {
  revalidatePublicRoute("/");
}

export function revalidateEmpreendimentoPages(slug: string) {
  revalidateHomePage();
  revalidatePublicRoute("/empreendimentos");
  revalidatePublicRoute(`/empreendimentos/${slug}`);
}

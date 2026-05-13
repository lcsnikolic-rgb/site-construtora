import { redirect } from "next/navigation";
import { EmpreendimentoForm } from "@/components/admin/EmpreendimentoForm";
import { canEditContent } from "@/lib/rbac";
import { getAuthSession } from "@/lib/session";

export default async function AdminNovoEmpreendimentoPage() {
  const session = await getAuthSession();
  const canEdit = session?.user ? canEditContent(session.user.role) : false;

  if (!canEdit) {
    redirect("/admin/empreendimentos");
  }

  return <EmpreendimentoForm mode="create" canEdit={canEdit} />;
}

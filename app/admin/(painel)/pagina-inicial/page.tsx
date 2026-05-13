import { PaginaInicialForm } from "@/components/admin/PaginaInicialForm";
import { getSiteSettings } from "@/lib/data";
import { canEditContent } from "@/lib/rbac";
import { getAuthSession } from "@/lib/session";

export default async function AdminPaginaInicialPage() {
  const [settings, session] = await Promise.all([getSiteSettings(), getAuthSession()]);
  const canEdit = session?.user ? canEditContent(session.user.role) : false;

  return <PaginaInicialForm initialData={settings} canEdit={canEdit} />;
}

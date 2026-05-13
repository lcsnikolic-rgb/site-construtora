import { NextResponse } from "next/server";
import type { RoleName } from "@prisma/client";
import { getAuthSession } from "@/lib/session";

export async function requireApiAuth(allowedRoles?: RoleName[]) {
  const session = await getAuthSession();

  if (!session?.user) {
    return {
      response: NextResponse.json({ error: "Não autenticado" }, { status: 401 }),
    };
  }

  if (allowedRoles && !allowedRoles.includes(session.user.role)) {
    return {
      response: NextResponse.json({ error: "Sem permissão" }, { status: 403 }),
    };
  }

  return { session };
}

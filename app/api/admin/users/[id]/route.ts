import bcrypt from "bcrypt";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiAuth } from "@/lib/api-auth";
import { userSchema } from "@/lib/validators";

const userSelect = {
  id: true,
  name: true,
  email: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  role: {
    select: {
      id: true,
      name: true,
      label: true,
    },
  },
} as const;

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_: Request, context: Context) {
  const auth = await requireApiAuth(["ADMIN"]);
  if ("response" in auth) return auth.response;

  const { id } = await context.params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: userSelect,
  });

  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PUT(request: Request, context: Context) {
  const auth = await requireApiAuth(["ADMIN"]);
  if ("response" in auth) return auth.response;

  const { id } = await context.params;
  const payload = await request.json();
  const parsed = userSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const role = await prisma.role.findUnique({
    where: { name: parsed.data.role },
  });

  if (!role) {
    return NextResponse.json({ error: "Cargo inválido" }, { status: 400 });
  }

  const updateData: Prisma.UserUpdateInput = {
    name: parsed.data.name,
    email: parsed.data.email.toLowerCase(),
    role: { connect: { id: role.id } },
    isActive: parsed.data.isActive,
  };

  if (parsed.data.password && parsed.data.password.length >= 6) {
    updateData.passwordHash = await bcrypt.hash(parsed.data.password, 10);
  }

  try {
    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: userSelect,
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json({ error: "E-mail já cadastrado" }, { status: 409 });
    }

    return NextResponse.json({ error: "Falha ao atualizar usuário" }, { status: 500 });
  }
}

export async function DELETE(_: Request, context: Context) {
  const auth = await requireApiAuth(["ADMIN"]);
  if ("response" in auth) return auth.response;

  const { id } = await context.params;

  if (auth.session.user.id === id) {
    return NextResponse.json(
      { error: "Não é permitido excluir o usuário autenticado" },
      { status: 400 },
    );
  }

  await prisma.user.delete({
    where: { id },
  });

  return NextResponse.json({ ok: true });
}

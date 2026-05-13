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

export async function GET() {
  const auth = await requireApiAuth(["ADMIN"]);
  if ("response" in auth) return auth.response;

  const users = await prisma.user.findMany({
    select: userSelect,
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const auth = await requireApiAuth(["ADMIN"]);
  if ("response" in auth) return auth.response;

  const payload = await request.json();
  const parsed = userSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  if (!parsed.data.password) {
    return NextResponse.json({ error: "Senha é obrigatória para criação" }, { status: 400 });
  }

  const role = await prisma.role.findUnique({
    where: { name: parsed.data.role },
  });

  if (!role) {
    return NextResponse.json({ error: "Cargo inválido" }, { status: 400 });
  }

  try {
    const created = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email.toLowerCase(),
        passwordHash: await bcrypt.hash(parsed.data.password, 10),
        roleId: role.id,
        isActive: parsed.data.isActive,
      },
      select: userSelect,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json({ error: "E-mail já cadastrado" }, { status: 409 });
    }

    return NextResponse.json({ error: "Falha ao criar usuário" }, { status: 500 });
  }
}

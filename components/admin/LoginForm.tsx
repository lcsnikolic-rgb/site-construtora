"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { appPath, routePath } from "@/lib/paths";

type LoginFormProps = {
  callbackUrl?: string;
};

function resolveAdminRedirect(callbackUrl: string, resultUrl?: string | null) {
  const candidates = [callbackUrl, resultUrl];

  for (const candidate of candidates) {
    if (!candidate) continue;

    try {
      const url = new URL(candidate, window.location.origin);
      let route = url.pathname;

      for (let index = 0; index < 3; index += 1) {
        const nextRoute = routePath(route);

        if (nextRoute === route) {
          break;
        }

        route = nextRoute;
      }

      if (route === "/admin" || route.startsWith("/admin/")) {
        return `${route}${url.search}${url.hash}`;
      }
    } catch {
      // tenta o proximo candidato
    }
  }

  return "/admin";
}

export function LoginForm({ callbackUrl = "/admin" }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    const targetRoute = resolveAdminRedirect(callbackUrl);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: `${window.location.origin}${appPath(targetRoute)}`,
    });

    setIsSubmitting(false);

    if (!result || result.error) {
      setError("Credenciais inválidas.");
      return;
    }

    const redirectTo = resolveAdminRedirect(callbackUrl, result.url);

    router.replace(redirectTo);
    router.refresh();
  }

  return (
    <form className="admin-login-form" onSubmit={handleSubmit}>
      <h1>Admin - Forma Espaço</h1>
      <p>Acesse o painel para editar os conteúdos do site.</p>

      <label>
        E-mail
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
        />
      </label>

      <label>
        Senha
        <input
          type="password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
        />
      </label>

      {error ? <p className="form-error">{error}</p> : null}

      <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
        {isSubmitting ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}

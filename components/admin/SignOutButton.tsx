"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { appPath } from "@/lib/paths";

export function SignOutButton() {
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);
    const loginUrl = `${window.location.origin}${appPath("/admin/login")}`;

    try {
      await signOut({
        redirect: false,
        callbackUrl: loginUrl,
      });
    } finally {
      window.location.replace(loginUrl);
    }
  }

  return (
    <button
      type="button"
      className="admin-signout"
      disabled={isSigningOut}
      onClick={handleSignOut}
    >
      {isSigningOut ? "Saindo..." : "Sair"}
    </button>
  );
}

import { LoginForm } from "@/components/admin/LoginForm";

type PageProps = {
  searchParams: Promise<{
    callbackUrl?: string;
  }>;
};

export default async function AdminLoginPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const callbackUrl =
    typeof params.callbackUrl === "string" &&
    (params.callbackUrl.startsWith("/admin") || params.callbackUrl.startsWith("/site/admin"))
      ? params.callbackUrl
      : "/admin";

  return (
    <main className="admin-login-page">
      <LoginForm callbackUrl={callbackUrl} />
    </main>
  );
}

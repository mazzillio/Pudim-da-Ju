import { useMutation } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { config } from "@/config";
import { ApiError, api } from "@/lib/api";
import { session, useSession } from "@/lib/session";
import { useTitle } from "@/lib/use-title";

/** Only in-panel paths, so `?next=` can't bounce the owner to another site. */
function safeNext(next: string | null): string {
  return next?.startsWith("/") && !next.startsWith("//") && !next.startsWith("/login") ? next : "/";
}

export function LoginPage() {
  useTitle("Entrar no painel");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { token, expired } = useSession();
  const [error, setError] = useState<string>();
  const next = safeNext(searchParams.get("next"));

  const mutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => api.login(email, password),
    onSuccess: ({ token: newToken }) => {
      session.signIn(newToken);
      navigate(next, { replace: true });
    },
    onError: (err) => {
      setError(
        err instanceof ApiError && (err.status === 401 || err.status === 400)
          ? "Email ou senha incorretos."
          : "Não foi possível falar com o servidor. Tente de novo em instantes.",
      );
    },
  });

  if (token && !mutation.isPending) return <Navigate to={next} replace />;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    if (!email || !password) {
      setError("Preencha email e senha.");
      return;
    }
    setError(undefined);
    mutation.mutate({ email, password });
  }

  const notice =
    expired || searchParams.get("motivo") === "expirada" ? "Sua sessão expirou. Entre de novo para continuar." : undefined;

  return (
    <main className="flex min-h-full flex-1 items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm rounded-3xl border-2 border-border bg-card p-6 shadow-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <img src={config.logoUrl} alt="" width={72} height={72} className="size-18 rounded-2xl" />
          <div>
            <h1 className="font-heading text-xl font-semibold text-foreground">{config.storeName}</h1>
            <p className="mt-1 text-sm text-muted-foreground">Painel da loja · entre para cuidar dos seus pudins.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          {notice && !error && (
            <p role="status" className="rounded-2xl bg-secondary px-3 py-2.5 text-sm text-secondary-foreground">
              {notice}
            </p>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="username" inputMode="email" required className="h-11" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" name="password" type="password" autoComplete="current-password" required className="h-11" />
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" className="mt-2 h-11" loading={mutation.isPending}>
            Entrar
          </Button>
        </form>
      </div>
    </main>
  );
}

import { useQuery } from "@tanstack/react-query";
import { Navigate, Outlet, useLocation } from "react-router";

import { AdminHeader } from "@/components/admin/admin-header";
import { LoadError } from "@/components/admin/load-error";
import { Skeleton } from "@/components/ui/skeleton";
import { api, friendlyError } from "@/lib/api";
import { useSession } from "@/lib/session";

/**
 * Gate for every panel page: no token goes to the login, and the token is
 * checked against GET /auth/me (the catalog endpoints are public, so a stale
 * token would otherwise only be noticed on the first save).
 */
export function AdminLayout() {
  const { token, expired } = useSession();
  const location = useLocation();
  const me = useQuery({ queryKey: ["me", token], queryFn: api.me, enabled: !!token, retry: false });

  if (!token) {
    const params = new URLSearchParams({ next: `${location.pathname}${location.search}` });
    if (expired) params.set("motivo", "expirada");
    return <Navigate to={`/login?${params}`} replace />;
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      {me.data ? <AdminHeader userName={me.data.name} /> : <div className="h-15 bg-primary" />}
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pt-5 pb-28">
        {me.isError ? (
          <LoadError message={friendlyError(me.error)} onRetry={() => me.refetch()} />
        ) : me.data ? (
          <Outlet />
        ) : (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
        )}
      </main>
    </div>
  );
}

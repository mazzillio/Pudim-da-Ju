import { useQueryClient } from "@tanstack/react-query";
import { ExternalLink, LogOut } from "lucide-react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { config } from "@/config";
import { session } from "@/lib/session";

export function AdminHeader({ userName }: { userName: string }) {
  const queryClient = useQueryClient();

  function handleLogout() {
    session.signOut();
    queryClient.clear();
  }

  return (
    <header className="bg-primary">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <Link
          to="/"
          className="flex min-w-0 items-center gap-3 rounded-2xl outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
        >
          <img src={config.logoUrl} alt="" width={36} height={36} className="size-9 shrink-0 rounded-full ring-1 ring-primary-foreground/30" />
          <span className="min-w-0">
            <span className="block truncate font-heading text-base leading-tight font-semibold text-primary-foreground">
              {config.storeName}
            </span>
            <span className="block truncate text-xs text-primary-foreground/70">Painel · Olá, {userName}</span>
          </span>
        </Link>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="text-primary-foreground hover:bg-primary-foreground/10"
            nativeButton={false}
            render={<a href={config.storeUrl} target="_blank" rel="noreferrer" />}
          >
            <ExternalLink data-icon="inline-start" />
            Ver loja
          </Button>
          <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={handleLogout}>
            <LogOut data-icon="inline-start" />
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
}

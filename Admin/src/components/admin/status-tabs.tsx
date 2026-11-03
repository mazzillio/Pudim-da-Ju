import { Link } from "react-router";

import { cn } from "@/lib/utils";

export type StatusFilter = "disponiveis" | "indisponiveis";

export function StatusTabs({
  active,
  counts,
}: {
  active?: StatusFilter;
  counts: { all: number; available: number; unavailable: number };
}) {
  const tabs: { label: string; value?: StatusFilter; count: number }[] = [
    { label: "Todos", count: counts.all },
    { label: "Disponíveis", value: "disponiveis", count: counts.available },
    { label: "Indisponíveis", value: "indisponiveis", count: counts.unavailable },
  ];

  return (
    <nav aria-label="Filtrar pudins" className="-mx-4 flex gap-2 overflow-x-auto px-4">
      {tabs.map((tab) => {
        const isActive = tab.value === active;
        return (
          <Link
            key={tab.label}
            to={tab.value ? `/?status=${tab.value}` : "/"}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "shrink-0 rounded-full border-2 px-4 py-1.5 text-sm font-medium outline-none transition-colors duration-150 focus-visible:ring-[3px] focus-visible:ring-ring/50",
              isActive
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-foreground hover:bg-muted",
            )}
          >
            {tab.label} <span className="opacity-70">({tab.count})</span>
          </Link>
        );
      })}
    </nav>
  );
}

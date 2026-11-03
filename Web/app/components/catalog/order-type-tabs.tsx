import Link from "next/link";

import type { OrderType } from "@/app/lib/types";
import { cn } from "@/app/lib/utils";

const tabs: { label: string; value?: OrderType }[] = [
  { label: "Todos" },
  { label: "Pronta entrega", value: "pronta-entrega" },
  { label: "Encomenda", value: "encomenda" },
];

export function OrderTypeTabs({ active }: { active?: OrderType }) {
  return (
    <nav aria-label="Filtrar por tipo de pedido" className="flex gap-2 overflow-x-auto px-3 pt-6">
      {tabs.map((tab) => {
        const isActive = tab.value === active;
        return (
          <Link
            key={tab.label}
            href={tab.value ? `/?tipo=${tab.value}` : "/"}
            scroll={false}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "shrink-0 rounded-full border-2 px-4 py-1.5 text-sm font-medium outline-none transition-colors duration-150 focus-visible:ring-[3px] focus-visible:ring-ring/50",
              isActive
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-foreground hover:bg-muted",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

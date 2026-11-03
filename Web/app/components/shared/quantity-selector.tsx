"use client";

import { Minus, Plus } from "lucide-react";

import { Button } from "@/app/components/ui/button";

export function QuantitySelector({
  quantity,
  onChange,
  min = 1,
}: {
  quantity: number;
  onChange: (quantity: number) => void;
  min?: number;
}) {
  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-border px-1 py-1">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="active:scale-90"
        aria-label="Diminuir quantidade"
        disabled={quantity <= min}
        onClick={() => onChange(quantity - 1)}
      >
        <Minus />
      </Button>
      <span className="min-w-4 text-center text-sm font-medium tabular-nums">{quantity}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="active:scale-90"
        aria-label="Aumentar quantidade"
        onClick={() => onChange(quantity + 1)}
      >
        <Plus />
      </Button>
    </div>
  );
}

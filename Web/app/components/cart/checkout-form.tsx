"use client";

import { useId, useState, type FormEvent } from "react";

import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
import { Textarea } from "@/app/components/ui/textarea";
import { useCart } from "@/app/lib/cart-context";
import { getCartItemCount } from "@/app/lib/cart-utils";
import { formatStoreAddress, storeConfig } from "@/app/configs/store-config";
import type { CustomerInfo, DeliveryMethod } from "@/app/lib/types";
import { buildOrderMessage, buildWhatsappLink } from "@/app/lib/whatsapp";

export function CheckoutForm({ onOrderSent }: { onOrderSent: () => void }) {
  const { items, clearCart } = useCart();
  const formId = useId();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("delivery");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(storeConfig.paymentMethods[0]);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting || getCartItemCount(items) < storeConfig.minOrderItems) return;

    setIsSubmitting(true);

    const customer: CustomerInfo = {
      name,
      phone,
      deliveryMethod,
      address: deliveryMethod === "delivery" ? address : undefined,
      paymentMethod,
      notes: notes || undefined,
    };

    const message = buildOrderMessage(items, customer);
    window.open(buildWhatsappLink(message), "_blank", "noopener,noreferrer");

    // Brief, deliberate pause so "Enviando..." is perceivable before the sheet closes.
    window.setTimeout(() => {
      clearCart();
      onOrderSent();
    }, 400);
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="customer-name">Nome</Label>
        <Input id="customer-name" required value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="customer-phone">Telefone</Label>
        <Input
          id="customer-phone"
          type="tel"
          required
          placeholder="(11) 99999-9999"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Entrega</Label>
        <RadioGroup
          value={deliveryMethod}
          onValueChange={(value) => setDeliveryMethod(value as DeliveryMethod)}
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="delivery" id="delivery-method-delivery" />
            <Label htmlFor="delivery-method-delivery" className="font-normal">
              Entrega{storeConfig.deliveryFee ? ` (+${storeConfig.deliveryFee.toFixed(2)})` : ""}
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="pickup" id="delivery-method-pickup" />
            <Label htmlFor="delivery-method-pickup" className="font-normal">
              Retirar no local
            </Label>
          </div>
        </RadioGroup>
      </div>

      {deliveryMethod === "delivery" && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="customer-address">Endereço</Label>
          <Input
            id="customer-address"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
      )}

      {deliveryMethod === "pickup" && (
        <div className="flex flex-col gap-1.5">
          <Label>Endereço para retirada</Label>
          <p className="rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
            {formatStoreAddress()}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label>Pagamento</Label>
        <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
          {storeConfig.paymentMethods.map((method) => (
            <div key={method} className="flex items-center gap-2">
              <RadioGroupItem value={method} id={`payment-${method}`} />
              <Label htmlFor={`payment-${method}`} className="font-normal">
                {method}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="order-notes">Observações</Label>
        <Textarea id="order-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      <Button type="submit" size="lg" className="mt-2 w-full" loading={isSubmitting}>
        {isSubmitting ? "Enviando..." : "Enviar pedido no WhatsApp"}
      </Button>
    </form>
  );
}

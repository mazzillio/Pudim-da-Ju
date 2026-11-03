import { getCartItemTotalPrice, getCartSubtotal } from "@/app/lib/cart-utils";
import { formatCurrency, formatStoreAddress, storeConfig } from "@/app/configs/store-config";
import type { CartItem, CustomerInfo } from "@/app/lib/types";

function buildItemLines(item: CartItem): string[] {
  const lines = [`${item.quantity}x ${item.product.name}`];
  if (item.notes) lines.push(`  Obs: ${item.notes}`);
  lines.push(`  ${formatCurrency(getCartItemTotalPrice(item))}`);
  return lines;
}

export function buildOrderMessage(items: CartItem[], customer: CustomerInfo): string {
  const subtotal = getCartSubtotal(items);
  const deliveryFee = customer.deliveryMethod === "delivery" ? (storeConfig.deliveryFee ?? 0) : 0;
  const total = subtotal + deliveryFee;

  const sections: string[] = [`*Novo pedido - ${storeConfig.name}*`, ""];

  items.forEach((item, index) => {
    sections.push(...buildItemLines(item));
    if (index < items.length - 1) sections.push("");
  });

  sections.push("", "--------------------------");
  sections.push(`Subtotal: ${formatCurrency(subtotal)}`);
  if (customer.deliveryMethod === "delivery") {
    sections.push(`Entrega: ${formatCurrency(deliveryFee)}`);
  }
  sections.push(`*Total: ${formatCurrency(total)}*`);

  sections.push("", "*Dados do cliente*");
  sections.push(`Nome: ${customer.name}`);
  sections.push(`Telefone: ${customer.phone}`);
  sections.push(`Tipo de entrega: ${customer.deliveryMethod === "delivery" ? "Entrega" : "Retirada no local"}`);
  if (customer.deliveryMethod === "delivery" && customer.address) {
    sections.push(`Endereço: ${customer.address}`);
  } else if (customer.deliveryMethod === "pickup") {
    sections.push(`Retirar em: ${formatStoreAddress()}`);
  }
  sections.push(`Pagamento: ${customer.paymentMethod}`);
  if (customer.notes) sections.push(`Obs: ${customer.notes}`);

  return sections.join("\n");
}

export function buildWhatsappLink(message: string, whatsappNumber: string = storeConfig.whatsappNumber): string {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

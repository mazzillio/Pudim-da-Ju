/** "pronta-entrega": in stock, ships right away. "encomenda": made to order. */
export type OrderType = "pronta-entrega" | "encomenda";

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  available: boolean;
  /** One or both: a product can be in stock and also taken as an order. */
  orderTypes: OrderType[];
}

export interface CartItem {
  /** Unique per cart line, since the same product can be added twice with different notes. */
  cartItemId: string;
  product: Product;
  quantity: number;
  notes?: string;
}

export type DeliveryMethod = "delivery" | "pickup";

export interface CustomerInfo {
  name: string;
  phone: string;
  deliveryMethod: DeliveryMethod;
  address?: string;
  paymentMethod: string;
  notes?: string;
}

/** Base colors (any CSS color). The full palette is derived from these in app/globals.css. */
export interface StoreTheme {
  /** Main brand color: header, buttons, focus rings. */
  brand: string;
  /** Text/icons drawn on top of `brand`. */
  brandForeground: string;
  /** Page background. */
  surface: string;
  /** Main text color. */
  ink: string;
}

export interface StoreConfig {
  name: string;
  /** Short tagline used in page titles and descriptions. */
  tagline: string;
  theme: StoreTheme;
  logoUrl?: string;
  whatsappNumber: string;
  currency: string;
  locale: string;
  paymentMethods: string[];
  deliveryFee?: number;
  /** Minimum total item quantity required to place an order. */
  minOrderItems: number;
}

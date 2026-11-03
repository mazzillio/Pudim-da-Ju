ALTER TABLE "products" ADD COLUMN "order_types" "order_type"[] DEFAULT '{"pronta-entrega"}' NOT NULL;--> statement-breakpoint
-- Keep each product's current type: "pronta-entrega" -> {pronta-entrega}, "encomenda" -> {encomenda}.
UPDATE "products" SET "order_types" = ARRAY["order_type"];--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "order_type";
import { and, asc, eq, type SQL } from "drizzle-orm";

import type { Database } from "../../db/client.js";
import { type OrderType, type ProductRow, products } from "./products.table.js";

export type Product = ProductRow;

export interface ProductFilters {
  available?: boolean;
  orderType?: OrderType;
}

export type CreateProductData = Pick<
  Product,
  "slug" | "name" | "description" | "priceCents" | "imageUrl" | "available" | "orderType"
>;

export type UpdateProductData = Partial<CreateProductData>;

export interface ProductsRepository {
  list(filters: ProductFilters): Promise<Product[]>;
  findById(id: string): Promise<Product | undefined>;
  findBySlug(slug: string): Promise<Product | undefined>;
  create(data: CreateProductData): Promise<Product>;
  update(id: string, data: UpdateProductData): Promise<Product | undefined>;
  delete(id: string): Promise<boolean>;
}

export class DrizzleProductsRepository implements ProductsRepository {
  constructor(private readonly db: Database) {}

  async list(filters: ProductFilters) {
    const conditions: SQL[] = [];
    if (filters.available !== undefined) conditions.push(eq(products.available, filters.available));
    if (filters.orderType) conditions.push(eq(products.orderType, filters.orderType));

    return (
      this.db
        .select()
        .from(products)
        .where(and(...conditions))
        // Name breaks ties (seeded rows share createdAt) so the order never shifts after an update.
        .orderBy(asc(products.createdAt), asc(products.name))
    );
  }

  async findById(id: string) {
    const [product] = await this.db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async findBySlug(slug: string) {
    const [product] = await this.db.select().from(products).where(eq(products.slug, slug));
    return product;
  }

  async create(data: CreateProductData) {
    const [product] = await this.db.insert(products).values(data).returning();
    if (!product) throw new Error("Insert returned no row");
    return product;
  }

  async update(id: string, data: UpdateProductData) {
    const [product] = await this.db
      .update(products)
      .set(data)
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async delete(id: string) {
    const deleted = await this.db
      .delete(products)
      .where(eq(products.id, id))
      .returning({ id: products.id });
    return deleted.length > 0;
  }
}

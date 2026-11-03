import { ConflictError, NotFoundError } from "../../shared/errors.js";
import type { Product, ProductsRepository, UpdateProductData } from "./products.repository.js";
import type {
  CreateProductBody,
  ListProductsQuery,
  ProductResponse,
  UpdateProductBody,
} from "./products.schemas.js";

/** "Pudim de Doce de Leite" -> "pudim-de-doce-de-leite" */
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 140);
}

const toCents = (reais: number) => Math.round(reais * 100);

export function toProductResponse(product: Product): ProductResponse {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    price: product.priceCents / 100,
    imageUrl: product.imageUrl,
    available: product.available,
    orderType: product.orderType,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

export class ProductsService {
  constructor(private readonly products: ProductsRepository) {}

  async list(query: ListProductsQuery): Promise<ProductResponse[]> {
    const products = await this.products.list(query);
    return products.map(toProductResponse);
  }

  async getById(id: string): Promise<ProductResponse> {
    return toProductResponse(await this.findOrFail(id));
  }

  async getBySlug(slug: string): Promise<ProductResponse> {
    const product = await this.products.findBySlug(slug);
    if (!product) throw new NotFoundError("Product not found");
    return toProductResponse(product);
  }

  async create({ price, slug, ...body }: CreateProductBody): Promise<ProductResponse> {
    const finalSlug = slug ?? slugify(body.name);
    await this.ensureSlugIsFree(finalSlug);

    const product = await this.products.create({
      ...body,
      slug: finalSlug,
      priceCents: toCents(price),
    });
    return toProductResponse(product);
  }

  async update(id: string, { price, ...body }: UpdateProductBody): Promise<ProductResponse> {
    const current = await this.findOrFail(id);
    if (body.slug && body.slug !== current.slug) await this.ensureSlugIsFree(body.slug);

    const data: UpdateProductData = { ...body };
    if (price !== undefined) data.priceCents = toCents(price);

    const product = await this.products.update(id, data);
    if (!product) throw new NotFoundError("Product not found");
    return toProductResponse(product);
  }

  async setAvailability(id: string, available: boolean): Promise<ProductResponse> {
    const product = await this.products.update(id, { available });
    if (!product) throw new NotFoundError("Product not found");
    return toProductResponse(product);
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.products.delete(id);
    if (!deleted) throw new NotFoundError("Product not found");
  }

  private async findOrFail(id: string): Promise<Product> {
    const product = await this.products.findById(id);
    if (!product) throw new NotFoundError("Product not found");
    return product;
  }

  private async ensureSlugIsFree(slug: string) {
    if (await this.products.findBySlug(slug)) {
      throw new ConflictError(`A product with slug "${slug}" already exists`);
    }
  }
}

import { randomUUID } from "node:crypto";

import type { FeatureFlagsRepository } from "../../src/modules/feature-flags/feature-flags.repository.js";
import type {
  CreateProductData,
  Product,
  ProductFilters,
  ProductsRepository,
  UpdateProductData,
} from "../../src/modules/products/products.repository.js";
import type {
  CreateUserData,
  User,
  UsersRepository,
} from "../../src/modules/users/users.repository.js";

export class InMemoryUsersRepository implements UsersRepository {
  items: User[] = [];

  async findById(id: string) {
    return this.items.find((user) => user.id === id);
  }

  async findByEmail(email: string) {
    return this.items.find((user) => user.email === email);
  }

  async create(data: CreateUserData) {
    const user: User = { id: randomUUID(), createdAt: new Date(), ...data };
    this.items.push(user);
    return user;
  }
}

export class InMemoryProductsRepository implements ProductsRepository {
  items: Product[] = [];

  async list(filters: ProductFilters) {
    return this.items.filter(
      (product) =>
        (filters.available === undefined || product.available === filters.available) &&
        (!filters.orderType || product.orderTypes.includes(filters.orderType)),
    );
  }

  async findById(id: string) {
    return this.items.find((product) => product.id === id);
  }

  async findBySlug(slug: string) {
    return this.items.find((product) => product.slug === slug);
  }

  async create(data: CreateProductData) {
    const now = new Date();
    const product: Product = { id: randomUUID(), createdAt: now, updatedAt: now, ...data };
    this.items.push(product);
    return product;
  }

  async update(id: string, data: UpdateProductData) {
    const product = await this.findById(id);
    if (!product) return undefined;
    Object.assign(product, data, { updatedAt: new Date() });
    return product;
  }

  async delete(id: string) {
    const before = this.items.length;
    this.items = this.items.filter((product) => product.id !== id);
    return this.items.length < before;
  }
}

export class InMemoryFeatureFlagsRepository implements FeatureFlagsRepository {
  items: Record<string, boolean> = {};

  async list() {
    return { ...this.items };
  }

  async set(key: string, enabled: boolean) {
    this.items[key] = enabled;
  }
}

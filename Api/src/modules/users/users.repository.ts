import { eq } from "drizzle-orm";

import type { Database } from "../../db/client.js";
import { type UserRow, users } from "./users.table.js";

export type User = UserRow;

export interface CreateUserData {
  name: string;
  email: string;
  passwordHash: string;
}

export interface UsersRepository {
  findById(id: string): Promise<User | undefined>;
  findByEmail(email: string): Promise<User | undefined>;
  create(data: CreateUserData): Promise<User>;
}

export class DrizzleUsersRepository implements UsersRepository {
  constructor(private readonly db: Database) {}

  async findById(id: string) {
    const [user] = await this.db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async findByEmail(email: string) {
    const [user] = await this.db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async create(data: CreateUserData) {
    const [user] = await this.db.insert(users).values(data).returning();
    if (!user) throw new Error("Insert returned no row");
    return user;
  }
}

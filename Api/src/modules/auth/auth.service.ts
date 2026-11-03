import { NotFoundError, UnauthorizedError } from "../../shared/errors.js";
import { verifyPassword } from "../../shared/password.js";
import type { User, UsersRepository } from "../users/users.repository.js";
import type { LoginBody, UserResponse } from "./auth.schemas.js";

function toUserResponse(user: User): UserResponse {
  return { id: user.id, name: user.name, email: user.email };
}

export class AuthService {
  constructor(private readonly users: UsersRepository) {}

  /** Same error for unknown email and wrong password, so the API doesn't reveal which emails exist. */
  async validateCredentials({ email, password }: LoginBody): Promise<UserResponse> {
    const user = await this.users.findByEmail(email);
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      throw new UnauthorizedError("Invalid email or password");
    }
    return toUserResponse(user);
  }

  async getProfile(userId: string): Promise<UserResponse> {
    const user = await this.users.findById(userId);
    if (!user) throw new NotFoundError("User not found");
    return toUserResponse(user);
  }
}

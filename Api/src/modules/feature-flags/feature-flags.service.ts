import type { FeatureFlagsRepository } from "./feature-flags.repository.js";
import {
  type FeatureFlagsResponse,
  featureFlagKeys,
  type UpdateFeatureFlagsBody,
} from "./feature-flags.schemas.js";

export class FeatureFlagsService {
  constructor(private readonly flags: FeatureFlagsRepository) {}

  async get(): Promise<FeatureFlagsResponse> {
    const stored = await this.flags.list();
    return Object.fromEntries(
      featureFlagKeys.map((key) => [key, stored[key] ?? false]),
    ) as FeatureFlagsResponse;
  }

  async update(body: UpdateFeatureFlagsBody): Promise<FeatureFlagsResponse> {
    for (const [key, enabled] of Object.entries(body)) {
      if (enabled !== undefined) await this.flags.set(key, enabled);
    }
    return this.get();
  }
}

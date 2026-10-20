import { config } from "./config.js";
// Demo-only repository. Replace this boundary with an authenticated backend.
export class DemoRepository {
  constructor(storage) {
    try {
      this.storage = storage ?? globalThis.localStorage;
    } catch {
      this.storage = null;
    }
  }
  read() {
    try {
      let d = JSON.parse(this.storage.getItem(config.storageKey));
      return d?.version === 1 &&
        d.profile?.medical &&
        Array.isArray(d.profile.contacts)
        ? d
        : null;
    } catch {
      return null;
    }
  }
  save(profile, step = 0, published = false, furthestStep = step) {
    try {
      this.storage.setItem(
        config.storageKey,
        JSON.stringify({
          version: 1,
          profile,
          step,
          furthestStep: Math.max(
            step,
            furthestStep,
            this.read()?.furthestStep || 0,
          ),
          published: published || !!this.read()?.publishedProfile,
          publishedProfile: published
            ? profile
            : (this.read()?.publishedProfile ?? null),
        }),
      );
      return true;
    } catch {
      return false;
    }
  }
}

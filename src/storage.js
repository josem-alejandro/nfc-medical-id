import { config } from "./config.js";
import { cleanProfile } from "./model.js";
export class DemoRepository {
  constructor(storage) {
    try {
      this.storage = storage ?? globalThis.localStorage;
    } catch {
      this.storage = null;
    }
  }
  read() {
    let previous;
    try {
      previous = JSON.parse(this.storage.getItem(config.storageKey));
    } catch {
      return null;
    }
    if (!previous || ![1, 2].includes(previous.version)) return null;
    const profile = cleanProfile(previous.profile);
    if (!profile) return null;
    const result = {
      version: 2,
      profile,
      publishedProfile: cleanProfile(
        previous.publishedProfile ||
          (previous.published ? previous.profile : null),
      ),
    };
    // Remove retired fields from existing local records without changing their profile URLs.
    if (JSON.stringify(previous) !== JSON.stringify(result)) {
      try {
        this.storage.setItem(config.storageKey, JSON.stringify(result));
      } catch {
        /* Read access may still work if writing is blocked. */
      }
    }
    return result;
  }
  save(profile) {
    try {
      const p = cleanProfile(profile);
      if (!p) return false;
      this.storage.setItem(
        config.storageKey,
        JSON.stringify({ version: 2, profile: p, publishedProfile: p }),
      );
      return true;
    } catch {
      return false;
    }
  }
}

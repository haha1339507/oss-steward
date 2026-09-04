import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

export interface RepoFs {
  root: string;
  exists(rel: string): boolean;
  read(rel: string): string | null;
  list(rel: string): string[];
}

export function createRepoFs(root: string): RepoFs {
  return {
    root,
    exists(rel: string) {
      return existsSync(join(root, rel));
    },
    read(rel: string) {
      const path = join(root, rel);
      if (!existsSync(path)) {
        return null;
      }
      try {
        if (!statSync(path).isFile()) {
          return null;
        }
        return readFileSync(path, "utf8");
      } catch {
        return null;
      }
    },
    list(rel: string) {
      const path = join(root, rel);
      if (!existsSync(path)) {
        return [];
      }
      try {
        return readdirSync(path);
      } catch {
        return [];
      }
    },
  };
}

export function firstExisting(fs: RepoFs, candidates: string[]): string | null {
  for (const candidate of candidates) {
    if (fs.exists(candidate)) {
      return candidate;
    }
  }
  return null;
}

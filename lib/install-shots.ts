import "server-only";

import { readdirSync } from "node:fs";
import { join } from "node:path";

import {
  getInstallGuide,
  installShotDir,
  type InstallPlatformId,
  type InstallShots,
} from "@/lib/install";

/** stepN-M.<ext>, both indexes one-based. */
const SHOT = /^step(\d+)-(\d+)\.(png|jpe?g|webp|avif)$/i;

function read(dir: string): string[] {
  try {
    return readdirSync(join(process.cwd(), "public", dir));
  } catch {
    return [];
  }
}

export function readInstallShots(platform: InstallPlatformId): InstallShots {
  const shots = {} as InstallShots;

  for (const method of getInstallGuide(platform).methods) {
    const dir = installShotDir(platform, method.id);

    const steps: { name: string; index: number }[][] = method.steps.map(
      () => [],
    );

    for (const name of read(dir)) {
      const match = SHOT.exec(name);

      if (!match) continue;

      const step = steps[Number(match[1]) - 1];

      step?.push({ name, index: Number(match[2]) });
    }

    shots[method.id] = steps.map((step) =>
      step
        .sort((a, b) => a.index - b.index)
        .map(({ name }) => `${dir}/${name}`),
    );
  }

  return shots;
}

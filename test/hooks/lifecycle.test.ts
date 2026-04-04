import { describe, it, expect, vi } from "vitest";
import { lifecycleHooks } from "../../src/hooks/lifecycle.js";

function createLifecycleCtx(kvData: Record<string, unknown> = {}) {
  const kvStore = new Map<string, unknown>(Object.entries(kvData));

  return {
    log: { info: vi.fn() },
    kv: {
      get: vi.fn(async <T>(key: string) => (kvStore.get(key) as T) ?? null),
      set: vi.fn(async (key: string, value: unknown) => {
        kvStore.set(key, value);
      }),
      list: vi.fn(async (prefix?: string) =>
        [...kvStore.entries()]
          .filter(([k]) => !prefix || k.startsWith(prefix))
          .map(([key, value]) => ({ key, value })),
      ),
    },
    cron: {
      schedule: vi.fn(),
      cancel: vi.fn(),
    },
  };
}

describe("lifecycleHooks", () => {
  describe("plugin:activate", () => {
    it("schedules cron and logs", async () => {
      const ctx = createLifecycleCtx();
      await lifecycleHooks["plugin:activate"]({}, ctx);

      expect(ctx.cron.schedule).toHaveBeenCalledWith("recalculate-scores", {
        schedule: "0 3 * * 0",
      });
      expect(ctx.log.info).toHaveBeenCalledWith("SEO Toolkit activated");
    });
  });

  describe("plugin:install", () => {
    it("sets defaults when not exist", async () => {
      const ctx = createLifecycleCtx();
      await lifecycleHooks["plugin:install"]({}, ctx);

      expect(ctx.kv.set).toHaveBeenCalledWith(
        "settings:titleTemplate",
        "{title} | {site}",
      );
      expect(ctx.kv.set).toHaveBeenCalledWith(
        "settings:defaultRobots",
        "index, follow",
      );
    });

    it("skips if defaults already set", async () => {
      const ctx = createLifecycleCtx({
        "settings:titleTemplate": "{title} - {site}",
      });
      await lifecycleHooks["plugin:install"]({}, ctx);

      // Should not overwrite titleTemplate or defaultRobots
      const setCallKeys = ctx.kv.set.mock.calls.map(
        (call: unknown[]) => call[0],
      );
      expect(setCallKeys).not.toContain("settings:titleTemplate");
      expect(setCallKeys).not.toContain("settings:defaultRobots");
    });
  });

  describe("plugin:deactivate", () => {
    it("cancels cron", async () => {
      const ctx = createLifecycleCtx();
      await lifecycleHooks["plugin:deactivate"]({}, ctx);

      expect(ctx.cron.cancel).toHaveBeenCalledWith("recalculate-scores");
      expect(ctx.log.info).toHaveBeenCalledWith("SEO Toolkit deactivated");
    });
  });

  describe("plugin:uninstall", () => {
    it("cancels cron and handles deleteData=true", async () => {
      const ctx = createLifecycleCtx();
      await lifecycleHooks["plugin:uninstall"]({ deleteData: true }, ctx);

      expect(ctx.cron.cancel).toHaveBeenCalledWith("recalculate-scores");
      expect(ctx.log.info).toHaveBeenCalledWith(
        "SEO Toolkit uninstalled — data cleanup requested",
      );
    });

    it("cancels cron and handles deleteData=false", async () => {
      const ctx = createLifecycleCtx();
      await lifecycleHooks["plugin:uninstall"]({ deleteData: false }, ctx);

      expect(ctx.cron.cancel).toHaveBeenCalledWith("recalculate-scores");
      expect(ctx.log.info).toHaveBeenCalledWith(
        "SEO Toolkit uninstalled — data preserved",
      );
    });
  });
});

import { DEFAULT_TITLE_TEMPLATE, DEFAULT_ROBOTS } from "../constants.js";
import { rebuildCompositeKeys } from "../utils/kv-settings.js";

interface LifecycleCtx {
  log: { info(msg: string): void };
  kv: {
    get<T>(key: string): Promise<T | null>;
    set(key: string, value: unknown): Promise<void>;
  };
  cron: {
    schedule(name: string, opts: { schedule: string }): Promise<void>;
    cancel(name: string): Promise<void>;
  };
}

export const lifecycleHooks = {
  "plugin:activate": async (_event: unknown, ctx: LifecycleCtx) => {
    ctx.log.info("SEO Toolkit activated");
    await Promise.all([
      ctx.cron.schedule("recalculate-scores", { schedule: "0 3 * * 0" }),
      rebuildCompositeKeys(ctx.kv),
    ]);
  },

  "plugin:install": async (_event: unknown, ctx: LifecycleCtx) => {
    const existing = await ctx.kv.get("settings:titleTemplate");
    if (existing === null) {
      await Promise.all([
        ctx.kv.set("settings:titleTemplate", DEFAULT_TITLE_TEMPLATE),
        ctx.kv.set("settings:defaultRobots", DEFAULT_ROBOTS),
      ]);
    }
    await rebuildCompositeKeys(ctx.kv);
  },

  "plugin:deactivate": async (_event: unknown, ctx: LifecycleCtx) => {
    await ctx.cron.cancel("recalculate-scores");
    ctx.log.info("SEO Toolkit deactivated");
  },

  "plugin:uninstall": async (_event: unknown, ctx: LifecycleCtx) => {
    await ctx.cron.cancel("recalculate-scores");
    ctx.log.info("SEO Toolkit uninstalled");
  },
};

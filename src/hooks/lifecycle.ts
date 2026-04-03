import { DEFAULT_TITLE_TEMPLATE, DEFAULT_ROBOTS } from "../constants.js";

interface LifecycleCtx {
  log: { info(msg: string): void };
  kv: {
    get<T>(key: string): Promise<T | null>;
    set(key: string, value: unknown): Promise<void>;
  };
}

export const lifecycleHooks = {
  "plugin:activate": async (_event: unknown, ctx: LifecycleCtx) => {
    ctx.log.info("SEO Toolkit activated");
  },

  "plugin:install": async (_event: unknown, ctx: LifecycleCtx) => {
    const existing = await ctx.kv.get("settings:titleTemplate");
    if (existing === null) {
      await Promise.all([
        ctx.kv.set("settings:titleTemplate", DEFAULT_TITLE_TEMPLATE),
        ctx.kv.set("settings:defaultRobots", DEFAULT_ROBOTS),
      ]);
    }
  },
};

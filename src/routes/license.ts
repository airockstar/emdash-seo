import { z } from "zod";
import { validateLicense, checkLicenseStatus } from "../utils/license.js";

const ValidateInput = z.object({ key: z.string() });

export const licenseRoutes = {
  "license/validate": {
    input: ValidateInput,
    handler: async (ctx: any) => {
      const info = await validateLicense(ctx.input.key);
      if (info.valid) {
        await ctx.kv.set("settings:licenseKey", ctx.input.key);
      }
      return info;
    },
  },

  "license/status": {
    handler: async (ctx: any) => {
      return checkLicenseStatus(ctx);
    },
  },
};

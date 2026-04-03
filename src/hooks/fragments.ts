interface FragmentsCtx {
  kv: {
    get<T>(key: string): Promise<T | null>;
  };
}

interface Fragment {
  kind: "external-script" | "inline-script" | "html";
  placement: "head" | "body:start" | "body:end";
  [key: string]: unknown;
}

const GA_ID_PATTERN = /^G-[A-Z0-9]+$/;
const VERIFICATION_PATTERN = /^[a-zA-Z0-9_-]+$/;

export async function fragmentsHandler(
  _event: unknown,
  ctx: FragmentsCtx,
): Promise<Fragment[] | null> {
  const [gaId, verificationTag] = await Promise.all([
    ctx.kv.get<string>("settings:googleAnalyticsId"),
    ctx.kv.get<string>("settings:googleVerification"),
  ]);

  const fragments: Fragment[] = [];

  if (gaId && GA_ID_PATTERN.test(gaId)) {
    fragments.push({
      kind: "external-script",
      placement: "head",
      src: `https://www.googletagmanager.com/gtag/js?id=${gaId}`,
      async: true,
      key: "gtag-script",
    });
    fragments.push({
      kind: "inline-script",
      placement: "head",
      code: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${gaId}');`,
      key: "gtag-config",
    });
  }

  if (verificationTag && VERIFICATION_PATTERN.test(verificationTag)) {
    fragments.push({
      kind: "html",
      placement: "head",
      html: `<meta name="google-site-verification" content="${verificationTag}">`,
      key: "google-verification",
    });
  }

  return fragments.length > 0 ? fragments : null;
}

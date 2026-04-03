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

function buildVerificationTag(
  name: string,
  content: string,
  key: string,
): Fragment | null {
  if (!content || !VERIFICATION_PATTERN.test(content)) return null;
  return {
    kind: "html",
    placement: "head",
    html: `<meta name="${name}" content="${content}">`,
    key,
  };
}

export async function fragmentsHandler(
  _event: unknown,
  ctx: FragmentsCtx,
): Promise<Fragment[] | null> {
  const [gaId, googleVerification, bingVerification, pinterestVerification, yandexVerification] =
    await Promise.all([
      ctx.kv.get<string>("settings:googleAnalyticsId"),
      ctx.kv.get<string>("settings:googleVerification"),
      ctx.kv.get<string>("settings:bingVerification"),
      ctx.kv.get<string>("settings:pinterestVerification"),
      ctx.kv.get<string>("settings:yandexVerification"),
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

  const verificationTags = [
    buildVerificationTag("google-site-verification", googleVerification ?? "", "google-verification"),
    buildVerificationTag("msvalidate.01", bingVerification ?? "", "bing-verification"),
    buildVerificationTag("p:domain_verify", pinterestVerification ?? "", "pinterest-verification"),
    buildVerificationTag("yandex-verification", yandexVerification ?? "", "yandex-verification"),
  ];

  for (const tag of verificationTags) {
    if (tag) fragments.push(tag);
  }

  return fragments.length > 0 ? fragments : null;
}

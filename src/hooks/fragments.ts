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
const GTM_ID_PATTERN = /^GTM-[A-Z0-9]+$/;
const ALPHANUMERIC_PATTERN = /^[a-zA-Z0-9_-]+$/;

// --- Injector functions ---

function injectGA4(gaId: string): Fragment[] {
  if (!gaId || !GA_ID_PATTERN.test(gaId)) return [];
  return [
    {
      kind: "external-script",
      placement: "head",
      src: `https://www.googletagmanager.com/gtag/js?id=${gaId}`,
      async: true,
      key: "gtag-script",
    },
    {
      kind: "inline-script",
      placement: "head",
      code: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${gaId}');`,
      key: "gtag-config",
    },
  ];
}

function injectGTM(containerId: string): Fragment[] {
  if (!containerId || !GTM_ID_PATTERN.test(containerId)) return [];
  return [
    {
      kind: "inline-script",
      placement: "head",
      code: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${containerId}');`,
      key: "gtm-script",
    },
    {
      kind: "html",
      placement: "body:start",
      html: `<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${containerId}" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`,
      key: "gtm-noscript",
    },
  ];
}

function injectCfAnalytics(token: string): Fragment[] {
  if (!token || !ALPHANUMERIC_PATTERN.test(token)) return [];
  return [
    {
      kind: "external-script",
      placement: "body:end",
      src: `https://static.cloudflareinsights.com/beacon.min.js`,
      defer: true,
      attributes: { "data-cf-beacon": `{"token":"${token}"}` },
      key: "cf-analytics",
    },
  ];
}

function injectFacebookPixel(pixelId: string): Fragment[] {
  if (!pixelId || !ALPHANUMERIC_PATTERN.test(pixelId)) return [];
  return [
    {
      kind: "inline-script",
      placement: "head",
      code: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId}');fbq('track','PageView');`,
      key: "fb-pixel",
    },
    {
      kind: "html",
      placement: "head",
      html: `<noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"/></noscript>`,
      key: "fb-pixel-noscript",
    },
  ];
}

// Raw HTML passthrough — trusted because only admins can write KV settings
function injectCustomScripts(headScripts: string, bodyScripts: string): Fragment[] {
  const fragments: Fragment[] = [];
  if (headScripts) {
    fragments.push({
      kind: "html",
      placement: "head",
      html: headScripts,
      key: "custom-head-scripts",
    });
  }
  if (bodyScripts) {
    fragments.push({
      kind: "html",
      placement: "body:end",
      html: bodyScripts,
      key: "custom-body-scripts",
    });
  }
  return fragments;
}

function buildVerificationTag(
  name: string,
  content: string,
  key: string,
): Fragment | null {
  if (!content || !ALPHANUMERIC_PATTERN.test(content)) return null;
  return {
    kind: "html",
    placement: "head",
    html: `<meta name="${name}" content="${content}">`,
    key,
  };
}

// --- Main handler ---

export async function fragmentsHandler(
  _event: unknown,
  ctx: FragmentsCtx,
): Promise<Fragment[] | null> {
  const [
    gaId, gtmId, cfToken, fbPixelId,
    customHead, customBody,
    googleV, bingV, pinterestV, yandexV,
  ] = await Promise.all([
    ctx.kv.get<string>("settings:googleAnalyticsId"),
    ctx.kv.get<string>("settings:gtmContainerId"),
    ctx.kv.get<string>("settings:cfAnalyticsToken"),
    ctx.kv.get<string>("settings:facebookPixelId"),
    ctx.kv.get<string>("settings:customHeadScripts"),
    ctx.kv.get<string>("settings:customBodyScripts"),
    ctx.kv.get<string>("settings:googleVerification"),
    ctx.kv.get<string>("settings:bingVerification"),
    ctx.kv.get<string>("settings:pinterestVerification"),
    ctx.kv.get<string>("settings:yandexVerification"),
  ]);

  const fragments: Fragment[] = [
    ...injectGA4(gaId ?? ""),
    ...injectGTM(gtmId ?? ""),
    ...injectCfAnalytics(cfToken ?? ""),
    ...injectFacebookPixel(fbPixelId ?? ""),
    ...injectCustomScripts(customHead ?? "", customBody ?? ""),
  ];

  const verificationTags = [
    buildVerificationTag("google-site-verification", googleV ?? "", "google-verification"),
    buildVerificationTag("msvalidate.01", bingV ?? "", "bing-verification"),
    buildVerificationTag("p:domain_verify", pinterestV ?? "", "pinterest-verification"),
    buildVerificationTag("yandex-verification", yandexV ?? "", "yandex-verification"),
  ];

  for (const tag of verificationTags) {
    if (tag) fragments.push(tag);
  }

  return fragments.length > 0 ? fragments : null;
}

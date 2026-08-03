import { pathToFileURL } from "node:url";
import { startStaticExportServer } from "./check-admin-demo-output.mjs";
import { basePathForLocale } from "./docs-locale-layout.mjs";

// 英文站在产物里的前缀（英文作根语言时为空串）。
const EN = basePathForLocale("en");

const productIds = [
  "p-ha-bag", "p-ha-jacket", "p-hb-x9", "p-hl-lamp", "p-hl-pot", "p-hl-quilt",
  "p-ho-bottle", "p-ho-shoe", "p-ho-tent", "p-hp-pro", "p-hs-air", "p-hw-coffee",
  "p-hw-fit", "p-hw-nuts", "p-hy-lip", "p-hy-serum",
];
const serviceIds = Array.from({ length: 8 }, (_, index) => `s${index + 1}`);
const workSlugs = ["codemarker", "flowctl", "inkpad", "marginalia", "pulse", "tide"];

export const TASK12_DEMO_ROUTES = [
  "live", "live/products", "live/review", "live/login", "live/room",
  "mobile", "mobile/categories", "mobile/orders", "mobile/profile",
  ...serviceIds.map((id) => `mobile/services/${id}`),
  "personal", "personal/guestbook", ...workSlugs.map((slug) => `personal/work/${slug}`),
  "shop", "shop/account", "shop/cart", "shop/checkout", "shop/compare", "shop/favorites",
  "shop/login", "shop/mobile", "shop/orders", "shop/products",
  ...productIds.map((id) => `shop/product/${id}`),
  "website", "website/contact", "website/pricing",
];

export const TASK12_ROUTE_MARKERS = Object.fromEntries(
  TASK12_DEMO_ROUTES.map((route) => {
    if (route === "live") return [route, "Live viewers"];
    if (route === "live/products") return [route, "Presentation order"];
    if (route === "live/review") return [route, "Conversion funnel"];
    if (route === "live/login") return [route, "AI live copilot"];
    if (route === "live/room") return [route, "HanSelect"];
    if (route === "mobile") return [route, "Popular services"];
    if (route === "mobile/categories") return [route, "Categories"];
    if (route === "mobile/orders") return [route, "My orders"];
    if (route === "mobile/profile") return [route, "Gold member"];
    if (route.startsWith("mobile/services/")) return [route, "Book now"];
    if (route === "personal") return [route, "I build things I want to use"];
    if (route === "personal/guestbook") return [route, "CodeFrame saved my technical posts"];
    if (route.includes("personal/work/codemarker")) return [route, "CodeFrame"];
    if (route.includes("personal/work/flowctl")) return [route, "flowctl"];
    if (route.includes("personal/work/inkpad")) return [route, "Inkbook"];
    if (route.includes("personal/work/marginalia")) return [route, "Whitespace"];
    if (route.includes("personal/work/pulse")) return [route, "Pulse"];
    if (route.includes("personal/work/tide")) return [route, "Tide"];
    if (route === "shop") return [route, "Flash sale"];
    if (route === "shop/products") return [route, "All products"];
    if (route.startsWith("shop/product/")) return [route, "Add to cart"];
    if (route === "shop/account") return [route, "Account"];
    if (route === "shop/cart") return [route, "Cart"];
    if (route === "shop/checkout") return [route, "Checkout"];
    if (route === "shop/compare") return [route, "Product comparison"];
    if (route === "shop/favorites") return [route, "Favorites"];
    if (route === "shop/login") return [route, "Sign in"];
    if (route === "shop/mobile") return [route, "Mobile store"];
    if (route === "shop/orders") return [route, "Orders"];
    if (route === "website") return [route, "Deploy, monitor"];
    if (route === "website/contact") return [route, "Tell us about your project"];
    return [route, "Choose a plan"];
  }),
);

export const TASK12_ACCESSIBLE_ATTRIBUTES = ["aria-label", "title", "alt", "placeholder"];
export const TASK12_INTERACTION_CHECKS = [
  "personal-guestbook-fail-once-recovery",
  "live-audience-support",
  "mobile-service-booking",
  "shop-product-retry-navigation",
  "website-pricing-navigation",
  "website-command-menu-navigation",
];
export const TASK12_FAILURE_MARKERS = [
  "Failed to load",
  "Submission failed",
  "Something went wrong",
  "Try again",
  "Retry",
];
export const TASK12_ROUTE_EXPECTED_PRECONDITIONS = {
  "personal/guestbook": ["Failed to load", "Try again", "Retry"],
  shop: ["Unable to load", "Try again", "Reload"],
  "shop/products": ["Unable to load", "Try again", "Retry"],
};
export const TASK12_RECOVERY_MARKERS = {
  "personal/guestbook": "CodeFrame saved my technical posts",
  shop: "Flash sale",
  "shop/products": "All products",
};

const CJK_OR_FULLWIDTH = /[\p{Script=Han}\u3000-\u303F\uFE10-\uFE1F\uFE30-\uFE4F\uFF01-\uFF20\uFF3B-\uFF40\uFF5B-\uFF65]/u;

export function collectCjkLines(text) {
  return text.split("\n").filter((line) => CJK_OR_FULLWIDTH.test(line)).slice(0, 12);
}

export function decodeTextBearingSvgDataUri(dataUri) {
  if (typeof dataUri !== "string" || !dataUri.startsWith("data:image/svg+xml")) return "";
  const comma = dataUri.indexOf(",");
  if (comma < 0) return "";
  try {
    const metadata = dataUri.slice(0, comma);
    const payload = dataUri.slice(comma + 1);
    const svg = metadata.includes(";base64")
      ? Buffer.from(payload, "base64").toString("utf8")
      : decodeURIComponent(payload);
    return /<text(?:\s|>)/i.test(svg) ? svg : "";
  } catch {
    return "";
  }
}

export function collectUnexpectedFailureMarkers(text, allowedMarkers = []) {
  const allowed = new Set(allowedMarkers);
  return TASK12_FAILURE_MARKERS.filter((marker) => text.includes(marker) && !allowed.has(marker));
}

async function assertEnglishPage(page, context) {
  // 前缀必须**当参数传进浏览器上下文**：evaluate 的回调是序列化后在页面里执行的，
  // Node 侧的闭包变量（这里是 EN）在那边不存在，直接引用会 ReferenceError。
  const { surfaces, invalidDemoLinks, svgDataUris } = await page.evaluate(
    ({ attributes, en }) => {
      const values = [document.body.innerText];
      for (const attribute of attributes) {
        for (const element of document.querySelectorAll(`[${attribute}]`)) {
          const value = element.getAttribute(attribute);
          if (value) values.push(`${attribute}: ${value}`);
        }
      }
      // 英文产物里每条站内 demo 链接都该以英文前缀开头（英文挂根路径时该前缀是空串，
      // 于是正确形态就是裸 /demos/...）。不合这个形状的一律抓出来：既覆盖「混进了另一
      // 语种的地址」，也覆盖「前缀重复」。
      const invalidDemoLinks = Array.from(document.querySelectorAll("a[href]"))
        .map((element) => element.getAttribute("href"))
        .filter(
          (href) =>
            href?.startsWith("/") && href.includes("/demos") && !href.startsWith(`${en}/demos`),
        );
      const svgDataUris = Array.from(document.querySelectorAll('img[src^="data:image/svg+xml"]'))
        .map((element) => element.getAttribute("src"))
        .filter(Boolean);
      return { surfaces: values.join("\n"), invalidDemoLinks, svgDataUris };
    },
    { attributes: TASK12_ACCESSIBLE_ATTRIBUTES, en: EN },
  );
  const decodedSvgText = svgDataUris.map(decodeTextBearingSvgDataUri).filter(Boolean).join("\n");
  const residue = collectCjkLines(`${surfaces}\n${decodedSvgText}`);
  if (residue.length) throw new Error(`${context} contains CJK or fullwidth text:\n${residue.join("\n")}`);
  if (invalidDemoLinks.length) {
    throw new Error(`${context} contains locale-breaking demo links:\n${invalidDemoLinks.join("\n")}`);
  }
}

async function assertNoUnexpectedFailure(page, context, allowed = []) {
  const failures = collectUnexpectedFailureMarkers(await page.locator("body").innerText(), allowed);
  if (failures.length) throw new Error(`${context} rendered unexpected failure UI: ${failures.join(", ")}`);
}

async function assertEnglishLocation(page, pathname) {
  await page.waitForURL((url) => url.pathname === pathname);
  if ((await page.locator("html").getAttribute("lang")) !== "en") {
    throw new Error(`${pathname} lost the English document language`);
  }
}

export async function scanTask12DemoOutput(outputRoot = "apps/www/out") {
  const { chromium } = await import("playwright");
  const { server, origin } = await startStaticExportServer(outputRoot);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const browserErrors = [];
  page.on("pageerror", (error) => browserErrors.push(error.message));
  try {
    const routeErrors = [];
    for (const route of TASK12_DEMO_ROUTES) {
      const pathname = `${EN}/demos/${route}`;
      const response = await page.goto(`${origin}${pathname}`, { waitUntil: "networkidle" });
      if (!response?.ok()) throw new Error(`${pathname} returned ${response?.status() ?? "no response"}`);
      if ((await page.locator("html").getAttribute("lang")) !== "en") {
        throw new Error(`${pathname} is not marked as English`);
      }
      try {
        const preconditions = TASK12_ROUTE_EXPECTED_PRECONDITIONS[route] ?? [];
        if (preconditions.length) {
          await page.getByText(preconditions[0], { exact: false }).first().waitFor({
            state: "visible",
            timeout: 10_000,
          });
          await assertEnglishPage(page, `${pathname} designed failure state`);
          await assertNoUnexpectedFailure(page, `${pathname} designed failure state`, preconditions);
          await page.getByRole("button", { name: preconditions.at(-1) }).click();
        }
        const recoveredMarker = TASK12_RECOVERY_MARKERS[route] ?? TASK12_ROUTE_MARKERS[route];
        await page.getByText(recoveredMarker, { exact: false }).first().waitFor({
          state: "visible",
          timeout: 10_000,
        });
        await assertEnglishPage(page, `${pathname}${preconditions.length ? " recovered" : ""}`);
        await assertNoUnexpectedFailure(page, `${pathname}${preconditions.length ? " recovered" : ""}`);
      } catch (error) {
        routeErrors.push(error instanceof Error ? error.message : String(error));
      }
    }
    if (routeErrors.length) throw new Error(`Task 12 route scan failed:\n${routeErrors.join("\n\n")}`);

    await page.goto(`${origin}${EN}/demos/personal/guestbook`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Retry" }).click();
    await page.getByText("CodeFrame saved my technical posts", { exact: false }).waitFor({
      state: "visible",
    });
    await assertEnglishPage(page, "personal guestbook after recovery");
    await assertNoUnexpectedFailure(page, "personal guestbook after recovery");

    await page.goto(`${origin}${EN}/demos/live/room`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "AI support" }).click();
    const supportInput = page.getByPlaceholder("Ask support about sizing, offers, or delivery...");
    await supportInput.fill("When will it ship?");
    await supportInput.press("Enter");
    await page.getByText("Orders placed tonight ship within 48 hours", { exact: false }).waitFor();
    await assertEnglishPage(page, "live audience support response");

    await page.goto(`${origin}${EN}/demos/mobile/services/s1`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Book now" }).click();
    await page.getByText("Booked", { exact: false }).first().waitFor({ state: "visible" });
    await assertEnglishPage(page, "mobile service booking");

    await page.goto(`${origin}${EN}/demos/shop`, { waitUntil: "networkidle" });
    const shopRetry = page.getByRole("button", { name: "Reload" });
    const productLink = page.locator(`a[href^="${EN}/demos/shop/product/"]`).first();
    await shopRetry.or(productLink).first().waitFor({ state: "visible" });
    if (await shopRetry.isVisible()) await shopRetry.click();
    await productLink.waitFor({ state: "visible" });
    await productLink.click();
    await page.waitForURL((url) => url.pathname.startsWith(`${EN}/demos/shop/product/`));
    await assertEnglishPage(page, "shop product after same-language navigation");
    await assertNoUnexpectedFailure(page, "shop product after recovery");

    await page.goto(`${origin}${EN}/demos/website`, { waitUntil: "networkidle" });
    await page.getByRole("link", { name: "Pricing" }).first().click();
    await assertEnglishLocation(page, `${EN}/demos/website/pricing`);
    await page.getByText("Choose a plan", { exact: false }).first().waitFor();
    await assertEnglishPage(page, "website pricing navigation");

    await page.goto(`${origin}${EN}/demos/website`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Open search (⌘K)" }).click();
    await page.getByRole("option", { name: /Pricing/ }).click();
    await assertEnglishLocation(page, `${EN}/demos/website/pricing`);
    await page.getByText("Choose a plan", { exact: false }).first().waitFor();
    await assertEnglishPage(page, "website command menu navigation");

    if (browserErrors.length) throw new Error(`Browser page errors:\n${browserErrors.join("\n")}`);
    return { routes: TASK12_DEMO_ROUTES.length, interactions: TASK12_INTERACTION_CHECKS.length };
  } finally {
    await browser.close();
    await new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const result = await scanTask12DemoOutput(process.argv[2] ?? "apps/www/out");
  console.log(
    `Task 12 demo browser scan passed: ${result.routes} routes, ${result.interactions} interactions.`,
  );
}

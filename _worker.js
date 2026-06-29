const ROOT = "C:\\Users\\Administrator\\Documents\\Mstore";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";

    try {
      if (path === "/ap" || path === "/ap/app-list") {
        const catalog = await loadCatalog(request, env);
        return textResponse(buildAppList(catalog), {
          "content-type": "application/octet-stream",
          "banner": "0",
          "cache-control": "public, max-age=60"
        });
      }

      if (path === "/ap/apps") {
        const catalog = await loadCatalog(request, env);
        const app = findRequestedApp(request, catalog);
        if (!app) return textResponse("App not found", { status: 404 });
        return assetResponse(request, env, `/apks/${app.apk}`, {
          "content-type": "application/vnd.android.package-archive",
          "content-disposition": `attachment; filename="${safeFilename(app.apk)}"`,
          "cache-control": "public, max-age=3600"
        });
      }

      if (path === "/ap/descriptions") {
        const catalog = await loadCatalog(request, env);
        const app = findRequestedApp(request, catalog);
        if (!app) return textResponse("Description not found", { status: 404 });
        return textResponse(app.description || app.name, {
          "content-type": "text/plain; charset=utf-8",
          "cache-control": "public, max-age=300"
        });
      }

      if (path.startsWith("/ap/images/")) {
        const catalog = await loadCatalog(request, env);
        const app = findRequestedApp(request, catalog);
        if (!app) return textResponse("Image not found", { status: 404 });
        const imagePath = pickImagePath(request, app);
        return assetResponse(request, env, imagePath, {
          "cache-control": "public, max-age=3600"
        });
      }

      const legacy = legacyAssetPath(path);
      if (legacy) return env.ASSETS.fetch(new Request(new URL(legacy, url), request));

      return env.ASSETS.fetch(request);
    } catch (error) {
      return textResponse(`BPStore error: ${error?.message || error}`, { status: 500 });
    }
  }
};

async function loadCatalog(request, env) {
  const assetUrl = new URL("/ap/catalog.json", request.url);
  const response = await env.ASSETS.fetch(new Request(assetUrl, request));
  if (!response.ok) throw new Error("catalog.json not found");
  return response.json();
}

function buildAppList(catalog) {
  return (catalog.categories || [])
    .map((category) => {
      const apps = (category.apps || []).map((app) => {
        const fileName = app.storeFile || app.apk || `${app.name}.apk`;
        const winPath = `${ROOT}\\${category.name}\\${fileName}`;
        return `${app.name}__${app.version || "1.0"}__${winPath}`;
      });
      return [category.name, ...apps].join("!@#");
    })
    .filter(Boolean)
    .join("\n");
}

function findRequestedApp(request, catalog) {
  const logicalPath = extractLogicalPath(request);
  const normalized = normalizeLogicalPath(logicalPath);
  const apps = flattenApps(catalog);

  if (normalized) {
    const fileName = basename(normalized).toLowerCase();
    const stem = stripExtension(fileName);
    const categoryName = normalized.split("/")[0]?.toLowerCase();

    const exact = apps.find(({ category, app }) => {
      const apkName = (app.storeFile || app.apk || `${app.name}.apk`).toLowerCase();
      return category.name.toLowerCase() === categoryName &&
        (fileName === apkName ||
          stem === app.name.toLowerCase() ||
          stem === `${app.name.toLowerCase()}_banner` ||
          stem.startsWith(`${app.name.toLowerCase()}_`));
    });
    if (exact) return exact.app;

    const loose = apps.find(({ app }) => {
      const apkName = (app.storeFile || app.apk || `${app.name}.apk`).toLowerCase();
      return fileName === apkName ||
        stem === app.name.toLowerCase() ||
        stem === `${app.name.toLowerCase()}_banner` ||
        stem.startsWith(`${app.name.toLowerCase()}_`);
    });
    if (loose) return loose.app;
  }

  return apps.length === 1 ? apps[0].app : null;
}

function flattenApps(catalog) {
  const out = [];
  for (const category of catalog.categories || []) {
    for (const app of category.apps || []) out.push({ category, app });
  }
  return out;
}

function extractLogicalPath(request) {
  const url = new URL(request.url);
  const fromHeader = request.headers.get("path") ||
    request.headers.get("x-path") ||
    request.headers.get("file") ||
    request.headers.get("x-file");
  if (fromHeader) return decodeMaybeBase64(fromHeader);

  if (url.pathname.startsWith("/ap/images/")) {
    const last = decodeURIComponent(url.pathname.substring("/ap/images/".length));
    return decodeMaybeBase64(stripExtension(last));
  }

  const queryPath = url.searchParams.get("path") || url.searchParams.get("file");
  return queryPath ? decodeMaybeBase64(queryPath) : "";
}

function decodeMaybeBase64(value) {
  const decoded = decodeURIComponent(value || "").trim();
  if (!decoded) return "";
  const compact = decoded.replace(/\s/g, "");
  if (/^[A-Za-z0-9+/_-]+={0,2}$/.test(compact) && compact.length >= 8) {
    try {
      const normalized = compact.replace(/-/g, "+").replace(/_/g, "/");
      const text = atob(normalized);
      if (/[\w .:/\\-]+/.test(text) && (text.includes("/") || text.includes("\\") || text.includes("."))) {
        return text;
      }
    } catch (_) {
      // Not base64; keep original value.
    }
  }
  return decoded;
}

function normalizeLogicalPath(value) {
  let text = (value || "").replace(/\\/g, "/").replace(/\0/g, "").trim();
  text = text.replace(/^file:\/+/i, "");
  const marker = "/Mstore/";
  const markerIndex = text.toLowerCase().indexOf(marker.toLowerCase());
  if (markerIndex >= 0) text = text.substring(markerIndex + marker.length);
  text = text.replace(/^[A-Za-z]:\/+/, "").replace(/^\/+/, "");
  return text;
}

function pickImagePath(request, app) {
  const logical = normalizeLogicalPath(extractLogicalPath(request));
  const fileName = basename(logical).toLowerCase();
  const stem = stripExtension(fileName);
  const appStem = app.name.toLowerCase();

  if (stem === appStem && app.icon) return `/icons/${app.icon}`;
  if (stem === `${appStem}_banner` && app.banner) return `/banners/${app.banner}`;

  const screenshotMatch = stem.match(new RegExp(`^${escapeRegExp(appStem)}_(\\d+)$`));
  if (screenshotMatch) {
    const index = Number(screenshotMatch[1]);
    const screenshots = app.screenshots || [];
    if (screenshots[index]) return `/banners/${screenshots[index]}`;
  }

  if (app.banner) return `/banners/${app.banner}`;
  if (app.icon) return `/icons/${app.icon}`;
  return "/banners/phim4k-banner.jpg";
}

async function assetResponse(request, env, assetPath, extraHeaders = {}) {
  const assetUrl = new URL(assetPath, request.url);
  const response = await env.ASSETS.fetch(new Request(assetUrl, request));
  if (!response.ok) return textResponse("Asset not found", { status: 404 });
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(extraHeaders)) headers.set(key, value);
  headers.set("access-control-allow-origin", "*");
  headers.set("x-bpstore-worker", "1");
  return new Response(response.body, { status: response.status, headers });
}

function textResponse(body, init = {}) {
  const { status = 200, ...headerInit } = init;
  const headers = new Headers(headerInit);
  if (!headers.has("content-type")) headers.set("content-type", "text/plain; charset=utf-8");
  headers.set("access-control-allow-origin", "*");
  headers.set("x-bpstore-worker", "1");
  return new Response(body, { status, headers });
}

function legacyAssetPath(path) {
  const map = {
    "/": "/apps.json",
    "/apps": "/apps.json",
    "/api/apps": "/apps.json",
    "/repo": "/repo.json",
    "/listapp.json": "/danhsachapp/listapp.json",
    "/ap/api/apps": "/ap/app-list",
    "/ap/listapp": "/ap/listapp.json",
    "/ap/repo": "/repo.json",
    "/ap/repo.json": "/repo.json"
  };
  if (map[path]) return map[path];
  if (path.startsWith("/ap/apks/")) return path.replace(/^\/ap\/apks\//, "/apks/");
  if (path.startsWith("/ap/icons/")) return path.replace(/^\/ap\/icons\//, "/icons/");
  if (path.startsWith("/ap/banners/")) return path.replace(/^\/ap\/banners\//, "/banners/");
  return "";
}

function basename(value) {
  return (value || "").split("/").filter(Boolean).pop() || "";
}

function stripExtension(value) {
  return (value || "").replace(/\.[^.]+$/, "");
}

function safeFilename(value) {
  return (value || "app.apk").replace(/[\\/:*?"<>|]/g, "_");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

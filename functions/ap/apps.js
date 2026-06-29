import { findRequestedApp, loadCatalog, safeFilename, staticAsset, textResponse } from "../_bpstore.js";

export async function onRequestGet({ request }) {
  try {
    const catalog = await loadCatalog(request);
    const app = findRequestedApp(request, catalog);
    if (!app) return textResponse("App not found", { status: 404 });

    return staticAsset(request, `/apks/${app.apk}`, {
      "content-type": "application/vnd.android.package-archive",
      "content-disposition": `attachment; filename="${safeFilename(app.apk)}"`,
      "cache-control": "public, max-age=3600"
    });
  } catch (error) {
    return textResponse(`BPStore error: ${error?.message || error}`, { status: 500 });
  }
}

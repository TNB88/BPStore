import { findRequestedApp, loadCatalog, textResponse } from "../_bpstore.js";

export async function onRequestGet({ request }) {
  try {
    const catalog = await loadCatalog(request);
    const app = findRequestedApp(request, catalog);
    if (!app) return textResponse("Description not found", { status: 404 });

    return textResponse(app.description || app.name, {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=300"
    });
  } catch (error) {
    return textResponse(`BPStore error: ${error?.message || error}`, { status: 500 });
  }
}

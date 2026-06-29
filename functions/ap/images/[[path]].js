import { findRequestedApp, loadCatalog, pickImagePath, staticAsset, textResponse } from "../../_bpstore.js";

export async function onRequestGet({ request }) {
  try {
    const catalog = await loadCatalog(request);
    const app = findRequestedApp(request, catalog);
    if (!app) return textResponse("Image not found", { status: 404 });

    return staticAsset(request, pickImagePath(request, app), {
      "cache-control": "public, max-age=3600"
    });
  } catch (error) {
    return textResponse(`BPStore error: ${error?.message || error}`, { status: 500 });
  }
}

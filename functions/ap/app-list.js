import { buildAppList, loadCatalog, textResponse } from "../_bpstore.js";

export async function onRequestGet({ request }) {
  try {
    const catalog = await loadCatalog(request);
    return textResponse(buildAppList(catalog), {
      "content-type": "application/octet-stream",
      "banner": "0",
      "cache-control": "public, max-age=60"
    });
  } catch (error) {
    return textResponse(`BPStore error: ${error?.message || error}`, { status: 500 });
  }
}

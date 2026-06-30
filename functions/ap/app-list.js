import { buildAppList, loadCatalog, textResponse } from "../_bpstore.js";

export async function onRequestGet({ request }) {
  try {
    const catalog = await loadCatalog(request);
    return textResponse(buildAppList(catalog), {
      "content-type": "text/plain; charset=utf-8",
      "banner": "0",
      "cache-control": "public, max-age=60"
    });
  } catch (error) {
    return textResponse(`BPStore error: ${error?.message || error}`, { status: 500 });
  }
}

const RAW_BASE = "https://raw.githubusercontent.com/TNB88/BPStore/refs/heads/main";

async function fetchJson(path) {
  const response = await fetch(`${RAW_BASE}/${path}`, {
    headers: {
      "User-Agent": "BPStore-Worker",
      "Accept": "application/json"
    },
    cf: {
      cacheTtl: 60,
      cacheEverything: true
    }
  });

  const body = await response.text();
  return new Response(body, {
    status: response.status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "cache-control": "public, max-age=60"
    }
  });
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const pathname = url.pathname.replace(/\/+$/, "") || "/";

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "access-control-allow-origin": "*",
          "access-control-allow-methods": "GET, OPTIONS",
          "access-control-allow-headers": "*"
        }
      });
    }

    if (pathname === "/" || pathname === "/apps" || pathname === "/api/apps" || pathname === "/apps.json") {
      return fetchJson("apps.json");
    }

    if (pathname === "/repo" || pathname === "/repo.json") {
      return fetchJson("repo.json");
    }

    if (pathname.startsWith("/apks/") || pathname.startsWith("/icons/") || pathname.startsWith("/banners/")) {
      return Response.redirect(`${RAW_BASE}${pathname}`, 302);
    }

    return new Response(JSON.stringify({
      ok: true,
      name: "BPStore",
      endpoints: ["/apps", "/repo", "/apps.json", "/repo.json"]
    }), {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "access-control-allow-origin": "*"
      }
    });
  }
};

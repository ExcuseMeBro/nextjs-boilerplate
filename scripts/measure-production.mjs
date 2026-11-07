import assert from "node:assert/strict";
import { createServer } from "node:http";
import { gzipSync } from "node:zlib";
import next from "next";

// Run against a fresh production build. No browser, credentials, or upstream calls.
const app = next({ dev: false, hostname: "127.0.0.1" });
await app.prepare();
const server = createServer(app.getRequestHandler());
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
try {
  const results = [];
  for (const locale of ["en", "uz", "ru"]) {
    const response = await fetch(`${origin}/${locale}`);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.ok(html.includes(`lang="${locale}"`));
    const assets = [
      ...new Set(
        [...html.matchAll(/(?:src|href)="([^" ]*\/_next\/static\/[^" ]+)"/g)].map(
          (match) => match[1],
        ),
      ),
    ];
    let jsBytes = 0;
    let jsGzipBytes = 0;
    let jsRequests = 0;
    for (const asset of assets) {
      const resource = await fetch(new URL(asset, origin));
      assert.equal(resource.status, 200);
      const bytes = Buffer.from(await resource.arrayBuffer());
      if (asset.endsWith(".js")) {
        jsRequests++;
        jsBytes += bytes.length;
        jsGzipBytes += gzipSync(bytes).length;
      }
    }
    results.push({
      locale,
      jsBytes,
      jsGzipBytes,
      jsRequests,
      documentAndStaticRequests: assets.length + 1,
    });
  }
  const session = await fetch(`${origin}/api/auth/me`);
  assert.equal(session.status, 401);
  console.log(
    JSON.stringify(
      {
        scope: "HTML-declared assets only; no hydration, navigation, or timing claim",
        results,
        unauthenticatedSessionStatus: session.status,
      },
      null,
      2,
    ),
  );
} finally {
  server.closeAllConnections();
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
  await app.close();
}

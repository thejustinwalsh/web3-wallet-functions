import { test } from "node:test";
import * as assert from "node:assert";
import { build } from "../helper";

test("wallet is loaded", async (t) => {
  const app = await build(t);
  const res = await app.inject({
    url: "/wallet/health",
  });
  assert.equal(res.payload, JSON.stringify({ status: "ok" }));
});

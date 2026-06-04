import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "../..");

test("public waitlist page uses restored editorial card imagery and airline life marketing copy", async () => {
  const pageSource = await readFile(path.join(rootDir, "app/page.tsx"), "utf8");

  assert.match(pageSource, /headlineAccent}>airline life\./);
  assert.match(pageSource, /Trusted base intel and layover knowledge for airline life\./);
  assert.doesNotMatch(pageSource, /invite-only/);
  assert.match(pageSource, /"\/jmpseat\/base-boards-v2\.png"/);
  assert.match(pageSource, /"\/jmpseat\/layover-boards-v2\.png"/);
  assert.match(pageSource, /"\/jmpseat\/verified-rooms-v2\.png"/);
  assert.match(pageSource, /"\/jmpseat\/verified-access-v2\.png"/);
});

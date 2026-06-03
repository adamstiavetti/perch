import test from "node:test";
import assert from "node:assert/strict";

import {
  PRIVATE_SHELL_MESSAGE,
  PRIVATE_SHELL_NAV_ITEMS,
  PRIVATE_SHELL_ROUTE,
} from "../../src/lib/privateApp/privateShellPlaceholder.ts";

test("private shell route stays anchored to /app", () => {
  assert.equal(PRIVATE_SHELL_ROUTE, "/app");
});

test("private shell message stays honest about locked beta access", () => {
  assert.equal(PRIVATE_SHELL_MESSAGE.eyebrow, "Skybyrd Private Beta");
  assert.equal(PRIVATE_SHELL_MESSAGE.title, "Access is not open yet.");
  assert.match(
    PRIVATE_SHELL_MESSAGE.description,
    /reserved for verified airline-worker beta access/i,
  );
  assert.match(
    PRIVATE_SHELL_MESSAGE.detail,
    /verification and login are coming in a later epoch/i,
  );
});

test("private shell exposes only disabled placeholder nav items", () => {
  assert.deepEqual(
    PRIVATE_SHELL_NAV_ITEMS.map((item) => item.label),
    [
      "Home Base",
      "Base Boards",
      "Layover Boards",
      "Verified Rooms",
      "Profile",
      "Verification",
      "Admin",
    ],
  );

  for (const item of PRIVATE_SHELL_NAV_ITEMS) {
    assert.equal(item.disabled, true);
    assert.ok(item.description.length > 0);
  }
});

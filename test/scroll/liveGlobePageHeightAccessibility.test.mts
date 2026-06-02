import test from "node:test";
import assert from "node:assert/strict";

import {
  getMaxReachableScrollProgress,
  LIVE_GLOBE_PAGE_HEIGHT_MULTIPLIERS,
} from "../../src/lib/scroll/liveGlobePageMetrics.ts";

test("desktop page height budget can reach the full transition distance", () => {
  const maxReachableProgress = getMaxReachableScrollProgress({
    pageHeightMultiplier: LIVE_GLOBE_PAGE_HEIGHT_MULTIPLIERS.desktop,
    transitionDistanceMultiplier: 3.1,
  });

  assert.ok(maxReachableProgress >= 1);
});

test("mobile page height budget remains at least as tall as the base viewport stack", () => {
  assert.ok(LIVE_GLOBE_PAGE_HEIGHT_MULTIPLIERS.mobile >= 3);
});

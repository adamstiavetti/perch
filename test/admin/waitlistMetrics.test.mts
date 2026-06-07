import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  buildWaitlistDashboardMetrics,
  maskWaitlistEmail,
} from "../../src/lib/admin/waitlistMetricsCore.ts";

const now = new Date("2026-06-07T18:00:00.000Z");

function signup(overrides = {}) {
  return {
    email: "crew.one@example.com",
    normalized_email: "crew.one@example.com",
    landing_path: "/",
    referrer: "https://ref.example/path",
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    utm_content: null,
    utm_term: null,
    survey_completed_at: null,
    created_at: "2026-06-07T12:00:00.000Z",
    waitlist_survey_responses: [],
    ...overrides,
  };
}

test("waitlist metrics compute aggregate signup and survey counts from fixture data", () => {
  const metrics = buildWaitlistDashboardMetrics(
    [
      signup({
        normalized_email: "crew.one@example.com",
        survey_completed_at: "2026-06-07T12:05:00.000Z",
        waitlist_survey_responses: [
          {
            aviation_connection: "Flight attendant",
            priority_base: "DFW",
            useful_first: [
              "Base tips from people who actually work there",
              "Verified crew lounges based on role",
            ],
            current_tools: ["Reddit"],
            verification_comfort:
              "Comfortable using my company airline email later",
            beta_help: ["I only want launch updates for now"],
            discovery_source: "Team outreach",
            created_at: "2026-06-07T12:05:00.000Z",
          },
        ],
      }),
      signup({
        normalized_email: "crew.two@example.com",
        created_at: "2026-06-02T12:00:00.000Z",
        utm_source: "instagram",
        waitlist_survey_responses: [
          {
            aviation_connection: "Pilot",
            priority_base: "employee id 123",
            useful_first: ["Commuter or non-rev-adjacent tips"],
            current_tools: ["Group chats or text threads"],
            verification_comfort: "I need more privacy details first",
            beta_help: ["I would do a short interview"],
            discovery_source: "Instagram or TikTok",
            created_at: "2026-06-02T12:05:00.000Z",
          },
        ],
      }),
      signup({
        normalized_email: "crew.three@example.com",
        created_at: "2026-05-01T12:00:00.000Z",
        waitlist_survey_responses: [],
      }),
    ],
    now,
  );

  assert.equal(metrics.totalSignups, 3);
  assert.equal(metrics.signupsToday, 1);
  assert.equal(metrics.signupsLast7Days, 2);
  assert.equal(metrics.signupsLast30Days, 2);
  assert.equal(metrics.surveyCompletedCount, 2);
  assert.equal(metrics.surveyCompletionRate, 67);
  assert.deepEqual(metrics.topAviationConnections, [
    { label: "Flight attendant", count: 1 },
    { label: "Pilot", count: 1 },
  ]);
  assert.deepEqual(metrics.topDesiredFeatures, [
    { label: "Base tips from people who actually work there", count: 1 },
    { label: "Commuter or non-rev-adjacent tips", count: 1 },
    { label: "Verified crew lounges based on role", count: 1 },
  ]);
  assert.deepEqual(metrics.topBaseValues, [{ label: "DFW", count: 1 }]);
  assert.deepEqual(metrics.topDiscoverySources, [
    { label: "Instagram or TikTok", count: 1 },
    { label: "Team outreach", count: 1 },
  ]);
  assert.deepEqual(metrics.topAttributionSources, [
    { label: "ref.example", count: 2 },
    { label: "instagram", count: 1 },
  ]);
});

test("waitlist metrics mask recent signup emails and do not expose raw identifiers", () => {
  const metrics = buildWaitlistDashboardMetrics([
    signup({
      normalized_email: "private.user@example.com",
      survey_completed_at: "2026-06-07T12:05:00.000Z",
      waitlist_survey_responses: [
        {
          aviation_connection: "Flight attendant",
          priority_base: "LAX",
          useful_first: ["Layover recommendations"],
          current_tools: ["Coworkers or friends"],
          verification_comfort: "Not applicable yet",
          beta_help: ["I only want launch updates for now"],
          discovery_source: "Friend or coworker",
          created_at: "2026-06-07T12:05:00.000Z",
        },
      ],
    }),
  ]);

  assert.equal(maskWaitlistEmail("private.user@example.com"), "p...@example.com");
  assert.equal(metrics.recentSignups[0]?.maskedEmail, "p...@example.com");
  assert.equal(metrics.recentSignups[0]?.priorityBase, "LAX");
  assert.doesNotMatch(JSON.stringify(metrics), /private\.user@example\.com/i);
  assert.doesNotMatch(JSON.stringify(metrics), /survey_token|row_id|user_id|uuid/i);
});

test("waitlist aggregate metrics stay accurate beyond the recent display cap", () => {
  const rows = Array.from({ length: 650 }, (_, index) => {
    const isToday = index < 10;
    const isLast7Days = index < 120;
    const isLast30Days = index < 520;
    const hasSurveyResponse = index < 325;

    return signup({
      normalized_email: `crew.${index}@example.com`,
      created_at: isToday
        ? "2026-06-07T12:00:00.000Z"
        : isLast7Days
          ? "2026-06-03T12:00:00.000Z"
          : isLast30Days
            ? "2026-05-20T12:00:00.000Z"
            : "2026-04-01T12:00:00.000Z",
      survey_completed_at: hasSurveyResponse
        ? "2026-06-07T12:05:00.000Z"
        : null,
      waitlist_survey_responses: hasSurveyResponse
        ? [
            {
              aviation_connection:
                index % 2 === 0 ? "Flight attendant" : "Pilot",
              priority_base: index % 3 === 0 ? "DFW" : "LAX",
              useful_first: ["Verified crew lounges based on role"],
              current_tools: ["Group chats or text threads"],
              verification_comfort:
                "Comfortable using my company airline email later",
              beta_help: ["I only want launch updates for now"],
              discovery_source: index % 4 === 0 ? "Team outreach" : "Instagram or TikTok",
              created_at: "2026-06-07T12:05:00.000Z",
            },
          ]
        : [],
    });
  });

  const metrics = buildWaitlistDashboardMetrics(rows, now, rows.slice(0, 50));

  assert.equal(metrics.totalSignups, 650);
  assert.equal(metrics.signupsToday, 10);
  assert.equal(metrics.signupsLast7Days, 120);
  assert.equal(metrics.signupsLast30Days, 520);
  assert.equal(metrics.surveyCompletedCount, 325);
  assert.equal(metrics.surveyCompletionRate, 50);
  assert.equal(metrics.recentSubmissionsCount, 12);
  assert.equal(metrics.recentSignups.length, 12);
  assert.ok(
    metrics.topDesiredFeatures.some(
      (feature) =>
        feature.label === "Verified crew lounges based on role" &&
        feature.count === 325,
    ),
  );
});

test("waitlist attribution preserves common safe UTM labels with underscores", () => {
  const metrics = buildWaitlistDashboardMetrics([
    signup({
      referrer: "https://fallback.example/path",
      utm_source: "ig_story",
    }),
    signup({
      referrer: "https://fallback.example/path",
      utm_source: null,
      utm_campaign: "public_waitlist_launch",
    }),
    signup({
      utm_source: "facebook_ads",
      utm_campaign: "ignored_campaign",
    }),
    signup({
      utm_source: "crew_base_push",
    }),
    signup({
      utm_source: "email_newsletter",
    }),
  ]);

  assert.deepEqual(metrics.topAttributionSources, [
    { label: "crew_base_push", count: 1 },
    { label: "email_newsletter", count: 1 },
    { label: "facebook_ads", count: 1 },
    { label: "ig_story", count: 1 },
    { label: "public_waitlist_launch", count: 1 },
  ]);
});

test("waitlist attribution rejects unsafe UTM labels before falling back safely", () => {
  const metrics = buildWaitlistDashboardMetrics([
    signup({
      referrer: "https://safe-referrer.example/path",
      landing_path: "/",
      utm_source: "private.user@example.com",
      utm_campaign: "token_private_campaign",
    }),
    signup({
      referrer: null,
      landing_path: "/",
      utm_source: "https://example.com/?token=secret",
      utm_campaign: "<script>alert(1)</script>",
    }),
  ]);

  assert.deepEqual(metrics.topAttributionSources, [
    { label: "/", count: 1 },
    { label: "safe-referrer.example", count: 1 },
  ]);
});

test("waitlist dashboard source stays operator-only and avoids sensitive display fields", () => {
  const pageSource = readFileSync(
    new URL("../../app/app/admin/waitlist/page.tsx", import.meta.url),
    "utf8",
  );
  const metricsSource = readFileSync(
    new URL("../../src/lib/admin/waitlistMetrics.ts", import.meta.url),
    "utf8",
  );
  const metricsCoreSource = readFileSync(
    new URL("../../src/lib/admin/waitlistMetricsCore.ts", import.meta.url),
    "utf8",
  );
  const combined = `${pageSource}\n${metricsSource}\n${metricsCoreSource}`;

  assert.match(pageSource, /WAITLIST_ADMIN_SCOPE/);
  assert.match(pageSource, /AUTH_ROUTES\.accessRestricted/);
  assert.match(pageSource, /masked recent submissions/i);
  assert.match(metricsCoreSource, /maskWaitlistEmail/);
  assert.match(metricsSource, /fetchAllWaitlistAggregateRows/);
  assert.match(metricsSource, /\.range\(from, to\)/);
  assert.match(metricsSource, /RECENT_QUERY_LIMIT/);
  assert.doesNotMatch(metricsSource, /\.limit\(500\)/);
  assert.doesNotMatch(combined, /proof upload|badge upload|document upload|portal credential|passenger information/i);
  assert.doesNotMatch(pageSource, /survey_token|normalized_email|waitlist_signups/i);
});

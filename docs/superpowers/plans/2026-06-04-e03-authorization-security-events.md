# E03-T07 Plan

- add a bounded `security_events` migration with audit-oriented indexes and non-public RLS
- add server-only security-event taxonomy and fail-soft recorder helpers
- integrate event recording into auth actions, auth callback, profile save, post-auth beta check, and private-route gate surfaces
- document the explicit authorization baseline and current event-recording limits
- validate the new event layer without expanding into admin, moderation, verification, or storage work

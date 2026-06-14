import type { PolicyPageSection } from "./PolicyPage";

export type PolicyPageContent = {
  title: string;
  description: string;
  eyebrow: string;
  lede: string;
  sections: readonly PolicyPageSection[];
};

export const betaTermsContent: PolicyPageContent = {
  title: "Private Beta Terms",
  description: "Draft private-beta terms for jmpseat.",
  eyebrow: "private beta terms",
  lede:
    "jmpseat is an invite-based private beta for verified aviation workers. The product is utility first, community second, and social feed last.",
  sections: [
    {
      title: "Beta Access",
      paragraphs: [
        "Access is limited, invite-based, and may be changed, paused, or removed while the product is being tested.",
        "jmpseat may change features, adjust policies, limit access, fix bugs, or pause community activity during the beta. There is no uptime or feature availability guarantee.",
      ],
    },
    {
      title: "Identity Model",
      paragraphs: [
        "jmpseat is verified privately, anonymous publicly, and accountable internally.",
        "Your public display may use a handle or safe member label. jmpseat may still connect content, reports, verification state, and moderation records to an account when needed for safety, support, security, policy enforcement, or legal reasons.",
      ],
    },
    {
      title: "Allowed Use",
      items: [
        "Ask practical DFW base, commute, parking, terminal, food, coffee, and layover questions.",
        "Share safe utility knowledge for verified aviation workers.",
        "Report privacy, safety, spam, harassment, or community-rule concerns.",
        "Use official or employer sources for live operations, security procedures, current policies, duty/rest timing, and safety-critical decisions.",
      ],
    },
    {
      title: "Not Allowed",
      items: [
        "Passenger private information.",
        "Airport or security procedures.",
        "Live operations-sensitive information.",
        "Exact crew hotel exposure or live crew location.",
        "Confidential company documents, portal screenshots, or employer-private materials.",
        "Airline portal login, schedule scraping, roster/calendar integrations, flight loads, or non-rev load tooling.",
        "Harassment, threats, doxxing, impersonation, spam, scams, dating/swiping, public crew tracking, marketplace payments, or AI-generated operational advice presented as authoritative.",
      ],
    },
    {
      title: "Moderation",
      paragraphs: [
        "Current moderation supports DFW Channel post reporting and operator-scoped review. Visible operator actions are narrow hide/remove actions.",
        "Account bans, AI final moderation decisions, public moderation feeds, public reporter identity, and public report counts are not part of the current foundation.",
      ],
    },
    {
      title: "Independence",
      paragraphs: [
        "jmpseat is independent and is not sponsored by or affiliated with any airline, airport, union, or employer.",
        "jmpseat is not an official operational source.",
      ],
    },
  ],
};

export const privacyNoticeContent: PolicyPageContent = {
  title: "Privacy Notice",
  description: "Draft private-beta privacy notice for jmpseat.",
  eyebrow: "private beta privacy",
  lede:
    "This private-beta notice explains the information jmpseat may collect and how public anonymity remains separate from internal accountability.",
  sections: [
    {
      title: "What jmpseat may collect",
      items: [
        "Account email, authentication state, password reset, and account confirmation events.",
        "Beta access state, invite status, profile completion, and operator/internal access signals where applicable.",
        "Public handle or safe display label, self-declared aviation fields, home-base/profile fields, and verification state.",
        "DFW Channel posts, report reasons/details, moderation status, operator actions, and audit/security events.",
        "Support, deletion/export, moderation appeal, and incident triage records if those manual paths are used.",
      ],
    },
    {
      title: "Work-email verification",
      paragraphs: [
        "jmpseat may use an aviation work-email domain and confirmation state to help determine private-beta eligibility.",
        "Using work email may create records in employer-managed email systems. jmpseat cannot control employer email logs, monitoring, retention, or access.",
      ],
    },
    {
      title: "Public vs internal visibility",
      paragraphs: [
        "Other eligible beta users may see a safe handle or member label, post title/body, safe post metadata, and channel context.",
        "jmpseat should not publicly show reporter identity, report counts, full work email, author user IDs, board/base/parent IDs, proof artifacts, storage paths, signed URLs, private admin notes, or private identity fields.",
      ],
    },
    {
      title: "Proof uploads",
      paragraphs: [
        "Proof uploads are not part of the current active private-beta path.",
        "If manual or redacted proof upload is reactivated later, it requires fresh implementation, privacy/security review, reviewer access controls, redaction instructions, and retention/deletion rules.",
      ],
    },
    {
      title: "Deletion and export",
      paragraphs: [
        "Deletion/export handling is a draft/manual process and implementation may be pending.",
        "Reports, moderation actions, security events, and abuse records may need limited retention for accountability, appeals, safety, or legal reasons.",
      ],
    },
  ],
};

export const communityRulesContent: PolicyPageContent = {
  title: "Community Rules",
  description: "Draft private-beta community rules for jmpseat.",
  eyebrow: "community rules",
  lede:
    "Help people, keep it practical, and protect privacy. jmpseat is for verified aviation workers sharing safe utility knowledge.",
  sections: [
    {
      title: "What belongs",
      items: [
        "DFW commuting, parking, terminal, food, coffee, break, and new-to-DFW questions.",
        "Layover planning ideas that avoid exact crew hotel exposure.",
        "Practical answers, respectful corrections, and safe updates from verified workers.",
        "Reports of content that creates privacy, safety, spam, or harassment risk.",
      ],
    },
    {
      title: "What does not belong",
      items: [
        "Passenger private information or exact crew hotel details.",
        "Live crew location, public nearby crew tracking, or real-time crew movement.",
        "Airport/security procedures, restricted access details, or screening workarounds.",
        "Live operations-sensitive information, staffing details, or live irregular-ops details.",
        "Confidential employer documents, portal screenshots, internal memos, or non-public policies.",
        "Harassment, doxxing, threats, impersonation, spam, scams, dating/swiping, marketplace payments, or transaction/dispute behavior.",
      ],
    },
    {
      title: "Reporting",
      paragraphs: [
        "Report content that appears unsafe, private, harassing, spammy, off-topic, or otherwise against these rules.",
        "Keep report details short and focused. Do not add extra private information to a report.",
        "Reporter identity is not public. Public report counts are not shown in the current product.",
      ],
    },
    {
      title: "Tone",
      paragraphs: [
        "Be direct, useful, and kind enough that another aviation worker can actually use the answer.",
        "Good disagreement is allowed. Personal attacks, pile-ons, targeted harassment, and identity exposure are not.",
      ],
    },
  ],
};

export const verificationPrivacyContent: PolicyPageContent = {
  title: "Verification & Privacy",
  description: "Draft verification and privacy copy for jmpseat private beta.",
  eyebrow: "verification privacy",
  lede:
    "jmpseat uses private verification to keep access focused while keeping ordinary public identity safe.",
  sections: [
    {
      title: "Work-email verification",
      paragraphs: [
        "jmpseat may use your aviation work-email domain and confirmation status to help confirm private-beta eligibility.",
        "Your full work email should not be shown as part of ordinary community display. Public identity should stay a safe handle or member label.",
      ],
    },
    {
      title: "Important caveat",
      paragraphs: [
        "Using work email may create records in employer-managed systems. Do not submit passwords, airline portal credentials, employee numbers, schedule screenshots, or confidential employer documents.",
      ],
    },
    {
      title: "Internal accountability",
      paragraphs: [
        "Private verification is not public exposure. jmpseat may still use verification status internally to operate access gates, enforce rules, review reports, handle support, and protect the beta.",
      ],
    },
    {
      title: "Proof uploads",
      paragraphs: [
        "Proof upload is not live in the current private-beta path.",
        "If reactivated later, proof upload copy must ask users to redact unnecessary sensitive information and must limit proof visibility to authorized reviewers.",
      ],
    },
    {
      title: "No AI final decisions",
      paragraphs: [
        "AI does not make final verification decisions. Verification decisions require human/admin review or an approved deterministic verification path.",
      ],
    },
  ],
};

export const moderationAppealsContent: PolicyPageContent = {
  title: "Moderation & Appeals",
  description: "Draft moderation and appeals policy for jmpseat private beta.",
  eyebrow: "moderation and appeals",
  lede:
    "jmpseat uses reporting and operator-scoped moderation review to protect privacy, safety, and community utility during private beta.",
  sections: [
    {
      title: "Report handling",
      paragraphs: [
        "DFW Channel posts can be reported for review. Report details should stay focused and should not add extra private information.",
        "Reporter identity is not public, and public report counts are not shown.",
      ],
    },
    {
      title: "Moderation actions",
      paragraphs: [
        "Authorized operators may review reported content and use narrow hide/remove actions when needed.",
        "Moderation may be used for privacy, safety, harassment, spam, doxxing, exact crew hotel exposure, live operations-sensitive content, confidential company information, or security-sensitive content.",
      ],
    },
    {
      title: "Boundaries",
      items: [
        "No AI final moderation decisions.",
        "No final bans without human/admin review.",
        "No public moderation feed.",
        "No public reporter identity.",
        "No account-ban action in the current T26E-A moderation surface.",
      ],
    },
    {
      title: "Appeals",
      paragraphs: [
        "Appeals are a draft/manual process during private beta. A formal appeal intake may be wired later.",
        "Appeals should not restore content that exposes passengers, exact crew hotels, security procedures, live operations-sensitive information, doxxing, threats, or confidential company information.",
      ],
    },
  ],
};

export const supportRequestsContent: PolicyPageContent = {
  title: "Support & Requests",
  description: "Draft support, incident, deletion, and request process for jmpseat private beta.",
  eyebrow: "support and requests",
  lede:
    "Support and request handling is still a draft private-beta operating process. Some intake mechanics may be implemented later.",
  sections: [
    {
      title: "What this covers",
      items: [
        "Account and access questions.",
        "Work-email verification issues.",
        "Privacy, deletion, or export requests.",
        "Moderation appeals.",
        "Safety, security, or aviation-sensitive content concerns.",
      ],
    },
    {
      title: "Contact path",
      paragraphs: [
        "Approved support/contact paths are still being finalized for private beta. Until a specific in-app form is wired, use the contact path provided by the founder or beta operator for your beta cohort.",
        "Do not send passwords, portal credentials, employee numbers, confidential company documents, passenger information, exact crew hotel details, or security-sensitive information in support messages.",
      ],
    },
    {
      title: "Deletion and export",
      paragraphs: [
        "Deletion/export request handling is draft/manual and may require founder/legal review before completion.",
        "Exports should exclude other users' private data, reporter identities, author user IDs, internal operator notes, proof artifacts, signed URLs, storage paths, and security-sensitive data unless legally required and reviewed.",
      ],
    },
    {
      title: "Incident escalation",
      paragraphs: [
        "Safety, privacy, security, operator-access, or aviation-sensitive incidents should be escalated to the designated founder/operator owner and backup once those roles are finalized.",
      ],
    },
  ],
};

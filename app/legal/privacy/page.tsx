import type { Metadata } from "next";

import { PolicyPage } from "../PolicyPage";
import { privacyNoticeContent } from "../policyContent";

export const metadata: Metadata = {
  title: `jmpseat. | ${privacyNoticeContent.title}`,
  description: privacyNoticeContent.description,
};

export default function PrivateBetaPrivacyPage() {
  return <PolicyPage {...privacyNoticeContent} />;
}

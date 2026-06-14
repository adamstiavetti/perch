import type { Metadata } from "next";

import { PolicyPage } from "../PolicyPage";
import { verificationPrivacyContent } from "../policyContent";

export const metadata: Metadata = {
  title: `jmpseat. | ${verificationPrivacyContent.title}`,
  description: verificationPrivacyContent.description,
};

export default function VerificationPrivacyPage() {
  return <PolicyPage {...verificationPrivacyContent} />;
}

import type { Metadata } from "next";

import { PolicyPage } from "../PolicyPage";
import { betaTermsContent } from "../policyContent";

export const metadata: Metadata = {
  title: `jmpseat. | ${betaTermsContent.title}`,
  description: betaTermsContent.description,
};

export default function PrivateBetaTermsPage() {
  return <PolicyPage {...betaTermsContent} />;
}

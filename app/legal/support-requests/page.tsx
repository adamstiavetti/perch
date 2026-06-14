import type { Metadata } from "next";

import { PolicyPage } from "../PolicyPage";
import { supportRequestsContent } from "../policyContent";

export const metadata: Metadata = {
  title: `jmpseat. | ${supportRequestsContent.title}`,
  description: supportRequestsContent.description,
};

export default function SupportRequestsPage() {
  return <PolicyPage {...supportRequestsContent} />;
}

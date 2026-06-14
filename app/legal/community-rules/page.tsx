import type { Metadata } from "next";

import { PolicyPage } from "../PolicyPage";
import { communityRulesContent } from "../policyContent";

export const metadata: Metadata = {
  title: `jmpseat. | ${communityRulesContent.title}`,
  description: communityRulesContent.description,
};

export default function CommunityRulesPage() {
  return <PolicyPage {...communityRulesContent} />;
}

import type { Metadata } from "next";

import { PolicyPage } from "../PolicyPage";
import { moderationAppealsContent } from "../policyContent";

export const metadata: Metadata = {
  title: `jmpseat. | ${moderationAppealsContent.title}`,
  description: moderationAppealsContent.description,
};

export default function ModerationAppealsPage() {
  return <PolicyPage {...moderationAppealsContent} />;
}

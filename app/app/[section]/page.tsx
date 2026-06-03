import { notFound } from "next/navigation";
import { PrivateShellPlaceholder } from "../../../src/components/privateApp/PrivateShellPlaceholder";
import { getPrivateShellChildRoute } from "../../../src/lib/privateApp/privateShellPlaceholder";

type PrivateRoutePlaceholderPageProps = {
  params: Promise<{
    section: string;
  }>;
};

export default async function PrivateRoutePlaceholderPage({
  params,
}: PrivateRoutePlaceholderPageProps) {
  const { section } = await params;
  const route = getPrivateShellChildRoute(section);

  if (!route) {
    notFound();
  }

  return (
    <PrivateShellPlaceholder
      currentPath={route.path}
      message={route.message}
      subbrand={`${route.navLabel} placeholder`}
    />
  );
}

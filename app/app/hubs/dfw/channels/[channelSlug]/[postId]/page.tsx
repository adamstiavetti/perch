import { DfwChannelPostDetailShell } from "../../../../../../../src/components/privateApp/HomeHubShell";
import {
  getDfwHubChannelPost,
  listDfwHubChannels,
} from "../../../../../../../src/lib/community/hubChannels";
import { requireDfwHubRouteAccess } from "../../../../../../../src/lib/privateApp/dfwHubAccess";

type DfwChannelPostDetailPageProps = {
  params: Promise<{
    channelSlug: string;
    postId: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function DfwChannelPostDetailPage({
  params,
}: DfwChannelPostDetailPageProps) {
  const { channelSlug, postId } = await params;
  const normalizedChannelSlug = channelSlug.trim().toLowerCase();
  const normalizedPostId = postId.trim();
  const route = `/app/hubs/dfw/channels/${encodeURIComponent(normalizedChannelSlug)}/${encodeURIComponent(normalizedPostId)}`;

  await requireDfwHubRouteAccess({
    route,
    section: "dfw-channel-post",
  });

  const [channelResult, postResult] = await Promise.all([
    listDfwHubChannels(),
    getDfwHubChannelPost(normalizedChannelSlug, normalizedPostId),
  ]);
  const selectedChannel =
    channelResult.channels.find((channel) => channel.slug === normalizedChannelSlug) ?? null;

  return (
    <DfwChannelPostDetailShell
      channel={selectedChannel}
      channelsUnavailable={Boolean(channelResult.error)}
      post={postResult.post}
      postUnavailable={Boolean(postResult.error)}
    />
  );
}

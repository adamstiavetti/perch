import { DfwChannelThreadListShell } from "../../../../../../src/components/privateApp/HomeHubShell";
import { createDfwHubChannelPostAction } from "../../../../../../src/lib/community/hubChannelActions";
import {
  DFW_HUB_CHANNEL_POST_STATUS_PARAM,
  isDfwHubChannelPostStatus,
  listDfwHubChannelPosts,
  listDfwHubChannels,
} from "../../../../../../src/lib/community/hubChannels";
import { requireDfwHubRouteAccess } from "../../../../../../src/lib/privateApp/dfwHubAccess";

type DfwChannelPageProps = {
  params: Promise<{
    channelSlug: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";

export default async function DfwChannelPage({
  params,
  searchParams,
}: DfwChannelPageProps) {
  const { channelSlug } = await params;
  const normalizedChannelSlug = channelSlug.trim().toLowerCase();
  const route = `/app/hubs/dfw/channels/${encodeURIComponent(normalizedChannelSlug)}`;

  await requireDfwHubRouteAccess({
    route,
    section: "dfw-channel",
  });

  const channelResult = await listDfwHubChannels();
  const selectedChannel =
    channelResult.channels.find((channel) => channel.slug === normalizedChannelSlug) ?? null;
  const postResult = selectedChannel
    ? await listDfwHubChannelPosts(selectedChannel.slug)
    : { posts: [], error: null };
  const search = await searchParams;
  const postStatusValue = search[DFW_HUB_CHANNEL_POST_STATUS_PARAM];
  const postStatus = isDfwHubChannelPostStatus(postStatusValue)
    ? postStatusValue
    : null;
  const createPostAction = selectedChannel
    ? createDfwHubChannelPostAction.bind(null, selectedChannel.slug)
    : undefined;

  return (
    <DfwChannelThreadListShell
      channel={selectedChannel}
      channelsUnavailable={Boolean(channelResult.error)}
      createPostAction={createPostAction}
      posts={postResult.posts}
      postStatus={postStatus}
      postsUnavailable={Boolean(postResult.error)}
    />
  );
}

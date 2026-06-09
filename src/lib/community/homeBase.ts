import "server-only";

import { createClient } from "../supabase/server";

export type CurrentUserHomeBase = {
  baseId: string;
  baseCode: string;
  baseName: string;
  selectedAt: string;
  updatedAt: string;
};

export type CurrentUserBoardFollow = {
  id: string;
  boardId: string;
  boardSlug: string;
  boardName: string;
  boardType: string;
  source: string;
  notificationLevel: string;
  isFavorite: boolean;
  followedAt: string;
  updatedAt: string;
};

type HomeBasePreferenceRow = {
  base_id: string;
  base_code: string;
  base_name: string;
  selected_at: string;
  updated_at: string;
};

type BoardFollowRow = {
  id: string;
  board_id: string;
  board_slug: string;
  board_name: string;
  board_type: string;
  source: string;
  notification_level: string;
  is_favorite: boolean;
  followed_at: string;
  updated_at: string;
};

type SetHomeBaseRpcRow = {
  base_id: string;
  board_id: string;
};

export async function getCurrentUserHomeBase() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc("get_current_user_home_base")
    .returns<HomeBasePreferenceRow[]>();

  if (error) {
    return {
      homeBase: null,
      error,
    };
  }

  const rows = Array.isArray(data) ? data : [];
  const homeBase = rows[0] ?? null;

  if (!homeBase) {
    return {
      homeBase: null,
      error: null,
    };
  }

  return {
    homeBase: {
      baseId: homeBase.base_id,
      baseCode: homeBase.base_code,
      baseName: homeBase.base_name,
      selectedAt: homeBase.selected_at,
      updatedAt: homeBase.updated_at,
    } satisfies CurrentUserHomeBase,
    error: null,
  };
}

export async function setUserHomeBaseByCode(baseCode: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc("set_user_home_base", {
      p_base_code: baseCode,
    })
    .returns<SetHomeBaseRpcRow[]>();

  if (error) {
    return {
      result: null,
      error,
    };
  }

  const rows = Array.isArray(data) ? data : [];

  return {
    result: rows[0] ?? null,
    error: null,
  };
}

export async function listCurrentUserBoardFollows() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc("list_current_user_board_follows")
    .returns<BoardFollowRow[]>();

  if (error) {
    return {
      follows: [],
      error,
    };
  }

  return {
    follows: (Array.isArray(data) ? data : []).map(
      (follow) => ({
        id: follow.id,
        boardId: follow.board_id,
        boardSlug: follow.board_slug,
        boardName: follow.board_name,
        boardType: follow.board_type,
        source: follow.source,
        notificationLevel: follow.notification_level,
        isFavorite: follow.is_favorite,
        followedAt: follow.followed_at,
        updatedAt: follow.updated_at,
      }) satisfies CurrentUserBoardFollow,
    ),
    error: null,
  };
}

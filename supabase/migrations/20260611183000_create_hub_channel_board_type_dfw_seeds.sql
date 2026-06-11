insert into public.board_types (
  key,
  label,
  description,
  default_visibility,
  default_posting_mode,
  display_order,
  is_active
)
values (
  'hub_channel',
  'Hub Channel',
  'Private-beta scoped discussion channel inside an airport/base Hub.',
  'open_verified',
  'members_can_post',
  15,
  true
)
on conflict (key) do update
set
  label = excluded.label,
  description = excluded.description,
  default_visibility = excluded.default_visibility,
  default_posting_mode = excluded.default_posting_mode,
  display_order = excluded.display_order,
  is_active = excluded.is_active;

do $$
declare
  v_base_id uuid;
  v_parent_board_id uuid;
  v_channel_board_type_id uuid;
  v_seeded_channel_count integer;
begin
  select
    bases.id,
    parent_boards.id,
    channel_board_types.id
  into
    v_base_id,
    v_parent_board_id,
    v_channel_board_type_id
  from public.bases
  inner join public.boards as parent_boards
    on parent_boards.base_id = bases.id
   and parent_boards.slug = 'dfw'
   and parent_boards.status = 'active'
  inner join public.board_types as parent_board_types
    on parent_board_types.id = parent_boards.board_type_id
   and parent_board_types.key = 'base_board'
   and parent_board_types.is_active = true
  cross join public.board_types as channel_board_types
  where bases.code = 'DFW'
    and bases.status = 'active'
    and channel_board_types.key = 'hub_channel'
    and channel_board_types.is_active = true
  limit 1;

  if v_base_id is null
    or v_parent_board_id is null
    or v_channel_board_type_id is null
  then
    raise exception 'Active DFW base, parent dfw base_board, and hub_channel board type are required before seeding DFW Hub Channels'
      using errcode = 'P0002';
  end if;

  insert into public.boards (
    board_type_id,
    base_id,
    parent_board_id,
    slug,
    name,
    short_name,
    description,
    visibility,
    posting_mode,
    discoverability,
    status,
    sort_order
  )
  values
    (
      v_channel_board_type_id,
      v_base_id,
      v_parent_board_id,
      'dfw-q-and-a',
      'DFW Q&A',
      'Q&A',
      'General questions and answers for DFW aviation workers when a topic does not fit a more specific channel.',
      'open_verified',
      'members_can_post',
      'visible',
      'active',
      10
    ),
    (
      v_channel_board_type_id,
      v_base_id,
      v_parent_board_id,
      'commuting-parking',
      'Commuting & Parking',
      'Parking',
      'Employee parking, commuting, ground transport, transit, rideshare, and practical access questions.',
      'open_verified',
      'members_can_post',
      'visible',
      'active',
      20
    ),
    (
      v_channel_board_type_id,
      v_base_id,
      v_parent_board_id,
      'terminal-ground-logistics',
      'Terminal & Ground Logistics',
      'Logistics',
      'Safe, non-sensitive airport logistics, terminal navigation, construction impacts, and getting around DFW at a general level.',
      'open_verified',
      'members_can_post',
      'visible',
      'active',
      30
    ),
    (
      v_channel_board_type_id,
      v_base_id,
      v_parent_board_id,
      'food-coffee-breaks',
      'Food, Coffee & Breaks',
      'Food',
      'Practical food, coffee, break, and quick-stop recommendations for aviation workers.',
      'open_verified',
      'members_can_post',
      'visible',
      'active',
      40
    ),
    (
      v_channel_board_type_id,
      v_base_id,
      v_parent_board_id,
      'new-to-dfw',
      'New to DFW',
      'New',
      'Onboarding, first-week questions, transfers, new hires, and getting oriented at DFW.',
      'open_verified',
      'members_can_post',
      'visible',
      'active',
      50
    ),
    (
      v_channel_board_type_id,
      v_base_id,
      v_parent_board_id,
      'dfw-layover-local',
      'DFW Layover & Local',
      'Layover',
      'Safe layover/local recommendations, getting around, short/long layover questions, and aviation-worker local tips without exact crew hotel exposure or live crew-location behavior.',
      'open_verified',
      'members_can_post',
      'visible',
      'active',
      60
    )
  on conflict (slug) do update
  set
    board_type_id = excluded.board_type_id,
    base_id = excluded.base_id,
    parent_board_id = excluded.parent_board_id,
    name = excluded.name,
    short_name = excluded.short_name,
    description = excluded.description,
    visibility = excluded.visibility,
    posting_mode = excluded.posting_mode,
    discoverability = excluded.discoverability,
    status = excluded.status,
    sort_order = excluded.sort_order
  where public.boards.base_id = excluded.base_id
    and public.boards.parent_board_id = excluded.parent_board_id;

  select count(*)
  into v_seeded_channel_count
  from public.boards
  where public.boards.base_id = v_base_id
    and public.boards.parent_board_id = v_parent_board_id
    and public.boards.board_type_id = v_channel_board_type_id
    and public.boards.slug in (
      'dfw-q-and-a',
      'commuting-parking',
      'terminal-ground-logistics',
      'food-coffee-breaks',
      'new-to-dfw',
      'dfw-layover-local'
    );

  if v_seeded_channel_count <> 6 then
    raise exception 'Expected 6 DFW Hub Channel child boards under the active DFW parent board, found %', v_seeded_channel_count
      using errcode = 'P0002';
  end if;
end;
$$;

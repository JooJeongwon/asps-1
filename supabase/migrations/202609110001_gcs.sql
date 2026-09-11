begin;
create table public.gcs_datasets (
  id text primary key,
  source_sha256 text not null,
  created_at timestamptz not null default now()
);
create table public.gcs_participants (
  id text primary key,
  name text not null unique
);
create table public.gcs_pairs (
  dataset_id text not null references public.gcs_datasets(id),
  participant_a text not null references public.gcs_participants(id),
  participant_b text not null references public.gcs_participants(id),
  match_score double precision not null check (match_score between 0 and 100),
  match_group text generated always as (
    case when match_score >= 76 then '베스트 프렌드'
         when match_score >= 68 then '좋음' else '보통' end
  ) stored,
  kai_difference double precision not null check (kai_difference >= 0 and kai_difference < 'Infinity'::float8),
  mbti_score double precision not null check (mbti_score between 0 and 100),
  saju_score double precision not null check (saju_score between 0 and 100),
  primary key (dataset_id, participant_a, participant_b),
  check (participant_a < participant_b)
);
alter table public.gcs_datasets enable row level security;
alter table public.gcs_participants enable row level security;
alter table public.gcs_pairs enable row level security;
revoke all on public.gcs_datasets, public.gcs_participants, public.gcs_pairs from public, anon, authenticated;
grant select, insert, update, delete on public.gcs_datasets, public.gcs_participants, public.gcs_pairs to service_role;

create view public.gcs_matches with (security_invoker = true) as
select p.dataset_id, a.name as person_name, b.name as match_name,
       p.match_score, p.match_group, p.kai_difference, p.mbti_score, p.saju_score
from public.gcs_pairs p
join public.gcs_participants a on a.id = p.participant_a
join public.gcs_participants b on b.id = p.participant_b
union all
select p.dataset_id, b.name, a.name,
       p.match_score, p.match_group, p.kai_difference, p.mbti_score, p.saju_score
from public.gcs_pairs p
join public.gcs_participants a on a.id = p.participant_a
join public.gcs_participants b on b.id = p.participant_b;
revoke all on public.gcs_matches from public, anon, authenticated;
grant select on public.gcs_matches to service_role;
commit;

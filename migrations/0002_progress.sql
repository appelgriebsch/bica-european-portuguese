create table if not exists lesson_progress (
  user_id text not null,
  lesson_id text not null,
  quiz_score integer not null default 0,
  quiz_total integer not null default 0,
  xp integer not null default 0,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);
create index if not exists lesson_progress_user_idx on lesson_progress (user_id);

create table if not exists user_stats (
  user_id text primary key,
  streak integer not null default 0,
  last_study_date date,
  total_xp integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists conversations (
  id serial primary key,
  user_id text not null,
  scenario_id text not null,
  messages jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);
create index if not exists conversations_user_idx on conversations (user_id, scenario_id);

alter table user_stats
  add column if not exists vocab_cards jsonb not null default '{}'::jsonb;

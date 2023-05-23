create table
mobile_push_tokens(
  uid uuid primary key,
  token text
);

alter table "public"."mobile_push_tokens" enable row level security;
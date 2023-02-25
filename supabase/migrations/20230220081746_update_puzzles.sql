alter table "public"."puzzles" drop column "jsonb";

alter table "public"."puzzles" add column "puzzle" jsonb not null;

alter table "public"."puzzles" add column "solution" jsonb not null;

alter table "public"."puzzles" add column "theme" text;



alter table "public"."attempts" drop column "jsonb";

alter table "public"."attempts" drop column "has_cheated";

alter table "public"."solves" drop column "id";

alter table "public"."solves" drop column "did_cheat";

alter table "public"."solves" add column "time" float4;

alter table "public"."puzzles" drop column "theme";

alter table "public"."puzzles" add column "author" text;

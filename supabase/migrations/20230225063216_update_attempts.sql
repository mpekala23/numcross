alter table "public"."attempts" drop constraint "attempts_pkey";

drop index if exists "public"."attempts_pkey";

alter table "public"."attempts" drop column "id";

alter table "public"."attempts" alter column "has_cheated" set default false;

alter table "public"."attempts" alter column "start_time" set default now();

CREATE UNIQUE INDEX attempts_pkey ON public.attempts USING btree (uid, pid);

alter table "public"."attempts" add constraint "attempts_pkey" PRIMARY KEY using index "attempts_pkey";



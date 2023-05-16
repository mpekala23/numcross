alter table "public"."solves" drop constraint "solves_pkey";

drop index if exists "public"."solves_pkey";

alter table "public"."profiles" alter column "username" set not null;

alter table "public"."profiles" enable row level security;

CREATE UNIQUE INDEX profiles_username_key ON public.profiles USING btree (username);

CREATE UNIQUE INDEX solves_pkey ON public.solves USING btree (uid, pid);

alter table "public"."solves" add constraint "solves_pkey" PRIMARY KEY using index "solves_pkey";

alter table "public"."profiles" add constraint "profiles_username_key" UNIQUE using index "profiles_username_key";
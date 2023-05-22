--create type "auth"."code_challenge_method" as enum ('s256', 'plain');

drop index if exists "auth"."refresh_tokens_token_idx";

create table if not exists "auth"."flow_state" (
    "id" uuid not null,
    "user_id" uuid,
    "auth_code" text not null,
    "code_challenge_method" auth.code_challenge_method not null,
    "code_challenge" text not null,
    "provider_type" text not null,
    "provider_access_token" text,
    "provider_refresh_token" text,
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "authentication_method" text not null
);


CREATE UNIQUE INDEX if not exists flow_state_pkey ON auth.flow_state USING btree (id);

CREATE INDEX if not exists idx_auth_code ON auth.flow_state USING btree (auth_code);

CREATE INDEX if not exists idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);

--alter table "auth"."flow_state" add constraint "flow_state_pkey" PRIMARY KEY using index "flow_state_pkey";


create schema if not exists "pgtle";


drop policy "Enable read access for all users" on "public"."attempts";


-- alter table "storage"."objects" add column "version" text;



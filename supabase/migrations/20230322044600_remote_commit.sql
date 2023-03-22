create policy "Enable read access for all users"
on "public"."attempts"
as permissive
for select
to public
using (true);




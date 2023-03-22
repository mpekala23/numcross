create policy "Disable reads"
on "public"."attempts"
as permissive
for select
to public
using (false);


create policy "Disable reads"
on "public"."puzzles"
as permissive
for select
to public
using (false);


create policy "Disable reads"
on "public"."solves"
as permissive
for select
to public
using (false);




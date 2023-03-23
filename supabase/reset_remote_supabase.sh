# Get a list of the filenames without annoying pre/post-fixes
migrations=$(ls migrations/*.sql | sed 's/\.sql//g' | sed 's/migrations\///g')

# Reset all the statuses to reverted
for migration in $migrations
do
  npx supabase migration repair $migration --status reverted
done

# Push to reset
npx supabase db push

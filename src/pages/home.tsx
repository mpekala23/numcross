import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import React from "react";

export default function HomePage() {
  const supabase = useSupabaseClient();
  const router = useRouter();

  return (
    <div>
      Home!
      <button
        onClick={() => {
          supabase.auth.signOut();
          router.replace("/signup");
        }}
      >
        Sign out
      </button>
    </div>
  );
}

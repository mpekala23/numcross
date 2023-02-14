import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { Auth, ThemeSupa } from "@supabase/auth-ui-react";
import { useEffect, useState } from "react";
import Slink from "@/components/slink";
import { useRouter } from "next/router";

export default function LoginPage() {
  const supabaseClient = useSupabaseClient();
  const user = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace("home");
    }
  }, [user, router]);

  return (
    <div>
      <p className="text-xl">Sign in</p>
      <Auth
        view="sign_in"
        redirectTo="http://localhost:3000/test"
        appearance={{ theme: ThemeSupa }}
        supabaseClient={supabaseClient}
        providers={
          [
            /*"google", "github"*/
          ]
        }
        socialLayout="horizontal"
        showLinks={false}
      />
      <Slink href="signup">Need to make an account? Sign up</Slink>
    </div>
  );
}

import React from "react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { Auth, ThemeSupa } from "@supabase/auth-ui-react";
import { useEffect } from "react";
import Slink from "@/components/slink";
import { useRouter } from "next/router";

export default function SignupPage() {
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
      <p className="text-xl">Sign up</p>
      <Auth
        view="sign_up"
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
      <Slink href="signin">Already have an account? Sign in</Slink>
    </div>
  );
}

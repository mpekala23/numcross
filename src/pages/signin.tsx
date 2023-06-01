import React from "react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { Auth, ThemeSupa } from "@supabase/auth-ui-react";
import { useEffect } from "react";
import Slink from "@/components/slink";
import { useRouter } from "next/router";
import useDev from "@/hooks/useDev";

export default function LoginPage() {
  const { baseUrl } = useDev();
  const supabaseClient = useSupabaseClient();
  const user = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace("/");
    }
  }, [user, router]);

  return (
    <div>
      <p className="text-xl">Sign in</p>
      <Auth
        view="sign_in"
        redirectTo={`${baseUrl}`}
        appearance={{
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: "#37BCF7",
                brandAccent: "#BAE7FC",
              },
            },
          },
        }}
        supabaseClient={supabaseClient}
        providers={["google"]}
        socialLayout="horizontal"
        showLinks={false}
      />
      <div className="flex justify-center mt-4">
        <Slink href="signup">Need to make an account? Sign up</Slink>
      </div>
    </div>
  );
}

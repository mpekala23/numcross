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
      router.replace("/");
    }
  }, [user, router]);

  return (
    <div>
      <p className="text-xl">Sign up</p>
      <Auth
        view="sign_up"
        redirectTo=""
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
      <div className="mt-4 justify-center flex">
        <Slink href="signin">Already have an account? Sign in</Slink>
      </div>
      <div className="mt-4">
        <div className="text-center">
          By signing up you agree to the following:
        </div>
        <div className="flex mt-4 justify-around">
          <Slink href="privacy_policy">Privacy Policy</Slink>
          <br />
          <Slink href="terms_of_service">Terms of Service</Slink>
        </div>
      </div>
    </div>
  );
}

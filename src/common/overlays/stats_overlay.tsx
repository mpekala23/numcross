import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import React, { useCallback } from "react";
import Slink from "../../components/slink";
import Stats from "../../components/stats";

interface Props {
  closeModal: () => void;
}

export default function StatsOverlay({ closeModal }: Props) {
  const supabase = useSupabaseClient();
  const user = useUser();

  // For rendering a message prompting non-logged in users to log in
  // or create an account
  const renderNotLoggedIn = useCallback(() => {
    return (
      <div className="flex flex-col h-16 justify-center items-center">
        <p className="text-md font-body px-4 p-2">
          You need to be logged in to see stats.
        </p>
        <Slink onClick={closeModal} href="/signin">
          Sign in
        </Slink>
        <Slink onClick={closeModal} href="/signup">
          Create an account
        </Slink>
      </div>
    );
  }, [closeModal]);

  // For rendering the content, once loaded without error
  const renderContent = useCallback(() => {
    if (!user?.id) return renderNotLoggedIn();
    return <Stats />;
  }, [user?.id, renderNotLoggedIn]);

  return (
    <div className="flex flex-col justify-center align-center">
      <p className="text-2xl font-bold font-title pb-4">Stats</p>
      {renderContent()}
      {user && (
        <Slink
          onClick={() => {
            supabase.auth.signOut().then(() => {
              localStorage.clear();
            });
          }}
          href=""
        >
          Sign out
        </Slink>
      )}
    </div>
  );
}

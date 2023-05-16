import { useUser } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import { getUsername } from "./useApi";

export default function useUsername() {
  const user = useUser();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const dowork = async () => {
      if (user) {
        const newUsername = await getUsername(user.id);
        setUsername(newUsername);
      }
    };
    dowork();
  }, [user]);

  return { username, setUsername };
}
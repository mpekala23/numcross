import React, { useEffect } from "react";
import AdminOnly from "@/common/admin_only";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

export default function Manage() {
  const supabaseClient = useSupabaseClient();

  useEffect(() => {
    const doWork = async () => {
      const result = await supabaseClient.from("puzzles").select();
      console.log(result);
    };
    doWork();
  }, [supabaseClient]);

  return (
    <AdminOnly>
      <p>Hello!</p>
    </AdminOnly>
  );
}

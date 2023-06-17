import { useUser } from "@supabase/auth-helpers-react";
import React from "react";

interface Props {
  children: React.ReactNode | React.ReactNode[];
}

export default function AdminOnly({ children }: Props) {
  const user = useUser();

  if (
    user?.email !== "mpek66@gmail.com" &&
    user?.email !== "rajatmittal@college.harvard.edu"
  ) {
    return null;
  }

  return <>{children}</>;
}

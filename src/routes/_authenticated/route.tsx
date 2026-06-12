import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    // Use getSession (reads from local storage, no network) instead of getUser
    // so a flaky network or stale token doesn't bounce signed-in users to /auth.
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({ to: "/auth", search: { mode: "signin" } });
    }
    return { user: data.session.user };
  },
  component: () => <Outlet />,
});

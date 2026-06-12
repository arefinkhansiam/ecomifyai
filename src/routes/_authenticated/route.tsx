import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

async function getStoredSession() {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const { data } = await supabase.auth.getSession();
    if (data.session) return data.session;
    await new Promise((resolve) => setTimeout(resolve, 120));
  }
  return null;
}

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const session = await getStoredSession();
    if (!session) {
      throw redirect({ to: "/auth", search: { mode: "signin" } });
    }
    return { user: session.user };
  },
  component: () => <Outlet />,
});

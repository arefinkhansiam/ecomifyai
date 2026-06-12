import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getStableAuthSession } from "@/lib/use-auth";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const session = await getStableAuthSession();
    if (!session) {
      throw redirect({ to: "/auth", search: { mode: "signin" } });
    }
    return { user: session.user };
  },
  component: () => <Outlet />,
});

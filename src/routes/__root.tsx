import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useRef, type ReactNode } from "react";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { initializeAuth, useAuth } from "@/lib/use-auth";

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="max-w-md text-center">
        <h1 className="text-2xl text-white">Something went wrong</h1>
        <p className="mt-2">{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="btn-primary mt-6"
        >Try Again</button>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="text-center">
        <h1 className="text-cyan">404</h1>
        <p className="mt-4">This page doesn't exist.</p>
        <a href="/" className="btn-primary mt-6">Go Home</a>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Easibie — AI Photo Try-On for E-Commerce" },
      { name: "description", content: "Turn product photos into AI try-on experiences. No complex modeling, no app downloads. Just upload, generate, and sell more." },
      { property: "og:title", content: "Easibie — AI Photo Try-On for E-Commerce" },
      { property: "og:description", content: "Turn product photos into AI try-on experiences. No complex modeling, no app downloads. Just upload, generate, and sell more." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Easibie — AI Photo Try-On for E-Commerce" },
      { name: "twitter:description", content: "Turn product photos into AI try-on experiences. No complex modeling, no app downloads. Just upload, generate, and sell more." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/a77039ba-709a-4283-8ed5-dcf2b6ae8c52/id-preview-541cac40--cf67ac36-8498-48f8-aa46-849ecb68157b.lovable.app-1780828070252.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/a77039ba-709a-4283-8ed5-dcf2b6ae8c52/id-preview-541cac40--cf67ac36-8498-48f8-aa46-849ecb68157b.lovable.app-1780828070252.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" },
    ],

    scripts: [],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFound,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const { user, loading, error } = useAuth();
  const previousUserId = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    initializeAuth();
  }, []);

  useEffect(() => {
    if (loading) return;

    const currentUserId = user?.id ?? null;
    const previous = previousUserId.current;
    previousUserId.current = currentUserId;

    if (previous === undefined || previous === currentUserId) return;

    if (!currentUserId) {
      queryClient.cancelQueries();
      queryClient.clear();
      router.invalidate();
      return;
    }

    queryClient.invalidateQueries();
  }, [loading, user?.id, router, queryClient]);

  useEffect(() => {
    if (error) console.warn("[auth] session bootstrap failed", error);
  }, [error]);

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster theme="light" position="top-right" richColors />
    </QueryClientProvider>
  );
}

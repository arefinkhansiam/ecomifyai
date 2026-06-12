import { useEffect, useState } from "react";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthSnapshot = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  error: Error | null;
};

const listeners = new Set<() => void>();
let snapshot: AuthSnapshot = { session: null, user: null, loading: true, error: null };
let initPromise: Promise<Session | null> | null = null;
let bootstrapped = false;
let authSubscription: { unsubscribe: () => void } | null = null;

function publish(next: AuthSnapshot) {
  snapshot = next;
  listeners.forEach((listener) => listener());
}

function setAuthSession(session: Session | null, error: Error | null = null) {
  publish({ session, user: session?.user ?? null, loading: false, error });
}

function authLog(event: AuthChangeEvent | "BOOTSTRAP_ERROR", session?: Session | null, error?: unknown) {
  const safePayload = {
    event,
    hasSession: Boolean(session),
    userId: session?.user?.id,
    expiresAt: session?.expires_at,
  };
  if (error) {
    console.warn("[auth]", safePayload, error);
  } else {
    console.debug("[auth]", safePayload);
  }
}

export function initializeAuth() {
  if (initPromise) return initPromise;

  if (!authSubscription) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      authLog(event, session);
      if (event === "INITIAL_SESSION" && !bootstrapped) return;
      bootstrapped = true;
      if (event === "SIGNED_OUT") {
        setAuthSession(null);
        return;
      }
      setAuthSession(session);
    });
    authSubscription = subscription;
  }

  initPromise = supabase.auth.getSession()
    .then(({ data, error }) => {
      if (error) throw error;
      bootstrapped = true;
      setAuthSession(data.session);
      return data.session;
    })
    .catch((error) => {
      const err = error instanceof Error ? error : new Error(String(error));
      bootstrapped = true;
      authLog("BOOTSTRAP_ERROR", snapshot.session, err);
      setAuthSession(snapshot.session, err);
      return snapshot.session;
    });

  return initPromise;
}

export async function getStableAuthSession(timeoutMs = 4500) {
  const timeout = new Promise<Session | null>((resolve) => {
    window.setTimeout(() => resolve(snapshot.session), timeoutMs);
  });
  return Promise.race([initializeAuth(), timeout]);
}

export function useAuth() {
  const [state, setState] = useState<AuthSnapshot>(snapshot);

  useEffect(() => {
    const update = () => setState(snapshot);
    listeners.add(update);
    initializeAuth();

    return () => {
      listeners.delete(update);
    };
  }, []);

  return state;
}

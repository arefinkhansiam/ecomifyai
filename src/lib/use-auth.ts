import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let bootstrapped = false;
    const applySession = (s: Session | null) => {
      if (cancelled) return;
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    };

    supabase.auth.getSession()
      .then(({ data }) => {
        bootstrapped = true;
        applySession(data.session);
      })
      .catch(() => {
        bootstrapped = true;
        applySession(null);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === "INITIAL_SESSION" && !bootstrapped) return;
      applySession(s);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return { session, user, loading };
}

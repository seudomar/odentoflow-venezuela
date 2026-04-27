import { useEffect, useState, useSyncExternalStore } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthState {
  session: Session | null;
  user: User | null;
  clinicId: string | null;
  loading: boolean;
}

let state: AuthState = {
  session: null,
  user: null,
  clinicId: null,
  loading: true,
};
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

async function loadClinicId(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("clinic_members")
    .select("clinic_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error("loadClinicId", error);
    return null;
  }
  return data?.clinic_id ?? null;
}

let initialized = false;
function init() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  // Listener PRIMERO, luego getSession (para no perder eventos)
  supabase.auth.onAuthStateChange((_event, session) => {
    state = {
      ...state,
      session,
      user: session?.user ?? null,
      loading: false,
    };
    emit();
    if (session?.user) {
      // diferir la carga (evita deadlocks dentro del callback)
      setTimeout(async () => {
        const clinicId = await loadClinicId(session.user.id);
        state = { ...state, clinicId };
        emit();
      }, 0);
    } else {
      state = { ...state, clinicId: null };
      emit();
    }
  });

  supabase.auth.getSession().then(async ({ data }) => {
    const session = data.session;
    state = {
      session,
      user: session?.user ?? null,
      clinicId: session ? await loadClinicId(session.user.id) : null,
      loading: false,
    };
    emit();
  });
}

export const authStore = {
  get: () => state,
  subscribe: (l: () => void) => {
    init();
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useAuth() {
  return useSyncExternalStore(authStore.subscribe, () => state, () => state);
}

/** Espera reactivamente a tener clinicId disponible */
export function useClinicId(): string | null {
  const { clinicId } = useAuth();
  return clinicId;
}

/** Hook que devuelve true cuando ya sabemos si hay o no sesión */
export function useAuthReady() {
  const { loading } = useAuth();
  const [ready, setReady] = useState(!loading);
  useEffect(() => { if (!loading) setReady(true); }, [loading]);
  return ready;
}

export async function signOut() {
  await supabase.auth.signOut();
  if (typeof window !== "undefined") window.location.href = "/login";
}

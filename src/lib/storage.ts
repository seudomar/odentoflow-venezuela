import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { currentClinicId } from "@/lib/clinic-sync";

export const LOGO_BUCKET = "clinic-logos";
export const PATIENT_BUCKET = "patient-files";

const SIGN_SECONDS = 60 * 60; // 1 hora

function sanitize(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(-60);
}

export async function uploadPatientFile(patientId: string, file: File) {
  const clinicId = currentClinicId();
  if (!clinicId) throw new Error("Sin clínica activa");
  const path = `${clinicId}/${patientId}/${Date.now()}-${sanitize(file.name)}`;
  const { error } = await supabase.storage
    .from(PATIENT_BUCKET)
    .upload(path, file, { contentType: file.type || undefined, upsert: false });
  if (error) throw error;
  return path;
}

export async function uploadLogo(file: File) {
  const clinicId = currentClinicId();
  if (!clinicId) throw new Error("Sin clínica activa");
  const ext = (file.name.split(".").pop() || "png").toLowerCase();
  const path = `${clinicId}/logo-${Date.now()}.${sanitize(ext)}`;
  const { error } = await supabase.storage
    .from(LOGO_BUCKET)
    .upload(path, file, { contentType: file.type || undefined, upsert: true });
  if (error) throw error;
  return path;
}

export async function removeStorageFile(bucket: string, path: string) {
  if (!path) return;
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) console.error("storage.remove", error);
}

// ---- URLs firmadas con caché en memoria ----
const cache = new Map<string, { url: string; expires: number }>();

export async function signedUrl(bucket: string, path: string): Promise<string> {
  if (!path) return "";
  const key = `${bucket}:${path}`;
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.url;
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, SIGN_SECONDS);
  if (error || !data?.signedUrl) {
    console.error("storage.sign", error);
    return "";
  }
  cache.set(key, { url: data.signedUrl, expires: Date.now() + (SIGN_SECONDS - 60) * 1000 });
  return data.signedUrl;
}

/**
 * Devuelve una URL mostrable: usa `fallback` (data URL heredada) si no hay path.
 */
export function useFileUrl(bucket: string, path?: string, fallback?: string) {
  const [url, setUrl] = useState(path ? "" : (fallback ?? ""));
  useEffect(() => {
    let alive = true;
    if (!path) {
      setUrl(fallback ?? "");
      return;
    }
    signedUrl(bucket, path).then((u) => {
      if (alive) setUrl(u || (fallback ?? ""));
    });
    return () => {
      alive = false;
    };
  }, [bucket, path, fallback]);
  return url;
}

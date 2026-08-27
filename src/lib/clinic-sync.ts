import { authStore } from "@/lib/auth-store";

/**
 * Ejecuta `onChange(clinicId)` cada vez que cambia la clínica activa
 * (incluyendo el primer valor disponible tras iniciar sesión).
 */
export function onClinicChange(onChange: (clinicId: string | null) => void) {
  let last: string | null | undefined = undefined;
  const check = () => {
    const { clinicId } = authStore.get();
    if (clinicId !== last) {
      last = clinicId;
      onChange(clinicId);
    }
  };
  authStore.subscribe(check);
  check();
}

export function currentClinicId(): string | null {
  return authStore.get().clinicId;
}

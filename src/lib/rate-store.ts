import { useSyncExternalStore } from "react";
import { clinicSettingsStore } from "@/lib/clinic-settings-store";

/**
 * La tasa del día vive en la configuración del consultorio (nube).
 * Este store es un alias reactivo para leer/escribir ese valor.
 */
export const rateStore = {
  get: () => clinicSettingsStore.get().rateValue,
  set: (v: number) => clinicSettingsStore.set({ rateValue: v }),
  subscribe: (l: () => void) => clinicSettingsStore.subscribe(l),
};

export function useBcvRate(): [number, (v: number) => void] {
  const value = useSyncExternalStore(
    clinicSettingsStore.subscribe,
    () => clinicSettingsStore.get().rateValue,
    () => clinicSettingsStore.get().rateValue,
  );
  return [value, rateStore.set];
}

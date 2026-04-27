import { useSyncExternalStore } from "react";

let rate = 36.5;
const listeners = new Set<() => void>();

export const rateStore = {
  get: () => rate,
  set: (v: number) => {
    rate = v;
    listeners.forEach((l) => l());
  },
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useBcvRate(): [number, (v: number) => void] {
  const value = useSyncExternalStore(rateStore.subscribe, () => rate, () => rate);
  return [value, rateStore.set];
}

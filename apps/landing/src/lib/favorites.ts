"use client";

export type SavedVehicle = {
  id: string;
  title: string;
  brand?: string;
  model?: string;
  year?: string | number;
  image?: string;
  price?: number;
  priceRange?: string;
  type?: "BRAND_NEW_CAR" | "USED_CAR" | string;
  category?: string;
  fuelType?: string;
  transmission?: string;
  mileage?: string;
  condition?: string;
  dealBadge?: string;
  savedAt?: string;
};

const FAVORITES_STORAGE_KEY = "autosecure_saved_favorites";
const FAVORITES_EVENT = "autosecure_favorites_changed";

export function getSavedFavorites(): SavedVehicle[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function isVehicleSaved(id: string): boolean {
  if (!id || typeof window === "undefined") return false;
  const list = getSavedFavorites();
  return list.some((item) => String(item.id) === String(id));
}

function notifyFavoritesChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(FAVORITES_EVENT));
  }
}

export function saveFavorite(vehicle: SavedVehicle): void {
  if (typeof window === "undefined" || !vehicle?.id) return;
  const list = getSavedFavorites();
  const existsIndex = list.findIndex((item) => String(item.id) === String(vehicle.id));
  if (existsIndex >= 0) {
    list[existsIndex] = { ...list[existsIndex], ...vehicle };
  } else {
    list.unshift({ ...vehicle, savedAt: new Date().toISOString() });
  }
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(list));
  notifyFavoritesChange();
}

export function removeFavorite(id: string): void {
  if (typeof window === "undefined" || !id) return;
  const list = getSavedFavorites();
  const updated = list.filter((item) => String(item.id) !== String(id));
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
  notifyFavoritesChange();
}

export function toggleFavorite(vehicle: SavedVehicle): boolean {
  if (!vehicle?.id) return false;
  const exists = isVehicleSaved(vehicle.id);
  if (exists) {
    removeFavorite(vehicle.id);
    return false;
  } else {
    saveFavorite(vehicle);
    return true;
  }
}

export function subscribeToFavorites(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(FAVORITES_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(FAVORITES_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

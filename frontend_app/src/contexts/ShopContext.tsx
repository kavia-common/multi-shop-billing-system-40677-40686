"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Type alias for Shop identifier.
 */
type ShopId = string;

/**
 * Internal context value type for ShopProvider.
 */
interface ShopContextValue {
  /**
   * Currently selected shop id (from URL ?shop= or localStorage).
   * null means no shop selected.
   */
  selectedShopId: ShopId | null;

  /**
   * Setter for selected shop id. By default, this updates the URL query (?shop=<id>)
   * and persists to localStorage. Provide options to control URL update behavior.
   */
  setSelectedShopId: (id: ShopId | null, options?: { updateUrl?: boolean }) => void;

  /**
   * Mobile sidebar open state. Useful for page-level toggles on small screens.
   */
  sidebarOpen: boolean;

  /**
   * Setter for the mobile sidebar open state.
   */
  setSidebarOpen: (open: boolean) => void;
}

const ShopContext = createContext<ShopContextValue | undefined>(undefined);

/**
 * Key used to persist selected shop id in localStorage.
 */
const STORAGE_KEY = "selectedShopId";

/**
 * Build a new URL (pathname + query) with the provided shop id applied to the
 * `shop` query param while preserving any existing query parameters.
 */
function buildUrlWithShop(
  pathname: string,
  searchParams: Readonly<URLSearchParams> | null | undefined,
  id: ShopId | null
): string {
  const params = new URLSearchParams(searchParams?.toString() ?? "");
  if (id && id.length > 0) {
    params.set("shop", id);
  } else {
    params.delete("shop");
  }
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

/**
 * Safely get from localStorage. Wrap in try/catch to avoid SSR or privacy errors.
 */
function safeGetLocalStorage(key: string): string | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Safely set/remove localStorage values. No-ops on SSR or when disallowed.
 */
function safeSetLocalStorage(key: string, value: string | null): void {
  try {
    if (typeof window === "undefined") return;
    if (value == null) {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // ignore storage errors
  }
}

/**
 * PUBLIC_INTERFACE
 * ShopProvider
 * @description React provider that supplies selected shop id (synced with URL query ?shop=<id> and localStorage)
 * and a mobile sidebar open state. Initialization order:
 * 1) If ?shop is present in the URL, it becomes the selectedShopId.
 * 2) Else if localStorage has a value, it becomes the selectedShopId and updates the URL.
 * 3) Else selectedShopId remains null.
 *
 * The provider also listens for external URL changes (e.g., navigation between pages)
 * and updates the selectedShopId when the ?shop param changes.
 */
export function ShopProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedShopId, setSelectedShopIdState] = useState<ShopId | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Track initial load so we only run the initialization effect once.
  const didInitRef = useRef(false);
  // Track last seen URL value to avoid redundant state churn on query changes.
  const lastUrlShopRef = useRef<string | null>(null);

  // Initialize from URL (?shop=) first, else from localStorage. Optionally write back to URL.
  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;

    const urlShop = searchParams?.get("shop");
    if (urlShop && urlShop.length > 0) {
      lastUrlShopRef.current = urlShop;
      setSelectedShopIdState(urlShop);
      // do not update URL since it already matches
      safeSetLocalStorage(STORAGE_KEY, urlShop);
      return;
    }

    const fromStorage = safeGetLocalStorage(STORAGE_KEY);
    if (fromStorage && fromStorage.length > 0) {
      setSelectedShopIdState(fromStorage);
      // reflect to URL since it wasn't present
      const url = buildUrlWithShop(pathname, searchParams, fromStorage);
      router.replace(url, { scroll: false });
      return;
    }

    // No initial value: ensure URL is clean (remove ?shop if any)
    const url = buildUrlWithShop(pathname, searchParams, null);
    router.replace(url, { scroll: false });
  }, [pathname, router, searchParams]);

  // Keep localStorage in sync with state whenever selectedShopId changes.
  useEffect(() => {
    safeSetLocalStorage(STORAGE_KEY, selectedShopId);
  }, [selectedShopId]);

  // React to external URL changes (e.g., navigation). If ?shop value changes, reflect to state.
  useEffect(() => {
    const urlShop = searchParams?.get("shop") || null;
    if (urlShop !== lastUrlShopRef.current) {
      lastUrlShopRef.current = urlShop;
      if (urlShop !== selectedShopId) {
        setSelectedShopIdState(urlShop);
      }
    }
    // Only re-evaluate when URL params change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Setter that updates both state and, by default, the URL.
  const setSelectedShopId = useCallback(
    (id: ShopId | null, options?: { updateUrl?: boolean }) => {
      setSelectedShopIdState(id);
      const shouldUpdateUrl = options?.updateUrl !== false;
      if (shouldUpdateUrl) {
        const url = buildUrlWithShop(pathname, searchParams, id);
        lastUrlShopRef.current = id ?? null; // anticipate URL change
        router.replace(url, { scroll: false });
      }
      safeSetLocalStorage(STORAGE_KEY, id);
    },
    [pathname, router, searchParams]
  );

  const value: ShopContextValue = useMemo(
    () => ({
      selectedShopId,
      setSelectedShopId,
      sidebarOpen,
      setSidebarOpen,
    }),
    [selectedShopId, setSelectedShopId, sidebarOpen]
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

/**
 * PUBLIC_INTERFACE
 * useShop
 * @description Hook to access the current selected shop id and a setter.
 * Throws an error if used outside of ShopProvider.
 * @returns An object with { selectedShopId, setSelectedShopId }
 */
export function useShop(): Pick<ShopContextValue, "selectedShopId" | "setSelectedShopId"> {
  const ctx = useContext(ShopContext);
  if (!ctx) {
    throw new Error("useShop must be used within a ShopProvider");
  }
  return {
    selectedShopId: ctx.selectedShopId,
    setSelectedShopId: ctx.setSelectedShopId,
  };
}

/**
 * PUBLIC_INTERFACE
 * useSidebar
 * @description Hook to access the mobile sidebar open state and setter.
 * Throws an error if used outside of ShopProvider.
 * @returns An object with { sidebarOpen, setSidebarOpen }
 */
export function useSidebar(): Pick<ShopContextValue, "sidebarOpen" | "setSidebarOpen"> {
  const ctx = useContext(ShopContext);
  if (!ctx) {
    throw new Error("useSidebar must be used within a ShopProvider");
  }
  return {
    sidebarOpen: ctx.sidebarOpen,
    setSidebarOpen: ctx.setSidebarOpen,
  };
}

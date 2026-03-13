"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PageHeaderConfig {
  title: string;
  label?: string;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const PageHeaderContext = createContext<{
  config: PageHeaderConfig | null;
  setConfig: (config: PageHeaderConfig | null) => void;
}>({ config: null, setConfig: () => {} });

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function PageHeaderProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<PageHeaderConfig | null>(null);
  return (
    <PageHeaderContext.Provider value={{ config, setConfig }}>
      {children}
    </PageHeaderContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function usePageHeader() {
  return useContext(PageHeaderContext).config;
}

export function useSetPageHeader(config: PageHeaderConfig) {
  const { setConfig } = useContext(PageHeaderContext);
  const stableConfig = useMemo(
    () => ({ title: config.title, label: config.label }),
    [config.title, config.label],
  );
  useEffect(() => {
    setConfig(stableConfig);
    return () => setConfig(null);
  }, [stableConfig, setConfig]);
}

// ---------------------------------------------------------------------------
// Tab root detection
// ---------------------------------------------------------------------------

export const TAB_ROOT_PATHS = ["/", "/orders", "/saved", "/account"];

export function useIsTabRoot() {
  const pathname = usePathname();
  return TAB_ROOT_PATHS.includes(pathname);
}

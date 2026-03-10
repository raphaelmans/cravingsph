"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
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
  useEffect(() => {
    setConfig(config);
    return () => setConfig(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.title, config.label, setConfig]);
}

// ---------------------------------------------------------------------------
// Tab root detection
// ---------------------------------------------------------------------------

export const TAB_ROOT_PATHS = ["/", "/orders", "/saved", "/account"];

export function useIsTabRoot() {
  const pathname = usePathname();
  return TAB_ROOT_PATHS.includes(pathname);
}

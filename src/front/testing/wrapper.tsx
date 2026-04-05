import type { ReactNode } from "react";
import { MemoryRouter } from "react-router";
import { SWRConfig } from "swr";
import { AuthProvider } from "../shared/auth/auth-context";
import { ThemeProvider } from "../shared/theme/theme-context";

const swrTestConfig = { provider: () => new Map(), dedupingInterval: 0 };

export function TestWrapper({ children }: { children: ReactNode }) {
  return (
    <SWRConfig value={swrTestConfig}>
      <AuthProvider>
        <ThemeProvider>
          <MemoryRouter>{children}</MemoryRouter>
        </ThemeProvider>
      </AuthProvider>
    </SWRConfig>
  );
}

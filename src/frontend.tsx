import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@wanteddev/wds";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@wanteddev/wds/theme.css";
import "@wanteddev/wds/reset.css";
import '@stackflow/plugin-basic-ui/index.css';
import { App } from "./App";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 30, retry: 1 },
  },
});

async function prepare() {
  const { worker } = await import('./mocks/browser');
  return worker.start({ onUnhandledRequest: 'bypass' });
}

const elem = document.getElementById("root")!;

prepare().then(() => {
  const app = (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </QueryClientProvider>
    </StrictMode>
  );
  (import.meta.hot.data.root ??= createRoot(elem)).render(app);
});

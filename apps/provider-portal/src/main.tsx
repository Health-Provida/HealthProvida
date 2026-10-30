import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProviderStoreProvider } from "@/lib/provider-store";
import { Toaster } from "@/components/ui/sonner";
import App from "./App";
import "./styles.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename="/provider">
        <ProviderStoreProvider>
          <App />
          <Toaster position="top-right" richColors />
        </ProviderStoreProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);


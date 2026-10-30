import { Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import Dashboard from "@/pages/Dashboard";
import ProvidersIndex from "@/pages/ProvidersIndex";
import ProviderDetail from "@/pages/ProviderDetail";
import Verification from "@/pages/Verification";
import Tariffs from "@/pages/Tariffs";
import QualityAudit from "@/pages/QualityAudit";
import NotFound from "@/pages/NotFound";

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/providers" element={<ProvidersIndex />} />
        <Route path="/providers/:providerId" element={<ProviderDetail />} />
        <Route path="/verification" element={<Verification />} />
        <Route path="/tariffs" element={<Tariffs />} />
        <Route path="/quality-audit" element={<QualityAudit />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppShell>
  );
}

import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppHeader } from "@/components/provider/app-header";
import { AppSidebar } from "@/components/provider/app-sidebar";
import { ProviderStoreProvider } from "@/lib/provider-store";
import ProtectedRoute from "@/components/provider/ProtectedRoute";

// ─── Code-split pages ────────────────────────────────────────
const Login = lazy(() => import("@/pages/Login"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Today = lazy(() => import("@/pages/Today"));
const Appointments = lazy(() => import("@/pages/Appointments"));
const AppointmentDetail = lazy(() => import("@/pages/AppointmentDetail"));
const Encounters = lazy(() => import("@/pages/Encounters"));
const HmoPatients = lazy(() => import("@/pages/HmoPatients"));
const Authorizations = lazy(() => import("@/pages/Authorizations"));
const Doctors = lazy(() => import("@/pages/Doctors"));
const Schedules = lazy(() => import("@/pages/Schedules"));
const Services = lazy(() => import("@/pages/Services"));
const Facility = lazy(() => import("@/pages/Facility"));
const Verification = lazy(() => import("@/pages/Verification"));
const Performance = lazy(() => import("@/pages/Performance"));
const Promoted = lazy(() => import("@/pages/Promoted"));
const EmrSync = lazy(() => import("@/pages/EmrSync"));
const Notifications = lazy(() => import("@/pages/Notifications"));
const Settings = lazy(() => import("@/pages/Settings"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// ─── Page loading fallback ───────────────────────────────────
function PageLoader() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    </div>
  );
}

// ─── Dashboard layout (sidebar + header + content) ───────────
function DashboardLayout() {
  return (
    <ProtectedRoute>
      <ProviderStoreProvider>
        <SidebarProvider>
          <div className="flex min-h-screen w-full bg-background">
            <AppSidebar />
            <SidebarInset className="min-w-0 bg-background">
              <AppHeader />
              <main className="mx-auto w-full min-w-0 max-w-[1440px] flex-1 px-4 py-6 sm:px-6 lg:px-8">
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route index element={<Dashboard />} />
                    <Route path="today" element={<Today />} />
                    <Route path="appointments" element={<Appointments />} />
                    <Route path="appointments/:appointmentId" element={<AppointmentDetail />} />
                    <Route path="encounters" element={<Encounters />} />
                    <Route path="hmo-patients" element={<HmoPatients />} />
                    <Route path="authorizations" element={<Authorizations />} />
                    <Route path="doctors" element={<Doctors />} />
                    <Route path="schedules" element={<Schedules />} />
                    <Route path="services" element={<Services />} />
                    <Route path="facility" element={<Facility />} />
                    <Route path="verification" element={<Verification />} />
                    <Route path="performance" element={<Performance />} />
                    <Route path="promoted" element={<Promoted />} />
                    <Route path="emr-sync" element={<EmrSync />} />
                    <Route path="notifications" element={<Notifications />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </main>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </ProviderStoreProvider>
    </ProtectedRoute>
  );
}

// ─── Root app routes ─────────────────────────────────────────
export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={<DashboardLayout />} />
      </Routes>
    </Suspense>
  );
}

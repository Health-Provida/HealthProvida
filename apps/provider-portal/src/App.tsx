import { Routes, Route, Navigate } from "react-router-dom";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppHeader } from "@/components/provider/app-header";
import { AppSidebar } from "@/components/provider/app-sidebar";

import Dashboard from "@/pages/Dashboard";
import Today from "@/pages/Today";
import Appointments from "@/pages/Appointments";
import AppointmentDetail from "@/pages/AppointmentDetail";
import Encounters from "@/pages/Encounters";
import HmoPatients from "@/pages/HmoPatients";
import Authorizations from "@/pages/Authorizations";
import Doctors from "@/pages/Doctors";
import Schedules from "@/pages/Schedules";
import Services from "@/pages/Services";
import Facility from "@/pages/Facility";
import Verification from "@/pages/Verification";
import Performance from "@/pages/Performance";
import Promoted from "@/pages/Promoted";
import EmrSync from "@/pages/EmrSync";
import Notifications from "@/pages/Notifications";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";

function DashboardLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <SidebarInset className="min-w-0 bg-background">
          <AppHeader />
          <main className="mx-auto w-full min-w-0 max-w-[1440px] flex-1 px-4 py-6 sm:px-6 lg:px-8">
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
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/*" element={<DashboardLayout />} />
    </Routes>
  );
}


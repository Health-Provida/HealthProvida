import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import OrdersIndex from "@/pages/OrdersIndex";
import OrderDetail from "@/pages/OrderDetail";
import Samples from "@/pages/Samples";
import ResultsIndex from "@/pages/ResultsIndex";
import ResultDetail from "@/pages/ResultDetail";
import Tests from "@/pages/Tests";
import Patients from "@/pages/Patients";
import Profile from "@/pages/Profile";
import Notifications from "@/pages/Notifications";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/orders" element={<OrdersIndex />} />
      <Route path="/orders/:orderId" element={<OrderDetail />} />
      <Route path="/samples" element={<Samples />} />
      <Route path="/results" element={<ResultsIndex />} />
      <Route path="/results/:resultId" element={<ResultDetail />} />
      <Route path="/tests" element={<Tests />} />
      <Route path="/patients" element={<Patients />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

import { BrowserRouter, Route, Routes } from "react-router-dom";
import { DefaultProviders } from "./components/providers/default.tsx";
import AuthCallback from "./pages/auth/Callback.tsx";
import Index from "./pages/Index.tsx";
import Dashboard from "./pages/dashboard/page.tsx";
import TimeCardPage from "./pages/time-card/page.tsx";
import TravelLogPage from "./pages/travel-log/page.tsx";
import FilesPage from "./pages/files/page.tsx";
import AdminPage from "./pages/admin/page.tsx";
import NotFound from "./pages/NotFound.tsx";
import { useServiceWorker } from "@/hooks/use-service-worker.ts";
import { InstallPrompt } from "@/components/InstallPrompt.tsx";

export default function App() {
  useServiceWorker();
  return (
   <DefaultProviders>  {/* <--- PASTIKAN BARIS 17 INI ADA! */}
    <BrowserRouter basename="/anime4u5">
        <Routes>
          {/* Bypass auth logic, directly render the dashboard */}
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/time-card" element={<TimeCardPage />} />
          <Route path="/travel-log" element={<TravelLogPage />} />
          <Route path="/files" element={<FilesPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <InstallPrompt />
      </BrowserRouter>
    </DefaultProviders>
  );
}


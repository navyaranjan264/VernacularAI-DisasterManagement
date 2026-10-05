import DisasterAssessmentTab from "./components/DisasterAssessmentTab";
import MicroAlertTab from "./components/MicroAlertTab";
import VisionIAPGenerator from "./components/VisionIAPGenerator";
import { LanguageProvider } from "./context/LanguageContext";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Emergency from "./pages/Emergency";
import Install from "./pages/Install";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/emergency" element={<Emergency />} />
            <Route path="/disaster-assessment" element={<DisasterAssessmentTab />} />
            <Route path="/micro-alert" element={<MicroAlertTab />} />
            <Route path="/vision-iap" element={<DisasterAssessmentTab />} />
            <Route path="/damage-simulator" element={<DisasterAssessmentTab />} />
            <Route path="/install" element={<Install />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
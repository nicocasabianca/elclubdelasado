import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";
import { Recipes } from "./pages/Recipes";
import Calculator from "./pages/Calculator";
import CompleteProfile from "./pages/CompleteProfile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/complete-profile" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <CompleteProfile />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Dashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/events" 
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Events />
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/recipes" 
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Recipes />
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/calculator" 
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Calculator />
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/members" 
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <div className="p-8 text-center">
                      <h1 className="text-2xl font-bold mb-4">Miembros del Club</h1>
                      <p className="text-muted-foreground">Esta sección estará disponible pronto...</p>
                    </div>
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

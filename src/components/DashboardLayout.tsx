import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {/* Sidebar */}
        <AppSidebar />

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          {/* Header con trigger del sidebar */}
          <header className="h-12 flex items-center border-b bg-background px-4">
            <SidebarTrigger />
            <div className="ml-4">
              <h2 className="font-semibold">El Club del Asado</h2>
            </div>
          </header>

          {/* Contenido principal */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
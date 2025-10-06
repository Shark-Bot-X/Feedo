import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Logo from "@/components/Logo";
import { FeedbackDetailDialog } from "@/components/FeedbackDetailDialog";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border flex items-center px-6 gap-4">
            <SidebarTrigger />
            <Logo size="sm" />
          </header>
          <main className="flex-1">{children}</main>
        </div>
      </div>
      <FeedbackDetailDialog />
    </SidebarProvider>
  );
};

export default DashboardLayout;

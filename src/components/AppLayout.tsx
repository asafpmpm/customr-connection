import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AppTopbar } from "@/components/AppTopbar";
import { GuidedTour } from "@/components/GuidedTour";

export function AppLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <AppTopbar />
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
          <footer className="border-t px-6 py-3 text-xs text-muted-foreground bg-card/60">
            שימוש במידע אישי (כגון תאריך לידה/שיוך דתי) צריך להיעשות באחריות ומתוך כבוד לפרטיות הלקוח.
          </footer>
          <GuidedTour />
        </div>
      </div>
    </SidebarProvider>
  );
}

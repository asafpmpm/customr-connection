import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { LogOut } from "lucide-react";

export function AppTopbar() {
  const { user, signOut } = useAuth();

  return (
    <header className="h-14 border-b bg-card/80 backdrop-blur-sm flex items-center justify-between px-4 flex-shrink-0 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <h1 className="text-sm font-medium text-foreground hidden sm:block">
          Customer Connection
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground hidden sm:block">
          {user?.email}
        </span>
        <Button variant="ghost" size="sm" onClick={signOut} className="gap-2">
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">יציאה</span>
        </Button>
      </div>
    </header>
  );
}

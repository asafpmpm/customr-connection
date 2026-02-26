import {
  LayoutDashboard,
  Users,
  CalendarHeart,
  FileText,
  Megaphone,
  ListChecks,
  Mail,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "דשבורד", url: "/", icon: LayoutDashboard },
  { title: "לקוחות", url: "/customers", icon: Users },
  { title: "אירועים", url: "/events", icon: CalendarHeart },
  { title: "תבניות", url: "/templates", icon: FileText },
  { title: "הודעה חדשה", url: "/messages/new", icon: Mail },
  { title: "קמפיינים", url: "/campaigns", icon: Megaphone },
  { title: "משימות היום", url: "/daily", icon: ListChecks },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar side="right" collapsible="icon">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sidebar-primary flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="font-bold text-sidebar-primary-foreground text-sm leading-tight">
                Customer Connection
              </h2>
              <p className="text-[11px] text-sidebar-foreground/60">ניהול קשרי לקוחות</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs">
            ניווט ראשי
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-primary-foreground font-medium"
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

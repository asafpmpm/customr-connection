import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Cake,
  CalendarHeart,
  AlertCircle,
  Megaphone,
  Plus,
  Mail,
  TrendingUp,
} from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCustomers: 0,
    birthdaysToday: 0,
    birthdaysTomorrow: 0,
    upcomingHolidays: 0,
    openEvents: 0,
    recentCampaigns: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      const today = new Date().toISOString().slice(5, 10);
      const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(5, 10);

      const [customersRes, eventsRes, campaignsRes] = await Promise.all([
        supabase.from("customers").select("id, birth_date", { count: "exact" }).eq("user_id", user.id),
        supabase.from("relationship_events").select("id").eq("user_id", user.id).eq("status", "open"),
        supabase.from("campaigns").select("id").eq("user_id", user.id),
      ]);

      const customers = customersRes.data || [];
      const birthdaysToday = customers.filter(c => c.birth_date?.slice(5) === today).length;
      const birthdaysTomorrow = customers.filter(c => c.birth_date?.slice(5) === tomorrow).length;

      setStats({
        totalCustomers: customersRes.count || 0,
        birthdaysToday,
        birthdaysTomorrow,
        upcomingHolidays: 0,
        openEvents: eventsRes.data?.length || 0,
        recentCampaigns: campaignsRes.data?.length || 0,
      });
      setLoading(false);
    };
    fetchStats();
  }, [user]);

  const kpiCards = [
    { title: "סה\"כ לקוחות", value: stats.totalCustomers, icon: Users, color: "text-primary", bg: "bg-primary/10" },
    { title: "ימי הולדת היום", value: stats.birthdaysToday, icon: Cake, color: "text-pink-500", bg: "bg-pink-500/10" },
    { title: "ימי הולדת מחר", value: stats.birthdaysTomorrow, icon: Cake, color: "text-orange-500", bg: "bg-orange-500/10" },
    { title: "אירועים פתוחים", value: stats.openEvents, icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-500/10" },
    { title: "קמפיינים", value: stats.recentCampaigns, icon: Megaphone, color: "text-secondary", bg: "bg-secondary/10" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-foreground">דשבורד</h1>
          <p className="text-muted-foreground text-sm">תמונת מצב מהירה</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => navigate("/customers")} className="gap-2 btn-hover shadow-sm">
            <Plus className="w-4 h-4" /> הוסף לקוח
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigate("/campaigns")} className="gap-2 btn-hover">
            <Megaphone className="w-4 h-4" /> צור קמפיין
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpiCards.map((kpi, i) => (
          <Card key={kpi.title} className={`card-hover animate-fade-in-up stagger-${i + 1}`}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${kpi.bg} ${kpi.color} transition-transform duration-300 group-hover:scale-110`}>
                <kpi.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{loading ? "..." : kpi.value}</p>
                <p className="text-xs text-muted-foreground">{kpi.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions and tasks */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="card-hover animate-fade-in-up stagger-3">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarHeart className="w-5 h-5 text-primary" />
              משימות היום
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.birthdaysToday === 0 && stats.openEvents === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">הכל מטופל! 🎉</p>
                <p className="text-sm">אין משימות ליום זה</p>
              </div>
            ) : (
              <div className="space-y-2">
                {stats.birthdaysToday > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-pink-50 dark:bg-pink-950/20 transition-all duration-200 hover:bg-pink-100 dark:hover:bg-pink-950/30">
                    <div className="flex items-center gap-2">
                      <Cake className="w-4 h-4 text-pink-500" />
                      <span className="text-sm">{stats.birthdaysToday} ימי הולדת היום</span>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => navigate("/daily")} className="btn-hover">
                      צפה
                    </Button>
                  </div>
                )}
                {stats.openEvents > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 transition-all duration-200 hover:bg-amber-100 dark:hover:bg-amber-950/30">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                      <span className="text-sm">{stats.openEvents} אירועים פתוחים</span>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => navigate("/events")} className="btn-hover">
                      צפה
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="card-hover animate-fade-in-up stagger-4">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Mail className="w-5 h-5 text-secondary" />
              פעולות מהירות
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start gap-2 btn-hover" onClick={() => navigate("/customers")}>
              <Users className="w-4 h-4" /> ניהול לקוחות
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2 btn-hover" onClick={() => navigate("/templates")}>
              <Mail className="w-4 h-4" /> תבניות הודעה
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2 btn-hover" onClick={() => navigate("/daily")}>
              <CalendarHeart className="w-4 h-4" /> משימות היום
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

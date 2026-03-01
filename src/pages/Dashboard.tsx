import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DemoGuard from "@/components/DemoGuard";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
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
  const { toast } = useToast();
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

  const loadDemoData = async () => {
    if (!user) return;
    const today = new Date();
    const in2Days = new Date(Date.now() + 2 * 86400000);
    const in5Days = new Date(Date.now() + 5 * 86400000);

    const demoCustomers = [
      {
        user_id: user.id,
        first_name: "דניאל",
        last_name: "כהן",
        role: "CTO",
        organization: "NovaTech",
        email: "daniel@novatech.io",
        phone: "050-1234567",
        birth_date: new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString().slice(0, 10),
        religion_affiliation: "יהודי",
        notes: "נפגש בכנס 2024",
        is_active: true,
      },
      {
        user_id: user.id,
        first_name: "ליילה",
        last_name: "חמיד",
        role: "VP Sales",
        organization: "Skyline",
        email: "layla@skyline.com",
        phone: "052-7654321",
        birth_date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString().slice(0, 10),
        religion_affiliation: "מוסלמי",
        notes: "מתעניינת בשותפות",
        is_active: true,
      },
      {
        user_id: user.id,
        first_name: "נועה",
        last_name: "לוי",
        role: "Founder",
        organization: "BrightLabs",
        email: "noa@brightlabs.co",
        phone: "054-9988776",
        birth_date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10).toISOString().slice(0, 10),
        religion_affiliation: "נוצרי",
        notes: "צריכה הצעת ערך",
        is_active: true,
      },
    ];

    const { data: existing } = await supabase
      .from("customers")
      .select("email, phone")
      .eq("user_id", user.id);

    const existingEmails = new Set((existing || []).map(c => c.email).filter(Boolean) as string[]);
    const existingPhones = new Set((existing || []).map(c => c.phone).filter(Boolean) as string[]);

    const toInsert = demoCustomers.filter(c => !existingEmails.has(c.email) && !existingPhones.has(c.phone));

    let customerIds: string[] = [];
    if (toInsert.length > 0) {
      const { data: customers, error: customersError } = await supabase.from("customers").insert(toInsert).select("id");
      if (customersError) {
        toast({ title: "שגיאה", description: customersError.message, variant: "destructive" });
        return;
      }
      customerIds = (customers || []).map(c => c.id);
    }

    const { data: demoIds } = await supabase
      .from("customers")
      .select("id, email")
      .eq("user_id", user.id)
      .in("email", demoCustomers.map(c => c.email));

    const idByEmail = new Map((demoIds || []).map(c => [c.email, c.id]));
    const firstId = idByEmail.get("daniel@novatech.io");

    if (firstId) {
      await supabase.from("relationship_events").insert([
        {
          user_id: user.id,
          customer_id: firstId,
          event_type: "personal",
          event_title: "פגישת המשך",
          event_date: in2Days.toISOString().slice(0, 10),
          notes: "להכין הצעת שיתופי פעולה",
          status: "open",
        },
      ]);
    }

    await supabase.from("holidays").insert([
      {
        user_id: user.id,
        holiday_name: "פסח",
        religion_affiliation: "יהודי",
        holiday_date: in5Days.toISOString().slice(0, 10),
        description: "חג האביב",
        is_active: true,
      },
      {
        user_id: user.id,
        holiday_name: "עיד אל-פיטר",
        religion_affiliation: "מוסלמי",
        holiday_date: in2Days.toISOString().slice(0, 10),
        description: "סיום הרמדאן",
        is_active: true,
      },
    ]);

    await supabase.from("message_templates").insert([
      {
        user_id: user.id,
        template_name: "ברכת יום הולדת קצרה",
        category: "birthday",
        channel: "email",
        subject_template: "מזל טוב, {first_name}!",
        body_template: "שלום {first_name}, מאחל/ת לך יום הולדת שמח והמון הצלחה!",
        is_default: true,
      },
      {
        user_id: user.id,
        template_name: "ברכת חג",
        category: "holiday",
        channel: "email",
        subject_template: "חג שמח, {first_name}",
        body_template: "שלום {first_name}, מאחל/ת לך חג שמח והרבה אור.",
        is_default: true,
      },
    ]);

    await supabase.from("campaigns").insert([
      {
        user_id: user.id,
        campaign_name: "עדכון מוצר רבעוני",
        campaign_type: "professional",
        subject_template: "עדכון מוצר – רבעון חדש",
        body_template: "שלום {first_name}, רצינו לשתף בעדכון האחרון...",
        status: "ready",
      },
    ]);

    toast({ title: "נתוני דמו נטענו" });
  };

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
          <DemoGuard>
            <Button size="sm" onClick={() => navigate("/customers")} className="gap-2 btn-hover shadow-sm">
              <Plus className="w-4 h-4" /> הוסף לקוח
            </Button>
          </DemoGuard>
          <DemoGuard>
            <Button size="sm" variant="outline" onClick={() => navigate("/campaigns")} className="gap-2 btn-hover">
              <Megaphone className="w-4 h-4" /> צור קמפיין
            </Button>
          </DemoGuard>
          <DemoGuard>
            <Button
              size="sm"
              variant="secondary"
              onClick={async () => {
                await loadDemoData();
                localStorage.setItem("guidedTour", "start");
                window.dispatchEvent(new Event("guidedTourStart"));
              }}
              className="gap-2 btn-hover"
            >
              התחל דמו
            </Button>
          </DemoGuard>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4" data-tour="dashboard-kpis">
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

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Cake, CalendarHeart, AlertCircle, CheckCircle, ListChecks, Megaphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";
import DemoGuard from "@/components/DemoGuard";

type Customer = Tables<"customers">;
type Event = Tables<"relationship_events"> & { customers?: { first_name: string; last_name: string } };
type Holiday = Tables<"holidays">;
type Campaign = Tables<"campaigns">;

type HolidayTask = { customer: Customer; holiday: Holiday };

const DailyActions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [birthdaysToday, setBirthdaysToday] = useState<Customer[]>([]);
  const [birthdaysTomorrow, setBirthdaysTomorrow] = useState<Customer[]>([]);
  const [openEvents, setOpenEvents] = useState<Event[]>([]);
  const [holidayTasks, setHolidayTasks] = useState<HolidayTask[]>([]);
  const [readyCampaigns, setReadyCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [messageCustomerId, setMessageCustomerId] = useState<string>("");
  const [messageCategory, setMessageCategory] = useState<string>("birthday");

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const today = new Date();
      const todayKey = today.toISOString().slice(5, 10);
      const tomorrowKey = new Date(Date.now() + 86400000).toISOString().slice(5, 10);
      const weekAhead = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

      const [customersRes, eventsRes, holidaysRes, campaignsRes] = await Promise.all([
        supabase.from("customers").select("*").eq("user_id", user.id).eq("is_active", true),
        supabase.from("relationship_events").select("*, customers(first_name, last_name)").eq("user_id", user.id).eq("status", "open").order("event_date"),
        supabase.from("holidays").select("*").eq("user_id", user.id).eq("is_active", true).gte("holiday_date", today.toISOString().slice(0, 10)).lte("holiday_date", weekAhead).order("holiday_date"),
        supabase.from("campaigns").select("*").eq("user_id", user.id).eq("status", "ready").order("created_at", { ascending: false }),
      ]);

      const customers = customersRes.data || [];
      setBirthdaysToday(customers.filter(c => c.birth_date?.slice(5) === todayKey));
      setBirthdaysTomorrow(customers.filter(c => c.birth_date?.slice(5) === tomorrowKey));
      setOpenEvents((eventsRes.data as Event[]) || []);
      setReadyCampaigns((campaignsRes.data as Campaign[]) || []);

      const holidays = (holidaysRes.data as Holiday[]) || [];
      const tasks: HolidayTask[] = [];
      holidays.forEach((h) => {
        customers
          .filter(c => (c.religion_affiliation || "") === h.religion_affiliation)
          .forEach(c => tasks.push({ customer: c, holiday: h }));
      });
      setHolidayTasks(tasks);

      setLoading(false);
    };
    fetchData();
  }, [user]);

  const handleMarkHandled = async (id: string) => {
    await supabase.from("relationship_events").update({ status: "handled" }).eq("id", id);
    setOpenEvents(prev => prev.filter(e => e.id !== id));
  };

  if (loading) return <div className="text-center py-12 text-muted-foreground animate-fade-in">טוען...</div>;

  const isEmpty = birthdaysToday.length === 0 && birthdaysTomorrow.length === 0 && openEvents.length === 0 && holidayTasks.length === 0 && readyCampaigns.length === 0;

  const openMessageDialog = (customerId: string, defaultCategory: string) => {
    setMessageCustomerId(customerId);
    setMessageCategory(defaultCategory);
    setMessageDialogOpen(true);
  };

  const goToComposer = () => {
    if (!messageCustomerId) return;
    setMessageDialogOpen(false);
    navigate(`/messages/new?customerId=${messageCustomerId}&category=${messageCategory}`);
  };

  return (
    <div className="space-y-6 animate-fade-in" data-tour="daily-actions">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold">משימות היום</h1>
        <p className="text-muted-foreground text-sm">מרכז פעולה יומי</p>
      </div>

      {isEmpty ? (
        <Card className="animate-fade-in-up stagger-1">
          <CardContent className="text-center py-16">
            <ListChecks className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-lg font-medium text-muted-foreground">הכל מטופל! 🎉</p>
            <p className="text-sm text-muted-foreground">אין משימות ליום זה</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {birthdaysToday.length > 0 && (
            <Card className="card-hover animate-fade-in-up stagger-1">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Cake className="w-5 h-5 text-pink-500" /> ימי הולדת היום ({birthdaysToday.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {birthdaysToday.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-pink-50 dark:bg-pink-950/20 transition-all duration-200 hover:bg-pink-100 dark:hover:bg-pink-950/30 hover:shadow-sm">
                    <div>
                      <p className="font-medium">{c.first_name} {c.last_name}</p>
                      <p className="text-sm text-muted-foreground">{c.organization} • {c.role}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-pink-600">🎂 יום הולדת!</Badge>
                      <DemoGuard>
                        <Button size="sm" variant="outline" onClick={() => openMessageDialog(c.id, "birthday")}>צור הודעה</Button>
                      </DemoGuard>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {birthdaysTomorrow.length > 0 && (
            <Card className="card-hover animate-fade-in-up stagger-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Cake className="w-5 h-5 text-orange-500" /> ימי הולדת מחר ({birthdaysTomorrow.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {birthdaysTomorrow.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-orange-50 dark:bg-orange-950/20 transition-all duration-200 hover:bg-orange-100 dark:hover:bg-orange-950/30 hover:shadow-sm">
                    <div>
                      <p className="font-medium">{c.first_name} {c.last_name}</p>
                      <p className="text-sm text-muted-foreground">{c.organization} • {c.role}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-orange-600">🎂 מחר</Badge>
                      <DemoGuard>
                        <Button size="sm" variant="outline" onClick={() => openMessageDialog(c.id, "birthday")}>צור הודעה</Button>
                      </DemoGuard>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {holidayTasks.length > 0 && (
            <Card className="card-hover animate-fade-in-up stagger-3">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarHeart className="w-5 h-5 text-primary" /> חגים קרובים ({holidayTasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {holidayTasks.map((t, i) => (
                  <div key={`${t.customer.id}-${t.holiday.id}-${i}`} className="flex items-center justify-between p-3 rounded-xl bg-primary/5 transition-all duration-200 hover:bg-primary/10 hover:shadow-sm">
                    <div>
                      <p className="font-medium">{t.customer.first_name} {t.customer.last_name}</p>
                      <p className="text-sm text-muted-foreground">{t.holiday.holiday_name} • {new Date(t.holiday.holiday_date).toLocaleDateString("he-IL")}</p>
                    </div>
                      <DemoGuard>
                        <Button size="sm" variant="outline" onClick={() => openMessageDialog(t.customer.id, "holiday")}>צור הודעה</Button>
                      </DemoGuard>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {openEvents.length > 0 && (
            <Card className="card-hover animate-fade-in-up stagger-4">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" /> אירועים פתוחים ({openEvents.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {openEvents.map(ev => (
                  <div key={ev.id} className="flex items-center justify-between p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 transition-all duration-200 hover:bg-amber-100 dark:hover:bg-amber-950/30 hover:shadow-sm">
                    <div>
                      <p className="font-medium">{ev.event_title}</p>
                      <p className="text-sm text-muted-foreground">
                        {ev.customers ? `${ev.customers.first_name} ${ev.customers.last_name}` : "—"} • {new Date(ev.event_date).toLocaleDateString("he-IL")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <DemoGuard>
                        <Button size="sm" variant="outline" onClick={() => openMessageDialog(ev.customer_id, "professional")}>צור הודעה</Button>
                      </DemoGuard>
                      <DemoGuard>
                        <Button size="sm" variant="outline" onClick={() => handleMarkHandled(ev.id)} className="gap-1 btn-hover">
                          <CheckCircle className="w-4 h-4" /> סמן כטופל
                        </Button>
                      </DemoGuard>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {readyCampaigns.length > 0 && (
            <Card className="card-hover animate-fade-in-up stagger-5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-secondary" /> קמפיינים ממתינים ({readyCampaigns.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {readyCampaigns.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/10 transition-all duration-200 hover:bg-secondary/20 hover:shadow-sm">
                    <div>
                      <p className="font-medium">{c.campaign_name}</p>
                      <p className="text-sm text-muted-foreground">{c.campaign_type === "professional" ? "מקצועי" : "שיווקי"}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => navigate("/campaigns")}>לצפייה</Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
      <DialogContent className="max-w-md animate-scale-in">
        <DialogHeader><DialogTitle>בחר סוג הודעה</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <Select value={messageCategory} onValueChange={setMessageCategory}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="birthday">יום הולדת</SelectItem>
              <SelectItem value="holiday">חג</SelectItem>
              <SelectItem value="professional">מקצועי</SelectItem>
              <SelectItem value="marketing">שיווקי</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setMessageDialogOpen(false)}>ביטול</Button>
            <Button onClick={goToComposer}>המשך</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </div>
  );
};

export default DailyActions;

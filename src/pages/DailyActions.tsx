import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Cake, CalendarHeart, AlertCircle, CheckCircle, ListChecks } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Customer = Tables<"customers">;
type Event = Tables<"relationship_events"> & { customers?: { first_name: string; last_name: string } };

const DailyActions = () => {
  const { user } = useAuth();
  const [birthdaysToday, setBirthdaysToday] = useState<Customer[]>([]);
  const [birthdaysTomorrow, setBirthdaysTomorrow] = useState<Customer[]>([]);
  const [openEvents, setOpenEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const today = new Date().toISOString().slice(5, 10);
      const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(5, 10);
      const [customersRes, eventsRes] = await Promise.all([
        supabase.from("customers").select("*").eq("user_id", user.id).eq("is_active", true),
        supabase.from("relationship_events").select("*, customers(first_name, last_name)").eq("user_id", user.id).eq("status", "open").order("event_date"),
      ]);
      const customers = customersRes.data || [];
      setBirthdaysToday(customers.filter(c => c.birth_date?.slice(5) === today));
      setBirthdaysTomorrow(customers.filter(c => c.birth_date?.slice(5) === tomorrow));
      setOpenEvents((eventsRes.data as Event[]) || []);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const handleMarkHandled = async (id: string) => {
    await supabase.from("relationship_events").update({ status: "handled" }).eq("id", id);
    setOpenEvents(prev => prev.filter(e => e.id !== id));
  };

  if (loading) return <div className="text-center py-12 text-muted-foreground animate-fade-in">טוען...</div>;

  const isEmpty = birthdaysToday.length === 0 && birthdaysTomorrow.length === 0 && openEvents.length === 0;

  return (
    <div className="space-y-6 animate-fade-in">
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
                    <Badge variant="outline" className="text-pink-600">🎂 יום הולדת!</Badge>
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
                    <Badge variant="outline" className="text-orange-600">🎂 מחר</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {openEvents.length > 0 && (
            <Card className="card-hover animate-fade-in-up stagger-3">
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
                    <Button size="sm" variant="outline" onClick={() => handleMarkHandled(ev.id)} className="gap-1 btn-hover">
                      <CheckCircle className="w-4 h-4" /> סמן כטופל
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default DailyActions;

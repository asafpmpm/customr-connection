import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, CalendarHeart, CheckCircle } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Event = Tables<"relationship_events"> & { customers?: { first_name: string; last_name: string } };

const Events = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [customers, setCustomers] = useState<Tables<"customers">[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [newEvent, setNewEvent] = useState({ customer_id: "", event_type: "personal" as string, event_title: "", event_date: "", notes: "" });

  const fetchData = async () => {
    if (!user) return;
    const [eventsRes, customersRes] = await Promise.all([
      supabase.from("relationship_events").select("*, customers(first_name, last_name)").eq("user_id", user.id).order("event_date", { ascending: true }),
      supabase.from("customers").select("*").eq("user_id", user.id),
    ]);
    setEvents((eventsRes.data as Event[]) || []);
    setCustomers(customersRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  const handleAdd = async () => {
    if (!user) return;
    const { error } = await supabase.from("relationship_events").insert({ ...newEvent, user_id: user.id, status: "open" });
    if (error) { toast({ title: "שגיאה", description: error.message, variant: "destructive" }); return; }
    toast({ title: "אירוע נוסף בהצלחה" });
    setDialogOpen(false);
    setNewEvent({ customer_id: "", event_type: "personal", event_title: "", event_date: "", notes: "" });
    fetchData();
  };

  const handleMarkHandled = async (id: string) => {
    await supabase.from("relationship_events").update({ status: "handled" }).eq("id", id);
    fetchData();
  };

  const filtered = events.filter((e) => {
    if (filterType !== "all" && e.event_type !== filterType) return false;
    if (filterStatus !== "all" && e.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in" data-tour="events">
      <div className="flex items-center justify-between flex-wrap gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold">אירועים</h1>
          <p className="text-muted-foreground text-sm">ניהול אירועי קשר</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2 btn-hover shadow-sm">
          <Plus className="w-4 h-4" /> הוסף אירוע
        </Button>
      </div>

      <div className="flex gap-3 flex-wrap animate-fade-in-up stagger-1">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל הסוגים</SelectItem>
            <SelectItem value="birthday">יום הולדת</SelectItem>
            <SelectItem value="holiday">חג</SelectItem>
            <SelectItem value="personal">אישי</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל הסטטוסים</SelectItem>
            <SelectItem value="open">פתוח</SelectItem>
            <SelectItem value="handled">טופל</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {loading ? (
          <p className="text-center py-8 text-muted-foreground">טוען...</p>
        ) : filtered.length === 0 ? (
          <Card className="animate-fade-in-up">
            <CardContent className="text-center py-12">
              <CalendarHeart className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-muted-foreground font-medium">אין אירועים</p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((ev, i) => (
            <Card key={ev.id} className={`card-hover animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-center min-w-[50px] p-2 rounded-xl bg-primary/10">
                    <p className="text-lg font-bold text-primary">{new Date(ev.event_date).getDate()}</p>
                    <p className="text-xs text-muted-foreground">{new Date(ev.event_date).toLocaleDateString("he-IL", { month: "short" })}</p>
                  </div>
                  <div>
                    <p className="font-medium">{ev.event_title}</p>
                    <p className="text-sm text-muted-foreground">
                      {ev.customers ? `${ev.customers.first_name} ${ev.customers.last_name}` : "—"} •{" "}
                      <Badge variant="outline" className="text-xs">
                        {ev.event_type === "birthday" ? "🎂 יום הולדת" : ev.event_type === "holiday" ? "🕯️ חג" : "📌 אישי"}
                      </Badge>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={ev.status === "handled" ? "secondary" : "default"}>
                    {ev.status === "handled" ? "טופל" : "פתוח"}
                  </Badge>
                  {ev.status === "open" && (
                    <Button size="sm" variant="ghost" onClick={() => handleMarkHandled(ev.id)} className="gap-1 btn-hover">
                      <CheckCircle className="w-4 h-4" /> סמן כטופל
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="animate-scale-in">
          <DialogHeader><DialogTitle>הוספת אירוע חדש</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>לקוח *</Label>
              <Select value={newEvent.customer_id} onValueChange={(v) => setNewEvent(p => ({ ...p, customer_id: v }))}>
                <SelectTrigger><SelectValue placeholder="בחר לקוח" /></SelectTrigger>
                <SelectContent>{customers.map(c => <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>סוג אירוע</Label>
              <Select value={newEvent.event_type} onValueChange={(v) => setNewEvent(p => ({ ...p, event_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">אישי</SelectItem>
                  <SelectItem value="birthday">יום הולדת</SelectItem>
                  <SelectItem value="holiday">חג</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>כותרת *</Label><Input value={newEvent.event_title} onChange={(e) => setNewEvent(p => ({ ...p, event_title: e.target.value }))} /></div>
            <div className="space-y-2"><Label>תאריך *</Label><Input type="date" dir="ltr" value={newEvent.event_date} onChange={(e) => setNewEvent(p => ({ ...p, event_date: e.target.value }))} /></div>
            <div className="space-y-2"><Label>הערות</Label><Textarea value={newEvent.notes} onChange={(e) => setNewEvent(p => ({ ...p, notes: e.target.value }))} /></div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>ביטול</Button>
              <Button onClick={handleAdd} className="btn-hover">הוסף</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Events;

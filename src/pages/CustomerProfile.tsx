import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Cake,
  Mail,
  Phone,
  Building,
  Briefcase,
  Calendar,
  MessageSquare,
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Customer = Tables<"customers">;
type Event = Tables<"relationship_events">;
type Message = Tables<"message_history">;

const CustomerProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!user || !id) return;
    Promise.all([
      supabase.from("customers").select("*").eq("id", id).single(),
      supabase.from("relationship_events").select("*").eq("customer_id", id).order("event_date", { ascending: false }),
      supabase.from("message_history").select("*").eq("customer_id", id).order("created_at", { ascending: false }),
    ]).then(([cRes, eRes, mRes]) => {
      if (cRes.data) setCustomer(cRes.data);
      setEvents(eRes.data || []);
      setMessages(mRes.data || []);
    });
  }, [user, id]);

  if (!customer) return <div className="text-center py-12 text-muted-foreground">טוען...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/customers")}>
          <ArrowRight className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{customer.first_name} {customer.last_name}</h1>
          <p className="text-muted-foreground text-sm">{customer.role} • {customer.organization}</p>
        </div>
        <Badge variant={customer.is_active ? "default" : "secondary"} className="mr-auto">
          {customer.is_active ? "פעיל" : "לא פעיל"}
        </Badge>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Contact info */}
        <Card className="md:col-span-1">
          <CardHeader><CardTitle className="text-base">פרטי קשר</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {customer.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span dir="ltr">{customer.email}</span>
              </div>
            )}
            {customer.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span dir="ltr">{customer.phone}</span>
              </div>
            )}
            {customer.organization && (
              <div className="flex items-center gap-2 text-sm">
                <Building className="w-4 h-4 text-muted-foreground" />
                <span>{customer.organization}</span>
              </div>
            )}
            {customer.role && (
              <div className="flex items-center gap-2 text-sm">
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                <span>{customer.role}</span>
              </div>
            )}
            {customer.birth_date && (
              <div className="flex items-center gap-2 text-sm">
                <Cake className="w-4 h-4 text-muted-foreground" />
                <span>{new Date(customer.birth_date).toLocaleDateString("he-IL")}</span>
              </div>
            )}
            {customer.religion_affiliation && (
              <Badge variant="outline">{customer.religion_affiliation}</Badge>
            )}
            {customer.notes && (
              <p className="text-sm text-muted-foreground border-t pt-3 mt-3">{customer.notes}</p>
            )}
          </CardContent>
        </Card>

        {/* Events timeline */}
        <Card className="md:col-span-2">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Calendar className="w-4 h-4" /> אירועים</CardTitle></CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">אין אירועים</p>
            ) : (
              <div className="space-y-3">
                {events.map((ev) => (
                  <div key={ev.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="text-sm font-medium">{ev.event_title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(ev.event_date).toLocaleDateString("he-IL")} • {ev.event_type}
                      </p>
                    </div>
                    <Badge variant={ev.status === "handled" ? "secondary" : "default"}>
                      {ev.status === "handled" ? "טופל" : "פתוח"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Message history */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><MessageSquare className="w-4 h-4" /> היסטוריית הודעות</CardTitle></CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">אין הודעות</p>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium">{msg.subject_rendered || msg.message_type}</p>
                    <Badge variant="outline">{msg.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{msg.channel} • {new Date(msg.created_at).toLocaleDateString("he-IL")}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerProfile;

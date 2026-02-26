import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { FileText, Pencil, Eye, Save, CheckCircle, Send } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

const statusLabels: Record<string, string> = {
  draft: "טיוטה",
  ready: "מוכן",
  sent_simulated: "נשלח (סימולציה)",
};

type Customer = Tables<"customers">;
type Template = Tables<"message_templates">;

const renderTemplate = (text: string, customer?: Customer) => {
  if (!text) return text;
  const map: Record<string, string> = {
    "{first_name}": customer?.first_name || "",
    "{last_name}": customer?.last_name || "",
    "{role}": customer?.role || "",
    "{organization}": customer?.organization || "",
    "{holiday_name}": "",
  };
  return Object.entries(map).reduce((acc, [k, v]) => acc.replaceAll(k, v), text);
};

const MessageComposer = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);

  const [customerId, setCustomerId] = useState<string>("");
  const [templateId, setTemplateId] = useState<string>("");
  const [channel, setChannel] = useState<string>("email");
  const [subject, setSubject] = useState<string>("");
  const [body, setBody] = useState<string>("");
  const [messageType, setMessageType] = useState<string>("custom");
  const [preview, setPreview] = useState<boolean>(true);
  const [messageId, setMessageId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("draft");
  const [loading, setLoading] = useState<boolean>(true);

  const customer = useMemo(() => customers.find(c => c.id === customerId), [customers, customerId]);
  const template = useMemo(() => templates.find(t => t.id === templateId), [templates, templateId]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [customersRes, templatesRes] = await Promise.all([
        supabase.from("customers").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("message_templates").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      ]);
      setCustomers(customersRes.data || []);
      setTemplates(templatesRes.data || []);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    if (!template) return;
    setChannel(template.channel);
    setMessageType(template.category || "custom");
    setSubject(template.subject_template || "");
    setBody(template.body_template || "");
    setStatus("draft");
    setMessageId(null);
  }, [templateId]);

  const renderedSubject = renderTemplate(subject, customer);
  const renderedBody = renderTemplate(body, customer);

  const validate = () => {
    if (!customerId) { toast({ title: "בחר לקוח" }); return false; }
    if (!body.trim()) { toast({ title: "תוכן ההודעה חובה" }); return false; }
    return true;
  };

  const saveDraft = async () => {
    if (!user || !validate()) return;
    const payload = {
      customer_id: customerId,
      template_id: templateId || null,
      user_id: user.id,
      channel,
      message_type: messageType,
      subject_rendered: renderedSubject || null,
      body_rendered: renderedBody,
      status: "draft",
    };

    if (messageId) {
      const { error } = await supabase.from("message_history").update(payload).eq("id", messageId);
      if (error) { toast({ title: "שגיאה", description: error.message, variant: "destructive" }); return; }
      toast({ title: "טיוטה עודכנה" });
    } else {
      const { data, error } = await supabase.from("message_history").insert(payload).select("id").single();
      if (error) { toast({ title: "שגיאה", description: error.message, variant: "destructive" }); return; }
      setMessageId(data?.id || null);
      toast({ title: "טיוטה נשמרה" });
    }
    setStatus("draft");
  };

  const updateStatus = async (nextStatus: "ready" | "sent_simulated") => {
    if (!messageId) { toast({ title: "שמור טיוטה לפני שינוי סטטוס" }); return; }
    const { error } = await supabase.from("message_history").update({ status: nextStatus }).eq("id", messageId);
    if (error) { toast({ title: "שגיאה", description: error.message, variant: "destructive" }); return; }
    setStatus(nextStatus);
    toast({ title: nextStatus === "ready" ? "סומן כמוכן" : "סומן כנשלח" });
  };

  if (loading) return <div className="text-center py-12 text-muted-foreground">טוען...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold">יצירת הודעה</h1>
          <p className="text-muted-foreground text-sm">יצירה מתבנית, עריכה ו‑Preview</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={status === "sent_simulated" ? "secondary" : "default"}>{statusLabels[status] || status}</Badge>
          {template && <Badge variant="outline">{template.category}</Badge>}
        </div>
      </div>

      <Card className="card-hover">
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileText className="w-4 h-4" /> בחירת לקוח ותבנית</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>לקוח *</Label>
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger><SelectValue placeholder="בחר לקוח" /></SelectTrigger>
              <SelectContent>
                {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>תבנית</Label>
            <Select value={templateId} onValueChange={setTemplateId}>
              <SelectTrigger><SelectValue placeholder="בחר תבנית" /></SelectTrigger>
              <SelectContent>
                {templates.map(t => <SelectItem key={t.id} value={t.id}>{t.template_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>ערוץ</Label>
            <Select value={channel} onValueChange={setChannel}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Pencil className="w-4 h-4" /> עריכה</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>נושא (למייל)</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="נושא" />
          </div>
          <div className="space-y-2">
            <Label>תוכן *</Label>
            <Textarea rows={6} value={body} onChange={(e) => setBody(e.target.value)} placeholder="שלום {first_name}, ..." />
            <p className="text-xs text-muted-foreground">Placeholders: {"{first_name}"}, {"{last_name}"}, {"{role}"}, {"{organization}"}, {"{holiday_name}"}</p>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={preview} onCheckedChange={setPreview} />
            <Label>הצג Preview</Label>
          </div>
        </CardContent>
      </Card>

      {preview && (
        <Card className="card-hover">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Eye className="w-4 h-4" /> Preview</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {channel === "email" && (
              <div>
                <Label className="text-xs text-muted-foreground">נושא</Label>
                <div className="p-3 rounded-md bg-muted/50 mt-1">{renderedSubject || "(ללא נושא)"}</div>
              </div>
            )}
            <div>
              <Label className="text-xs text-muted-foreground">תוכן</Label>
              <div className="p-3 rounded-md bg-muted/50 mt-1 whitespace-pre-wrap">{renderedBody}</div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-2">
        <Button onClick={saveDraft} className="gap-2"><Save className="w-4 h-4" /> שמור טיוטה</Button>
        <Button variant="outline" onClick={() => updateStatus("ready")} className="gap-2"><CheckCircle className="w-4 h-4" /> סמן כמוכן</Button>
        <Button variant="outline" onClick={() => updateStatus("sent_simulated")} className="gap-2"><Send className="w-4 h-4" /> סמן כנשלח</Button>
      </div>
    </div>
  );
};

export default MessageComposer;

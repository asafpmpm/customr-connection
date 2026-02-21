import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, FileText } from "lucide-react";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

type Template = Tables<"message_templates">;

const categoryLabels: Record<string, string> = {
  birthday: "🎂 יום הולדת", holiday: "🕯️ חג", professional: "💼 מקצועי", marketing: "📢 שיווקי",
};

const Templates = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [form, setForm] = useState<Partial<TablesInsert<"message_templates">>>({ template_name: "", category: "birthday", channel: "email", subject_template: "", body_template: "", is_default: false });

  const fetchTemplates = async () => {
    if (!user) return;
    const { data } = await supabase.from("message_templates").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setTemplates(data || []); setLoading(false);
  };

  useEffect(() => { fetchTemplates(); }, [user]);

  const handleSave = async () => {
    if (!user) return;
    const payload = { ...form, user_id: user.id } as TablesInsert<"message_templates">;
    if (isEditing && form.id) {
      const { error } = await supabase.from("message_templates").update(payload).eq("id", form.id);
      if (error) { toast({ title: "שגיאה", description: error.message, variant: "destructive" }); return; }
    } else {
      const { error } = await supabase.from("message_templates").insert(payload);
      if (error) { toast({ title: "שגיאה", description: error.message, variant: "destructive" }); return; }
    }
    toast({ title: isEditing ? "תבנית עודכנה" : "תבנית נוספה" }); setDialogOpen(false); fetchTemplates();
  };

  const handleDelete = async (id: string) => { await supabase.from("message_templates").delete().eq("id", id); toast({ title: "תבנית נמחקה" }); fetchTemplates(); };
  const openEdit = (t: Template) => { setForm(t); setIsEditing(true); setDialogOpen(true); };
  const openNew = () => { setForm({ template_name: "", category: "birthday", channel: "email", subject_template: "", body_template: "", is_default: false }); setIsEditing(false); setDialogOpen(true); };
  const filtered = filterCategory === "all" ? templates : templates.filter(t => t.category === filterCategory);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold">תבניות הודעה</h1>
          <p className="text-muted-foreground text-sm">ניהול תבניות להודעות אישיות</p>
        </div>
        <Button onClick={openNew} className="gap-2 btn-hover shadow-sm"><Plus className="w-4 h-4" /> תבנית חדשה</Button>
      </div>

      <Select value={filterCategory} onValueChange={setFilterCategory}>
        <SelectTrigger className="w-48 animate-fade-in-up stagger-1"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">כל הקטגוריות</SelectItem>
          <SelectItem value="birthday">יום הולדת</SelectItem>
          <SelectItem value="holiday">חג</SelectItem>
          <SelectItem value="professional">מקצועי</SelectItem>
          <SelectItem value="marketing">שיווקי</SelectItem>
        </SelectContent>
      </Select>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="col-span-full text-center py-8 text-muted-foreground">טוען...</p>
        ) : filtered.length === 0 ? (
          <Card className="col-span-full animate-fade-in-up">
            <CardContent className="text-center py-12">
              <FileText className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-muted-foreground font-medium">אין תבניות</p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((t, i) => (
            <Card key={t.id} className={`card-hover animate-fade-in-up stagger-${Math.min(i + 1, 6)} group`}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{t.template_name}</CardTitle>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(t)} className="hover:bg-primary/10"><Edit className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(t.id)} className="hover:bg-destructive/10"><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-2 flex-wrap">
                  <Badge variant="outline">{categoryLabels[t.category] || t.category}</Badge>
                  <Badge variant="secondary">{t.channel === "email" ? "📧 Email" : "💬 WhatsApp"}</Badge>
                  {t.is_default && <Badge>ברירת מחדל</Badge>}
                </div>
                {t.subject_template && <p className="text-sm font-medium mb-1">{t.subject_template}</p>}
                <p className="text-sm text-muted-foreground line-clamp-3">{t.body_template}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg animate-scale-in">
          <DialogHeader><DialogTitle>{isEditing ? "עריכת תבנית" : "תבנית חדשה"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>שם תבנית *</Label><Input value={form.template_name || ""} onChange={(e) => setForm(p => ({ ...p, template_name: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>קטגוריה</Label>
                <Select value={form.category || "birthday"} onValueChange={(v) => setForm(p => ({ ...p, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="birthday">יום הולדת</SelectItem><SelectItem value="holiday">חג</SelectItem><SelectItem value="professional">מקצועי</SelectItem><SelectItem value="marketing">שיווקי</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>ערוץ</Label>
                <Select value={form.channel || "email"} onValueChange={(v) => setForm(p => ({ ...p, channel: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="email">Email</SelectItem><SelectItem value="whatsapp">WhatsApp</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2"><Label>נושא (למייל)</Label><Input value={form.subject_template || ""} onChange={(e) => setForm(p => ({ ...p, subject_template: e.target.value }))} /></div>
            <div className="space-y-2">
              <Label>תוכן התבנית *</Label>
              <Textarea rows={4} value={form.body_template || ""} onChange={(e) => setForm(p => ({ ...p, body_template: e.target.value }))} placeholder="שלום {first_name}, ..." />
              <p className="text-xs text-muted-foreground">Placeholders: {"{first_name}"}, {"{last_name}"}, {"{role}"}, {"{organization}"}, {"{holiday_name}"}</p>
            </div>
            <div className="flex items-center gap-2"><Switch checked={form.is_default || false} onCheckedChange={(v) => setForm(p => ({ ...p, is_default: v }))} /><Label>ברירת מחדל</Label></div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>ביטול</Button>
              <Button onClick={handleSave} className="btn-hover">{isEditing ? "עדכן" : "הוסף"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Templates;

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
import { useToast } from "@/hooks/use-toast";
import { Plus, Megaphone, Send, FileCheck } from "lucide-react";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

type Campaign = Tables<"campaigns">;

const statusLabels: Record<string, string> = { draft: "טיוטה", ready: "מוכן", sent_simulated: "נשלח (סימולציה)" };

const Campaigns = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<Partial<TablesInsert<"campaigns">>>({ campaign_name: "", campaign_type: "professional", subject_template: "", body_template: "", target_filters: {} });

  const fetchCampaigns = async () => {
    if (!user) return;
    const { data } = await supabase.from("campaigns").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setCampaigns(data || []); setLoading(false);
  };

  useEffect(() => { fetchCampaigns(); }, [user]);

  const handleSave = async () => {
    if (!user) return;
    const { error } = await supabase.from("campaigns").insert({ ...form, user_id: user.id, status: "draft" } as TablesInsert<"campaigns">);
    if (error) { toast({ title: "שגיאה", description: error.message, variant: "destructive" }); return; }
    toast({ title: "קמפיין נוצר בהצלחה" }); setDialogOpen(false); fetchCampaigns();
  };

  const updateStatus = async (id: string, status: string) => { await supabase.from("campaigns").update({ status }).eq("id", id); fetchCampaigns(); };

  return (
    <div className="space-y-6 animate-fade-in" data-tour="campaigns">
      <div className="flex items-center justify-between flex-wrap gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold">קמפיינים</h1>
          <p className="text-muted-foreground text-sm">ניהול קמפיינים ממוקדים</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2 btn-hover shadow-sm"><Plus className="w-4 h-4" /> קמפיין חדש</Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="col-span-full text-center py-8 text-muted-foreground">טוען...</p>
        ) : campaigns.length === 0 ? (
          <Card className="col-span-full animate-fade-in-up">
            <CardContent className="text-center py-12">
              <Megaphone className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-muted-foreground font-medium">אין קמפיינים</p>
            </CardContent>
          </Card>
        ) : (
          campaigns.map((c, i) => (
            <Card key={c.id} className={`card-hover animate-fade-in-up stagger-${Math.min(i + 1, 6)} group`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{c.campaign_name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-3 flex-wrap">
                  <Badge variant="outline">{c.campaign_type === "professional" ? "💼 מקצועי" : "📢 שיווקי"}</Badge>
                  <Badge variant={c.status === "sent_simulated" ? "secondary" : "default"}>{statusLabels[c.status] || c.status}</Badge>
                </div>
                {c.subject_template && <p className="text-sm font-medium mb-1">{c.subject_template}</p>}
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{c.body_template}</p>
                <div className="flex gap-2">
                  {c.status === "draft" && (
                    <Button size="sm" variant="outline" className="gap-1 btn-hover" onClick={() => updateStatus(c.id, "ready")}>
                      <FileCheck className="w-3 h-3" /> סמן כמוכן
                    </Button>
                  )}
                  {c.status === "ready" && (
                    <Button size="sm" variant="outline" className="gap-1 btn-hover" onClick={() => updateStatus(c.id, "sent_simulated")}>
                      <Send className="w-3 h-3" /> סמן כנשלח
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg animate-scale-in">
          <DialogHeader><DialogTitle>קמפיין חדש</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>שם קמפיין *</Label><Input value={form.campaign_name || ""} onChange={(e) => setForm(p => ({ ...p, campaign_name: e.target.value }))} /></div>
            <div className="space-y-2">
              <Label>סוג</Label>
              <Select value={form.campaign_type || "professional"} onValueChange={(v) => setForm(p => ({ ...p, campaign_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="professional">מקצועי</SelectItem><SelectItem value="marketing">שיווקי</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>נושא</Label><Input value={form.subject_template || ""} onChange={(e) => setForm(p => ({ ...p, subject_template: e.target.value }))} /></div>
            <div className="space-y-2"><Label>תוכן *</Label><Textarea rows={4} value={form.body_template || ""} onChange={(e) => setForm(p => ({ ...p, body_template: e.target.value }))} placeholder="שלום {first_name}, ..." /></div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>ביטול</Button>
              <Button onClick={handleSave} className="btn-hover">צור קמפיין</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Campaigns;

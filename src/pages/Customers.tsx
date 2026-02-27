import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Edit, Trash2, Eye, Users } from "lucide-react";
import type { Tables as DBTables, TablesInsert } from "@/integrations/supabase/types";

type Customer = DBTables<"customers">;

const emptyCustomer: Partial<TablesInsert<"customers">> = {
  first_name: "", last_name: "", role: "", organization: "", email: "", phone: "", birth_date: "", religion_affiliation: "", notes: "", is_active: true,
};

const Customers = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Partial<TablesInsert<"customers">>>(emptyCustomer);
  const [isEditing, setIsEditing] = useState(false);
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterOrg, setFilterOrg] = useState<string>("all");
  const [filterReligion, setFilterReligion] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchCustomers = async () => {
    if (!user) return;
    const { data, error } = await supabase.from("customers").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (!error) setCustomers(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchCustomers(); }, [user]);

  const handleSave = async () => {
    if (!user) return;

    const email = (editingCustomer.email || "").trim();
    const phone = (editingCustomer.phone || "").trim();
    const birthDate = editingCustomer.birth_date || "";

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: "מייל לא תקין", description: "אנא הזן כתובת מייל תקינה", variant: "destructive" });
      return;
    }

    if (phone) {
      const digits = phone.replace(/\D/g, "");
      if (digits.length < 7 || digits.length > 15) {
        toast({ title: "טלפון לא תקין", description: "אנא הזן מספר טלפון תקין", variant: "destructive" });
        return;
      }
    }

    if (birthDate) {
      const dt = new Date(birthDate);
      if (isNaN(dt.getTime())) {
        toast({ title: "תאריך לא תקין", description: "אנא הזן תאריך לידה תקין", variant: "destructive" });
        return;
      }
    }

    const duplicate = customers.find(c => c.id !== editingCustomer.id && ((email && c.email && c.email === email) || (phone && c.phone && c.phone === phone)));
    if (duplicate) {
      toast({ title: "כפילות נתונים", description: "כבר קיים לקוח עם אותו מייל או טלפון", variant: "destructive" });
      return;
    }

    const payload = { ...editingCustomer, user_id: user.id, birth_date: editingCustomer.birth_date || null } as TablesInsert<"customers">;
    if (isEditing && editingCustomer.id) {
      const { error } = await supabase.from("customers").update(payload).eq("id", editingCustomer.id);
      if (error) { toast({ title: "שגיאה", description: error.message, variant: "destructive" }); return; }
      toast({ title: "לקוח עודכן בהצלחה" });
    } else {
      const { error } = await supabase.from("customers").insert(payload);
      if (error) { toast({ title: "שגיאה", description: error.message, variant: "destructive" }); return; }
      toast({ title: "לקוח נוסף בהצלחה" });
    }
    setDialogOpen(false); setEditingCustomer(emptyCustomer); setIsEditing(false); fetchCustomers();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("customers").update({ is_active: false }).eq("id", id);
    if (error) { toast({ title: "שגיאה", description: error.message, variant: "destructive" }); return; }
    toast({ title: "לקוח סומן כלא פעיל" }); fetchCustomers();
  };

  const openEdit = (customer: Customer) => { setEditingCustomer(customer); setIsEditing(true); setDialogOpen(true); };
  const openNew = () => { setEditingCustomer(emptyCustomer); setIsEditing(false); setDialogOpen(true); };

  useEffect(() => { setPage(1); }, [search, filterRole, filterOrg, filterReligion, filterStatus]);

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    const matchesSearch = c.first_name.toLowerCase().includes(q) || c.last_name.toLowerCase().includes(q) || (c.organization || "").toLowerCase().includes(q) || (c.email || "").toLowerCase().includes(q);
    const matchesRole = filterRole === "all" || (c.role || "") === filterRole;
    const matchesOrg = filterOrg === "all" || (c.organization || "") === filterOrg;
    const matchesReligion = filterReligion === "all" || (c.religion_affiliation || "") === filterReligion;
    const matchesStatus = filterStatus === "all" || (filterStatus === "active" ? c.is_active : !c.is_active);
    return matchesSearch && matchesRole && matchesOrg && matchesReligion && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  const roleOptions = Array.from(new Set(customers.map(c => c.role).filter(Boolean))) as string[];
  const orgOptions = Array.from(new Set(customers.map(c => c.organization).filter(Boolean))) as string[];
  const religionOptions = Array.from(new Set(customers.map(c => c.religion_affiliation).filter(Boolean))) as string[];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold">לקוחות</h1>
          <p className="text-muted-foreground text-sm">{customers.length} לקוחות במערכת</p>
        </div>
        <Button onClick={openNew} className="gap-2 btn-hover shadow-sm">
          <Plus className="w-4 h-4" /> הוסף לקוח
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-4 items-end animate-fade-in-up stagger-1">
        <div className="relative">
          <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="חיפוש לפי שם, ארגון, מייל..." value={search} onChange={(e) => setSearch(e.target.value)} className="pr-10 transition-shadow duration-200 focus:shadow-md focus:shadow-primary/10" />
        </div>
        <Select value={filterRole} onValueChange={(v) => { setFilterRole(v); setPage(1); }}>
          <SelectTrigger><SelectValue placeholder="סינון לפי תפקיד" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל התפקידים</SelectItem>
            {roleOptions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterOrg} onValueChange={(v) => { setFilterOrg(v); setPage(1); }}>
          <SelectTrigger><SelectValue placeholder="סינון לפי ארגון" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל הארגונים</SelectItem>
            {orgOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterReligion} onValueChange={(v) => { setFilterReligion(v); setPage(1); }}>
          <SelectTrigger><SelectValue placeholder="סינון לפי שיוך דתי" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל השיוכים</SelectItem>
            {religionOptions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setPage(1); }}>
          <SelectTrigger><SelectValue placeholder="סינון לפי סטטוס" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל הסטטוסים</SelectItem>
            <SelectItem value="active">פעיל</SelectItem>
            <SelectItem value="inactive">לא פעיל</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => { setFilterRole("all"); setFilterOrg("all"); setFilterReligion("all"); setFilterStatus("all"); setSearch(""); setPage(1); }}>נקה פילטרים</Button>
        </div>
      </div>

      <Card className="animate-fade-in-up stagger-2 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>שם</TableHead>
                <TableHead>תפקיד</TableHead>
                <TableHead>ארגון</TableHead>
                <TableHead>אימייל</TableHead>
                <TableHead>טלפון</TableHead>
                <TableHead>תאריך לידה</TableHead>
                <TableHead>שיוך דתי</TableHead>
                <TableHead>סטטוס</TableHead>
                <TableHead>פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">טוען...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="text-center py-12">
                  <Users className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-muted-foreground font-medium">אין לקוחות</p>
                  <p className="text-sm text-muted-foreground">הוסף לקוח חדש כדי להתחיל</p>
                </TableCell></TableRow>
              ) : (
                pageData.map((c) => (
                  <TableRow key={c.id} className="cursor-pointer transition-colors duration-150 hover:bg-primary/5" onClick={() => navigate(`/customers/${c.id}`)}>
                    <TableCell className="font-medium">{c.first_name} {c.last_name}</TableCell>
                    <TableCell>{c.role || "—"}</TableCell>
                    <TableCell>{c.organization || "—"}</TableCell>
                    <TableCell dir="ltr" className="text-left">{c.email || "—"}</TableCell>
                    <TableCell dir="ltr" className="text-left">{c.phone || "—"}</TableCell>
                    <TableCell dir="ltr" className="text-left">{c.birth_date ? new Date(c.birth_date).toLocaleDateString("he-IL") : "—"}</TableCell>
                    <TableCell>{c.religion_affiliation || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={c.is_active ? "default" : "secondary"} className="transition-colors">
                        {c.is_active ? "פעיל" : "לא פעיל"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button size="icon" variant="ghost" onClick={() => navigate(`/customers/${c.id}`)} className="hover:bg-primary/10 transition-colors"><Eye className="w-4 h-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => openEdit(c)} className="hover:bg-primary/10 transition-colors"><Edit className="w-4 h-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(c.id)} className="hover:bg-destructive/10 transition-colors"><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between p-3 border-t bg-muted/20">
            <div className="text-xs text-muted-foreground">
              מציג {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} מתוך {filtered.length}
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>הקודם</Button>
              <span className="text-xs text-muted-foreground">עמוד {page} מתוך {totalPages}</span>
              <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>הבא</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg animate-scale-in">
          <DialogHeader><DialogTitle>{isEditing ? "עריכת לקוח" : "הוספת לקוח חדש"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>שם פרטי *</Label><Input value={editingCustomer.first_name || ""} onChange={(e) => setEditingCustomer(p => ({ ...p, first_name: e.target.value }))} /></div>
            <div className="space-y-2"><Label>שם משפחה *</Label><Input value={editingCustomer.last_name || ""} onChange={(e) => setEditingCustomer(p => ({ ...p, last_name: e.target.value }))} /></div>
            <div className="space-y-2"><Label>תפקיד</Label><Input value={editingCustomer.role || ""} onChange={(e) => setEditingCustomer(p => ({ ...p, role: e.target.value }))} /></div>
            <div className="space-y-2"><Label>ארגון</Label><Input value={editingCustomer.organization || ""} onChange={(e) => setEditingCustomer(p => ({ ...p, organization: e.target.value }))} /></div>
            <div className="space-y-2"><Label>אימייל</Label><Input type="email" dir="ltr" value={editingCustomer.email || ""} onChange={(e) => setEditingCustomer(p => ({ ...p, email: e.target.value }))} /></div>
            <div className="space-y-2"><Label>טלפון</Label><Input dir="ltr" value={editingCustomer.phone || ""} onChange={(e) => setEditingCustomer(p => ({ ...p, phone: e.target.value }))} /></div>
            <div className="space-y-2"><Label>תאריך לידה</Label><Input type="date" dir="ltr" value={editingCustomer.birth_date || ""} onChange={(e) => setEditingCustomer(p => ({ ...p, birth_date: e.target.value }))} /></div>
            <div className="space-y-2">
              <Label>שיוך דתי</Label>
              <Select value={editingCustomer.religion_affiliation || ""} onValueChange={(v) => setEditingCustomer(p => ({ ...p, religion_affiliation: v }))}>
                <SelectTrigger><SelectValue placeholder="בחר" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="יהודי">יהודי</SelectItem>
                  <SelectItem value="מוסלמי">מוסלמי</SelectItem>
                  <SelectItem value="נוצרי">נוצרי</SelectItem>
                  <SelectItem value="דרוזי">דרוזי</SelectItem>
                  <SelectItem value="אחר">אחר</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>סטטוס</Label>
              <Select value={editingCustomer.is_active ? "active" : "inactive"} onValueChange={(v) => setEditingCustomer(p => ({ ...p, is_active: v === "active" }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">פעיל</SelectItem>
                  <SelectItem value="inactive">לא פעיל</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-2"><Label>הערות</Label><Textarea value={editingCustomer.notes || ""} onChange={(e) => setEditingCustomer(p => ({ ...p, notes: e.target.value }))} /></div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>ביטול</Button>
            <Button onClick={handleSave} className="btn-hover">{isEditing ? "עדכן" : "הוסף"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Customers;

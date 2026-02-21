import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Edit, Trash2, Eye, Users } from "lucide-react";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

type Customer = Tables<"customers">;

const emptyCustomer: Partial<TablesInsert<"customers">> = {
  first_name: "",
  last_name: "",
  role: "",
  organization: "",
  email: "",
  phone: "",
  birth_date: "",
  religion_affiliation: "",
  notes: "",
  is_active: true,
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

  const fetchCustomers = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (!error) setCustomers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    const payload = {
      ...editingCustomer,
      user_id: user.id,
      birth_date: editingCustomer.birth_date || null,
    } as TablesInsert<"customers">;

    if (isEditing && editingCustomer.id) {
      const { error } = await supabase
        .from("customers")
        .update(payload)
        .eq("id", editingCustomer.id);
      if (error) {
        toast({ title: "שגיאה", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "לקוח עודכן בהצלחה" });
    } else {
      const { error } = await supabase.from("customers").insert(payload);
      if (error) {
        toast({ title: "שגיאה", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "לקוח נוסף בהצלחה" });
    }
    setDialogOpen(false);
    setEditingCustomer(emptyCustomer);
    setIsEditing(false);
    fetchCustomers();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("customers").delete().eq("id", id);
    if (error) {
      toast({ title: "שגיאה", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "לקוח נמחק" });
    fetchCustomers();
  };

  const openEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsEditing(true);
    setDialogOpen(true);
  };

  const openNew = () => {
    setEditingCustomer(emptyCustomer);
    setIsEditing(false);
    setDialogOpen(true);
  };

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.first_name.toLowerCase().includes(q) ||
      c.last_name.toLowerCase().includes(q) ||
      (c.organization || "").toLowerCase().includes(q) ||
      (c.email || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">לקוחות</h1>
          <p className="text-muted-foreground text-sm">{customers.length} לקוחות במערכת</p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="w-4 h-4" /> הוסף לקוח
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="חיפוש לפי שם, ארגון, מייל..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pr-10"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>שם</TableHead>
                <TableHead>תפקיד</TableHead>
                <TableHead>ארגון</TableHead>
                <TableHead>אימייל</TableHead>
                <TableHead>טלפון</TableHead>
                <TableHead>סטטוס</TableHead>
                <TableHead>פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    טוען...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <Users className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
                    <p className="text-muted-foreground font-medium">אין לקוחות</p>
                    <p className="text-sm text-muted-foreground">הוסף לקוח חדש כדי להתחיל</p>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((c) => (
                  <TableRow key={c.id} className="cursor-pointer" onClick={() => navigate(`/customers/${c.id}`)}>
                    <TableCell className="font-medium">{c.first_name} {c.last_name}</TableCell>
                    <TableCell>{c.role || "—"}</TableCell>
                    <TableCell>{c.organization || "—"}</TableCell>
                    <TableCell dir="ltr" className="text-left">{c.email || "—"}</TableCell>
                    <TableCell dir="ltr" className="text-left">{c.phone || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={c.is_active ? "default" : "secondary"}>
                        {c.is_active ? "פעיל" : "לא פעיל"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button size="icon" variant="ghost" onClick={() => navigate(`/customers/${c.id}`)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => openEdit(c)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(c.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{isEditing ? "עריכת לקוח" : "הוספת לקוח חדש"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>שם פרטי *</Label>
              <Input value={editingCustomer.first_name || ""} onChange={(e) => setEditingCustomer(p => ({ ...p, first_name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>שם משפחה *</Label>
              <Input value={editingCustomer.last_name || ""} onChange={(e) => setEditingCustomer(p => ({ ...p, last_name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>תפקיד</Label>
              <Input value={editingCustomer.role || ""} onChange={(e) => setEditingCustomer(p => ({ ...p, role: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>ארגון</Label>
              <Input value={editingCustomer.organization || ""} onChange={(e) => setEditingCustomer(p => ({ ...p, organization: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>אימייל</Label>
              <Input type="email" dir="ltr" value={editingCustomer.email || ""} onChange={(e) => setEditingCustomer(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>טלפון</Label>
              <Input dir="ltr" value={editingCustomer.phone || ""} onChange={(e) => setEditingCustomer(p => ({ ...p, phone: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>תאריך לידה</Label>
              <Input type="date" dir="ltr" value={editingCustomer.birth_date || ""} onChange={(e) => setEditingCustomer(p => ({ ...p, birth_date: e.target.value }))} />
            </div>
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
            <div className="col-span-2 space-y-2">
              <Label>הערות</Label>
              <Textarea value={editingCustomer.notes || ""} onChange={(e) => setEditingCustomer(p => ({ ...p, notes: e.target.value }))} />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>ביטול</Button>
            <Button onClick={handleSave}>{isEditing ? "עדכן" : "הוסף"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Customers;

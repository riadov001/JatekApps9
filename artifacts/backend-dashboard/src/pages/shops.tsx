import { useState } from "react";
import {
  useListBackendShops,
  useListBackendStaff,
  useBackendMe,
  getListBackendShopsQueryKey,
} from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Star, Store, MapPin, Phone, Plus, Pencil, Trash2, Loader2, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

const DAY_LABELS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

type HourRow = { dayOfWeek: number; openTime: string; closeTime: string; isClosed: boolean };
const defaultHours = (): HourRow[] => Array.from({ length: 7 }, (_, i) => ({ dayOfWeek: i, openTime: "09:00", closeTime: "22:00", isClosed: i === 0 }));

const EMPTY = {
  name: "", description: "", address: "", phone: "", category: "restaurant",
  imageUrl: "", logoUrl: "", deliveryTime: "", deliveryFee: "", minimumOrder: "", isOpen: true,
  ownerId: "",
};

export default function Shops() {
  const [search, setSearch] = useState("");
  const { data: me } = useBackendMe();
  const { data: shops, isLoading } = useListBackendShops({ search: search || undefined });
  const { data: staff } = useListBackendStaff();
  const qc = useQueryClient();
  const { toast } = useToast();
  const isAdmin = me?.user.role === "admin" || me?.user.role === "super_admin";
  const isOwner = me?.user.role === "restaurant_owner";
  const ownerCandidates = (staff || []).filter((u: any) => u.role === "restaurant_owner" || u.role === "admin" || u.role === "super_admin");

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState<any | null>(null);
  const [editForm, setEditForm] = useState(EMPTY);
  const [hoursShopId, setHoursShopId] = useState<number | null>(null);
  const [hoursForm, setHoursForm] = useState<HourRow[]>(defaultHours());
  const [hoursSaving, setHoursSaving] = useState(false);

  const { data: existingHours } = useQuery<HourRow[]>({
    queryKey: ["shop-hours", hoursShopId],
    queryFn: () => apiFetch(`/api/backend/shops/${hoursShopId}/hours`),
    enabled: !!hoursShopId,
  });

  const openHours = (shopId: number) => {
    setHoursShopId(shopId);
    setHoursForm(existingHours?.length ? existingHours : defaultHours());
  };

  const handleSaveHours = async () => {
    if (!hoursShopId) return;
    setHoursSaving(true);
    try {
      await apiFetch(`/api/backend/shops/${hoursShopId}/hours`, { method: "PUT", body: JSON.stringify({ hours: hoursForm }) });
      toast({ title: "Horaires enregistrés ✓" });
      setHoursShopId(null);
    } catch (e: any) { toast({ title: "Erreur", description: e?.message, variant: "destructive" }); }
    finally { setHoursSaving(false); }
  };

  const invalidate = () => qc.invalidateQueries({ queryKey: getListBackendShopsQueryKey() });

  const buildBody = (f: typeof EMPTY) => ({
    name: f.name, description: f.description || undefined, address: f.address,
    phone: f.phone || undefined, category: f.category,
    imageUrl: f.imageUrl || undefined, logoUrl: f.logoUrl || undefined,
    deliveryTime: f.deliveryTime ? Number(f.deliveryTime) : undefined,
    deliveryFee: f.deliveryFee ? Number(f.deliveryFee) : undefined,
    minimumOrder: f.minimumOrder ? Number(f.minimumOrder) : undefined,
    ownerId: f.ownerId ? Number(f.ownerId) : undefined,
  });

  const createMutation = useMutation({
    mutationFn: (payload: any) => apiFetch("/api/backend/shops", { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: () => { invalidate(); setCreateOpen(false); setForm(EMPTY); toast({ title: "Boutique créée" }); },
    onError: (e: any) => toast({ title: "Erreur", description: e?.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apiFetch(`/api/backend/shops/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => { invalidate(); setEditing(null); toast({ title: "Boutique modifiée" }); },
    onError: (e: any) => toast({ title: "Erreur", description: e?.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/backend/shops/${id}`, { method: "DELETE" }),
    onSuccess: () => { invalidate(); toast({ title: "Supprimée" }); },
    onError: (e: any) => toast({ title: "Erreur", description: e?.message, variant: "destructive" }),
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(buildBody(form));
  };

  const openEdit = (s: any) => {
    setEditing(s);
    setEditForm({
      name: s.name ?? "", description: s.description ?? "", address: s.address ?? "",
      phone: s.phone ?? "", category: s.category ?? "restaurant",
      imageUrl: s.imageUrl ?? "", logoUrl: s.logoUrl ?? "",
      deliveryTime: String(s.deliveryTime ?? ""), deliveryFee: String(s.deliveryFee ?? ""),
      minimumOrder: String(s.minimumOrder ?? ""), isOpen: !!s.isOpen,
      ownerId: s.ownerId ? String(s.ownerId) : "",
    });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    updateMutation.mutate({ id: editing.id, data: { ...buildBody(editForm), isOpen: editForm.isOpen } });
  };

  const handleDelete = (id: number) => {
    if (!confirm("Supprimer cette boutique ?")) return;
    deleteMutation.mutate(id);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Boutiques</h1>
        {isAdmin && (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> Nouvelle boutique</Button></DialogTrigger>
            <DialogContent className="sm:max-w-2xl sm:max-h-[85vh] sm:overflow-y-auto">
              <DialogHeader><DialogTitle>Créer une boutique</DialogTitle></DialogHeader>
              <ShopForm form={form} setForm={setForm} onSubmit={handleCreate} pending={createMutation.isPending} submitLabel="Créer" ownerCandidates={ownerCandidates} isAdmin={isAdmin} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher..." className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Boutique</TableHead>
                <TableHead className="hidden sm:table-cell">Catégorie</TableHead>
                <TableHead className="hidden md:table-cell">Contact</TableHead>
                <TableHead className="hidden md:table-cell">Note</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                  <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-8 w-32" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                </TableRow>
              )) : shops?.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">Aucune boutique.</TableCell></TableRow>
              ) : shops?.map((shop) => (
                <TableRow key={shop.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center overflow-hidden border">
                        {shop.logoUrl ? <img src={shop.logoUrl} alt={shop.name} className="h-full w-full object-cover" /> : <Store className="h-5 w-5 text-muted-foreground" />}
                      </div>
                      <div>
                        <div className="font-bold">{shop.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center mt-0.5"><MapPin className="h-3 w-3 mr-1" /><span className="truncate max-w-[200px]">{shop.address}</span></div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell"><Badge variant="outline">{shop.category}</Badge></TableCell>
                  <TableCell className="hidden md:table-cell"><div className="text-sm text-muted-foreground flex items-center"><Phone className="h-3 w-3 mr-1" />{shop.phone || "N/A"}</div></TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="font-medium">{shop.rating || "Nouveau"}</span>
                      <span className="text-xs text-muted-foreground">({shop.reviewCount})</span>
                    </div>
                  </TableCell>
                  <TableCell><Badge className={shop.isOpen ? "bg-green-500 hover:bg-green-600" : "bg-destructive"}>{shop.isOpen ? "Ouvert" : "Fermé"}</Badge></TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" className="h-10 w-10" title="Horaires" onClick={() => openHours(shop.id)}><Clock className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => openEdit(shop)}><Pencil className="h-4 w-4" /></Button>
                    {isAdmin && <Button variant="ghost" size="icon" className="h-10 w-10 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(shop.id)}><Trash2 className="h-4 w-4" /></Button>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Hours Dialog */}
      <Dialog open={!!hoursShopId} onOpenChange={(o) => !o && setHoursShopId(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Horaires d'ouverture</DialogTitle></DialogHeader>
          <div className="space-y-2 pt-2 max-h-[60vh] overflow-y-auto pr-1">
            {hoursForm.map((row, idx) => (
              <div key={row.dayOfWeek} className={`flex items-center gap-2 p-2 rounded-lg border ${row.isClosed ? "bg-muted/40 opacity-60" : ""}`}>
                <span className="w-24 text-sm font-medium shrink-0">{DAY_LABELS[row.dayOfWeek]}</span>
                <label className="flex items-center gap-1 text-xs shrink-0">
                  <Switch checked={!row.isClosed} onCheckedChange={(v) => setHoursForm(h => h.map((r, i) => i === idx ? { ...r, isClosed: !v } : r))} />
                  {row.isClosed ? "Fermé" : "Ouvert"}
                </label>
                {!row.isClosed && (
                  <>
                    <Input type="time" className="flex-1 h-8 text-sm" value={row.openTime} onChange={(e) => setHoursForm(h => h.map((r, i) => i === idx ? { ...r, openTime: e.target.value } : r))} />
                    <span className="text-xs text-muted-foreground">→</span>
                    <Input type="time" className="flex-1 h-8 text-sm" value={row.closeTime} onChange={(e) => setHoursForm(h => h.map((r, i) => i === idx ? { ...r, closeTime: e.target.value } : r))} />
                  </>
                )}
              </div>
            ))}
          </div>
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setHoursShopId(null)}>Annuler</Button>
            <Button onClick={handleSaveHours} disabled={hoursSaving}>{hoursSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="sm:max-w-2xl sm:max-h-[85vh] sm:overflow-y-auto">
          <DialogHeader><DialogTitle>Modifier {editing?.name}</DialogTitle></DialogHeader>
          {editing && (
            <ShopForm
              form={editForm} setForm={setEditForm} onSubmit={handleUpdate} pending={updateMutation.isPending} submitLabel="Enregistrer"
              ownerCandidates={ownerCandidates} isAdmin={isAdmin}
              extra={
                <div className="flex items-center gap-2">
                  <Switch checked={editForm.isOpen} onCheckedChange={(v) => setEditForm({ ...editForm, isOpen: v })} />
                  <Label>Ouvert</Label>
                </div>
              }
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ShopForm({ form, setForm, onSubmit, pending, submitLabel, extra, ownerCandidates, isAdmin }: any) {
  const set = (k: string, v: any) => setForm({ ...form, [k]: v });
  return (
    <form onSubmit={onSubmit} className="space-y-4 pt-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Nom"><Input required value={form.name} onChange={(e: any) => set("name", e.target.value)} /></Field>
        <Field label="Catégorie"><Input value={form.category} onChange={(e: any) => set("category", e.target.value)} /></Field>
        <Field label="Adresse" full><Input required value={form.address} onChange={(e: any) => set("address", e.target.value)} /></Field>
        <Field label="Téléphone"><Input value={form.phone} onChange={(e: any) => set("phone", e.target.value)} /></Field>
        <Field label="Logo (URL)"><Input value={form.logoUrl} onChange={(e: any) => set("logoUrl", e.target.value)} /></Field>
        <Field label="Image (URL)" full><Input value={form.imageUrl} onChange={(e: any) => set("imageUrl", e.target.value)} /></Field>
        <Field label="Description" full><Textarea rows={2} value={form.description} onChange={(e: any) => set("description", e.target.value)} /></Field>
        <Field label="Délai livraison (min)"><Input type="number" value={form.deliveryTime} onChange={(e: any) => set("deliveryTime", e.target.value)} /></Field>
        <Field label="Frais livraison (DH)"><Input type="number" value={form.deliveryFee} onChange={(e: any) => set("deliveryFee", e.target.value)} /></Field>
        <Field label="Minimum commande (DH)"><Input type="number" value={form.minimumOrder} onChange={(e: any) => set("minimumOrder", e.target.value)} /></Field>
        {isAdmin && (
          <Field label="Propriétaire" full>
            <Select value={form.ownerId || "none"} onValueChange={(v) => set("ownerId", v === "none" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder="Choisir un propriétaire" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— Aucun —</SelectItem>
                {ownerCandidates.map((u: any) => <SelectItem key={u.id} value={String(u.id)}>{u.name} ({u.email})</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
        )}
      </div>
      {extra}
      <DialogFooter className="pt-4">
        <Button type="submit" disabled={pending}>{pending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}{submitLabel}</Button>
      </DialogFooter>
    </form>
  );
}

function Field({ label, children, full }: any) {
  return <div className={`space-y-1 ${full ? "col-span-full" : ""}`}><Label className="text-xs">{label}</Label>{children}</div>;
}

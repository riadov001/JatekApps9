import { useState } from "react";
import {
  useListBackendProducts,
  useListBackendShops,
  useBackendMe,
  getListBackendProductsQueryKey,
  useListBackendCategories,
  getListBackendCategoriesQueryKey,
} from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, Pencil, Trash2, Loader2, Settings2, Tags, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

const EMPTY = { name: "", description: "", price: "", category: "", imageUrl: "", isAvailable: true, isPopular: false, allergens: "", tags: "", prepTimeMinutes: "", calories: "" };

type ProductCat = { id: number; restaurantId: number | null; name: string };
function useProductCategories(restaurantId: string | number | undefined) {
  return useQuery<ProductCat[]>({
    queryKey: ["/api/backend/menu-categories", String(restaurantId ?? "")],
    queryFn: () => apiFetch(`/api/backend/menu-categories${restaurantId ? `?restaurantId=${restaurantId}` : ""}`),
    enabled: restaurantId !== undefined,
  });
}

export default function Products() {
  const [search, setSearch] = useState("");
  const { data: me } = useBackendMe();
  const { data: products, isLoading } = useListBackendProducts({ search: search || undefined });
  const { data: shops } = useListBackendShops({});
  const qc = useQueryClient();
  const { toast } = useToast();
  const isOwner = me?.user.role === "restaurant_owner";
  const scopedShopIds = me?.scopedShopIds ?? [];
  const visibleShops = isOwner ? (shops || []).filter((s) => scopedShopIds.includes(s.id)) : (shops || []);

  const [createOpen, setCreateOpen] = useState(false);
  const [shopId, setShopId] = useState<string>(isOwner && scopedShopIds.length === 1 ? String(scopedShopIds[0]) : "");
  const [form, setForm] = useState(EMPTY);

  const [editing, setEditing] = useState<any | null>(null);
  const [editForm, setEditForm] = useState(EMPTY);
  const [optionsProduct, setOptionsProduct] = useState<any | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: getListBackendProductsQueryKey() });

  const createMutation = useMutation({
    mutationFn: (payload: any) => apiFetch("/api/backend/products", { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: () => { invalidate(); setCreateOpen(false); setForm(EMPTY); setShopId(""); toast({ title: "Produit créé" }); },
    onError: (e: any) => toast({ title: "Erreur", description: e?.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apiFetch(`/api/backend/products/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => { invalidate(); setEditing(null); toast({ title: "Modifié" }); },
    onError: (e: any) => toast({ title: "Erreur", description: e?.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/backend/products/${id}`, { method: "DELETE" }),
    onSuccess: () => { invalidate(); toast({ title: "Supprimé" }); },
    onError: (e: any) => toast({ title: "Erreur", description: e?.message, variant: "destructive" }),
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopId) { toast({ title: "Choisissez une boutique", variant: "destructive" }); return; }
    createMutation.mutate({
      restaurantId: Number(shopId),
      name: form.name, description: form.description || undefined,
      price: Number(form.price), category: form.category,
      imageUrl: form.imageUrl || undefined,
      isAvailable: form.isAvailable, isPopular: form.isPopular,
    });
  };

  const openEdit = (p: any) => {
    setEditing(p);
    setEditForm({
      name: p.name, description: p.description ?? "", price: String(p.price),
      category: p.category, imageUrl: p.imageUrl ?? "",
      isAvailable: p.isAvailable, isPopular: p.isPopular,
      allergens: p.allergens ?? "", tags: "", prepTimeMinutes: "", calories: "",
    });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    updateMutation.mutate({ id: editing.id, data: {
      name: editForm.name, description: editForm.description || undefined,
      price: Number(editForm.price), category: editForm.category,
      imageUrl: editForm.imageUrl || undefined,
      isAvailable: editForm.isAvailable, isPopular: editForm.isPopular,
    }});
  };

  const handleToggle = (p: any, isAvailable: boolean) => {
    updateMutation.mutate({ id: p.id, data: { isAvailable } });
  };

  const handleDelete = (id: number) => {
    if (!confirm("Supprimer ce produit ?")) return;
    deleteMutation.mutate(id);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Produits</h1>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> Nouveau produit</Button></DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader><DialogTitle>Créer un produit</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-3 pt-4">
              <Field label="Boutique">
                <Select value={shopId} onValueChange={setShopId} disabled={isOwner && scopedShopIds.length === 1}>
                  <SelectTrigger><SelectValue placeholder={isOwner ? "Votre boutique" : "Choisir une boutique"} /></SelectTrigger>
                  <SelectContent>{visibleShops.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <ProductFields form={form} setForm={setForm} restaurantId={shopId || undefined} />
              <DialogFooter className="pt-4"><Button type="submit" disabled={createMutation.isPending}>{createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Créer</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="produits">
        <TabsList>
          <TabsTrigger value="produits" className="gap-1.5"><Package className="h-4 w-4" />Produits</TabsTrigger>
          <TabsTrigger value="categories" className="gap-1.5"><Tags className="h-4 w-4" />Catégories menu</TabsTrigger>
        </TabsList>
        <TabsContent value="produits" className="pt-4">
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
                <TableHead>Nom</TableHead>
                <TableHead className="hidden sm:table-cell">Catégorie</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Disponible</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-12" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                </TableRow>
              )) : products?.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">Aucun produit.</TableCell></TableRow>
              ) : products?.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-3">
                      {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="h-10 w-10 rounded-md object-cover" /> : <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center"><span className="text-xs text-muted-foreground">—</span></div>}
                      <span>{p.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell"><Badge variant="secondary">{p.category}</Badge></TableCell>
                  <TableCell className="font-semibold">{p.price} DH</TableCell>
                  <TableCell><Switch checked={p.isAvailable} onCheckedChange={(v) => handleToggle(p, v)} /></TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" className="h-10 w-10" title="Options" onClick={() => setOptionsProduct(p)}><Settings2 className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-10 w-10 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

        </TabsContent>
        <TabsContent value="categories" className="pt-4">
          <ProductMenuCategories />
        </TabsContent>
      </Tabs>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Modifier {editing?.name}</DialogTitle></DialogHeader>
          {editing && (
            <form onSubmit={handleUpdate} className="space-y-3 pt-4">
              <ProductFields form={editForm} setForm={setEditForm} restaurantId={editing?.restaurantId} />
              <DialogFooter className="pt-4"><Button type="submit" disabled={updateMutation.isPending}>{updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Enregistrer</Button></DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <OptionsDialogWrapper product={optionsProduct} onClose={() => setOptionsProduct(null)} />
    </div>
  );
}

// ─── Product Menu Categories ────────────────────────────────────────────────

type MenuCat = { id: number; restaurantId: number | null; name: string; sortOrder: number; isActive: boolean };

function ProductMenuCategories() {
  const { data: me } = useBackendMe();
  const qc = useQueryClient();
  const { toast } = useToast();
  const isAdmin = !!me && ["super_admin", "admin", "manager"].includes(me.user.role);
  const { data: shops } = useListBackendShops({});

  const { data: productCats, isLoading: pcLoading } = useQuery<MenuCat[]>({
    queryKey: ["/api/backend/menu-categories"],
    queryFn: () => apiFetch("/api/backend/menu-categories"),
  });

  const [newCat, setNewCat] = useState({ name: "", restaurantId: "", sortOrder: "0" });
  const [creating, setCreating] = useState(false);
  const [renaming, setRenaming] = useState<{ id: number; name: string } | null>(null);
  const [newName, setNewName] = useState("");
  const [deleting, setDeleting] = useState<MenuCat | null>(null);

  const invalidatePC = () => qc.invalidateQueries({ queryKey: ["/api/backend/menu-categories"] });

  const createMutation = useMutation({
    mutationFn: () => apiFetch("/api/backend/menu-categories", {
      method: "POST",
      body: JSON.stringify({ name: newCat.name.trim(), restaurantId: newCat.restaurantId ? Number(newCat.restaurantId) : null, sortOrder: Number(newCat.sortOrder) || 0 }),
    }),
    onSuccess: () => { invalidatePC(); setCreating(false); setNewCat({ name: "", restaurantId: "", sortOrder: "0" }); toast({ title: "Catégorie créée" }); },
    onError: (e: any) => toast({ title: "Erreur", description: e?.message, variant: "destructive" }),
  });

  const renameMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      apiFetch(`/api/backend/menu-categories/${id}`, { method: "PATCH", body: JSON.stringify({ name }) }),
    onSuccess: () => { invalidatePC(); setRenaming(null); toast({ title: "Renommée" }); },
    onError: (e: any) => toast({ title: "Erreur", description: e?.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/backend/menu-categories/${id}`, { method: "DELETE" }),
    onSuccess: () => { invalidatePC(); setDeleting(null); toast({ title: "Supprimée" }); },
    onError: (e: any) => toast({ title: "Erreur", description: e?.message, variant: "destructive" }),
  });

  return (
    <Card className="max-w-3xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <h2 className="text-base font-semibold">Catégories de produits</h2>
        {isAdmin && <Button size="sm" onClick={() => setCreating(true)} className="gap-2"><Plus className="h-4 w-4" />Nouvelle</Button>}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead className="hidden sm:table-cell">Restaurant</TableHead>
              <TableHead className="hidden sm:table-cell">Ordre</TableHead>
              {isAdmin && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pcLoading ? Array.from({ length: 4 }).map((_, i) => (
              <TableRow key={i}><TableCell><Skeleton className="h-4 w-32" /></TableCell><TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-20" /></TableCell><TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-8" /></TableCell>{isAdmin && <TableCell />}</TableRow>
            )) : productCats?.length === 0 ? (
              <TableRow><TableCell colSpan={isAdmin ? 4 : 3} className="h-24 text-center text-muted-foreground">Aucune catégorie produit.</TableCell></TableRow>
            ) : productCats?.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell className="font-medium">{cat.name}</TableCell>
                <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                  {cat.restaurantId
                    ? (shops as any[] | undefined)?.find((s: any) => s.id === cat.restaurantId)?.name ?? `#${cat.restaurantId}`
                    : <Badge variant="secondary">Global</Badge>}
                </TableCell>
                <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">{cat.sortOrder}</TableCell>
                {isAdmin && (
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setRenaming({ id: cat.id, name: cat.name }); setNewName(cat.name); }}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleting(cat)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={creating} onOpenChange={(o) => !o && setCreating(false)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nouvelle catégorie produit</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); if (newCat.name.trim()) createMutation.mutate(); }} className="space-y-4 pt-2">
            <div className="space-y-1"><Label className="text-xs">Nom *</Label><Input value={newCat.name} onChange={(e) => setNewCat({ ...newCat, name: e.target.value })} required autoFocus /></div>
            <div className="space-y-1">
              <Label className="text-xs">Restaurant (vide = global)</Label>
              <Select value={newCat.restaurantId || "global"} onValueChange={(v) => setNewCat({ ...newCat, restaurantId: v === "global" ? "" : v })}>
                <SelectTrigger><SelectValue placeholder="Global" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">— Global —</SelectItem>
                  {(shops as any[] | undefined)?.map((s: any) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label className="text-xs">Ordre</Label><Input type="number" value={newCat.sortOrder} onChange={(e) => setNewCat({ ...newCat, sortOrder: e.target.value })} /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreating(false)}>Annuler</Button>
              <Button type="submit" disabled={createMutation.isPending || !newCat.name.trim()}>{createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Créer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!renaming} onOpenChange={(o) => !o && setRenaming(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Renommer «{renaming?.name}»</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); if (renaming && newName.trim()) renameMutation.mutate({ id: renaming.id, name: newName.trim() }); }} className="space-y-4 pt-2">
            <div className="space-y-1"><Label className="text-xs">Nouveau nom</Label><Input value={newName} onChange={(e) => setNewName(e.target.value)} required /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setRenaming(null)}>Annuler</Button>
              <Button type="submit" disabled={renameMutation.isPending || !newName.trim() || newName.trim() === renaming?.name}>{renameMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Renommer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer «{deleting?.name}» ?</AlertDialogTitle>
            <AlertDialogDescription>Action irréversible.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deleting && deleteMutation.mutate(deleting.id)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

function ProductFields({ form, setForm, restaurantId }: { form: any; setForm: any; restaurantId?: string | number }) {
  const set = (k: string, v: any) => setForm({ ...form, [k]: v });
  const { data: productCats } = useProductCategories(restaurantId);
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Nom"><Input required value={form.name} onChange={(e: any) => set("name", e.target.value)} /></Field>
        <Field label="Catégorie">
          {productCats && productCats.length > 0 ? (
            <Select value={form.category} onValueChange={(v) => set("category", v)} required>
              <SelectTrigger><SelectValue placeholder="Choisir une catégorie" /></SelectTrigger>
              <SelectContent>
                {productCats.map((c) => (
                  <SelectItem key={c.id} value={c.name}>
                    {c.name}{c.restaurantId !== null ? " ★" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input required value={form.category} onChange={(e: any) => set("category", e.target.value)} placeholder="Catégorie" />
          )}
        </Field>
        <Field label="Prix (DH)"><Input required type="number" step="0.01" value={form.price} onChange={(e: any) => set("price", e.target.value)} /></Field>
        <Field label="Image (URL)"><Input value={form.imageUrl} onChange={(e: any) => set("imageUrl", e.target.value)} /></Field>
      </div>
      <Field label="Description"><Textarea rows={2} value={form.description} onChange={(e: any) => set("description", e.target.value)} /></Field>
      <div className="flex items-center gap-6 pt-2">
        <label className="flex items-center gap-2 text-sm"><Switch checked={form.isAvailable} onCheckedChange={(v: any) => set("isAvailable", v)} /> Disponible</label>
        <label className="flex items-center gap-2 text-sm"><Switch checked={form.isPopular} onCheckedChange={(v: any) => set("isPopular", v)} /> Populaire</label>
      </div>
    </>
  );
}

function Field({ label, children }: any) {
  return <div className="space-y-1"><Label className="text-xs">{label}</Label>{children}</div>;
}

interface MenuItemSize { id: number; menuItemId: number; name: string; priceAdjustment: number; sortOrder: number; isAvailable: boolean; }
interface MenuItemExtra { id: number; menuItemId: number; name: string; price: number; sortOrder: number; isAvailable: boolean; }

function OptionsDialog({ product, onClose }: { product: any | null; onClose: () => void }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [tab, setTab] = useState("sizes");
  const [sizeForm, setSizeForm] = useState({ name: "", priceAdjustment: "0", sortOrder: "0", isAvailable: true });
  const [extraForm, setExtraForm] = useState({ name: "", price: "0", sortOrder: "0", isAvailable: true });
  const [editingSize, setEditingSize] = useState<MenuItemSize | null>(null);
  const [editingExtra, setEditingExtra] = useState<MenuItemExtra | null>(null);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: [`/api/menu/${product?.id}/sizes`] });
    qc.invalidateQueries({ queryKey: [`/api/menu/${product?.id}/extras`] });
  };

  const { data: sizes, isLoading: sizesLoading } = useQuery<MenuItemSize[]>({
    queryKey: [`/api/menu/${product?.id}/sizes`],
    queryFn: () => apiFetch(`/api/menu/${product.id}/sizes`),
    enabled: !!product,
  });
  const { data: extras, isLoading: extrasLoading } = useQuery<MenuItemExtra[]>({
    queryKey: [`/api/menu/${product?.id}/extras`],
    queryFn: () => apiFetch(`/api/menu/${product.id}/extras`),
    enabled: !!product,
  });

  const createSize = async () => {
    if (!product) return;
    try {
      await apiFetch(`/api/menu/${product.id}/sizes`, {
        method: "POST",
        body: JSON.stringify({
          name: sizeForm.name,
          priceAdjustment: Number(sizeForm.priceAdjustment),
          sortOrder: Number(sizeForm.sortOrder),
          isAvailable: sizeForm.isAvailable,
        }),
      });
      setSizeForm({ name: "", priceAdjustment: "0", sortOrder: "0", isAvailable: true });
      invalidate();
      toast({ title: "Taille créée" });
    } catch (e: any) { toast({ title: "Erreur", description: e?.message, variant: "destructive" }); }
  };

  const updateSize = async () => {
    if (!editingSize) return;
    try {
      await apiFetch(`/api/menu/sizes/${editingSize.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: editingSize.name,
          priceAdjustment: editingSize.priceAdjustment,
          sortOrder: editingSize.sortOrder,
          isAvailable: editingSize.isAvailable,
        }),
      });
      setEditingSize(null);
      invalidate();
      toast({ title: "Taille mise à jour" });
    } catch (e: any) { toast({ title: "Erreur", description: e?.message, variant: "destructive" }); }
  };

  const deleteSize = async (id: number) => {
    if (!confirm("Supprimer cette taille ?")) return;
    try {
      await apiFetch(`/api/menu/sizes/${id}`, { method: "DELETE" });
      invalidate();
      toast({ title: "Taille supprimée" });
    } catch (e: any) { toast({ title: "Erreur", description: e?.message, variant: "destructive" }); }
  };

  const createExtra = async () => {
    if (!product) return;
    try {
      await apiFetch(`/api/menu/${product.id}/extras`, {
        method: "POST",
        body: JSON.stringify({
          name: extraForm.name,
          price: Number(extraForm.price),
          sortOrder: Number(extraForm.sortOrder),
          isAvailable: extraForm.isAvailable,
        }),
      });
      setExtraForm({ name: "", price: "0", sortOrder: "0", isAvailable: true });
      invalidate();
      toast({ title: "Supplément créé" });
    } catch (e: any) { toast({ title: "Erreur", description: e?.message, variant: "destructive" }); }
  };

  const updateExtra = async () => {
    if (!editingExtra) return;
    try {
      await apiFetch(`/api/menu/extras/${editingExtra.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: editingExtra.name,
          price: editingExtra.price,
          sortOrder: editingExtra.sortOrder,
          isAvailable: editingExtra.isAvailable,
        }),
      });
      setEditingExtra(null);
      invalidate();
      toast({ title: "Supplément mis à jour" });
    } catch (e: any) { toast({ title: "Erreur", description: e?.message, variant: "destructive" }); }
  };

  const deleteExtra = async (id: number) => {
    if (!confirm("Supprimer ce supplément ?")) return;
    try {
      await apiFetch(`/api/menu/extras/${id}`, { method: "DELETE" });
      invalidate();
      toast({ title: "Supplément supprimé" });
    } catch (e: any) { toast({ title: "Erreur", description: e?.message, variant: "destructive" }); }
  };

  if (!product) return null;

  return (
    <Dialog open={!!product} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Options — {product.name}</DialogTitle>
          <DialogDescription>Gérez les tailles et suppléments affichés dans l'app mobile.</DialogDescription>
        </DialogHeader>
        <Tabs value={tab} onValueChange={setTab} className="pt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sizes">Tailles</TabsTrigger>
            <TabsTrigger value="extras">Suppléments</TabsTrigger>
          </TabsList>
          <TabsContent value="sizes" className="space-y-4 pt-2">
            <div className="grid grid-cols-12 gap-2 items-end border-b pb-3">
              <div className="col-span-4"><Field label="Nom"><Input value={sizeForm.name} onChange={(e) => setSizeForm({ ...sizeForm, name: e.target.value })} placeholder="Large" /></Field></div>
              <div className="col-span-3"><Field label="Ajustement prix"><Input type="number" value={sizeForm.priceAdjustment} onChange={(e) => setSizeForm({ ...sizeForm, priceAdjustment: e.target.value })} /></Field></div>
              <div className="col-span-2"><Field label="Ordre"><Input type="number" value={sizeForm.sortOrder} onChange={(e) => setSizeForm({ ...sizeForm, sortOrder: e.target.value })} /></Field></div>
              <div className="col-span-2"><label className="flex items-center gap-2 text-sm"><Switch checked={sizeForm.isAvailable} onCheckedChange={(v) => setSizeForm({ ...sizeForm, isAvailable: v })} /> Actif</label></div>
              <div className="col-span-1"><Button size="icon" onClick={createSize} disabled={!sizeForm.name}><Plus className="h-4 w-4" /></Button></div>
            </div>
            {sizesLoading ? <Skeleton className="h-20 w-full" /> : sizes?.length === 0 ? <p className="text-sm text-muted-foreground">Aucune taille.</p> : (
              <div className="space-y-2">
                {sizes?.map((s) => editingSize?.id === s.id ? (
                  <div key={s.id} className="grid grid-cols-12 gap-2 items-end bg-muted/40 p-2 rounded-md">
                    <div className="col-span-4"><Input value={editingSize.name} onChange={(e) => setEditingSize({ ...editingSize, name: e.target.value })} /></div>
                    <div className="col-span-3"><Input type="number" value={editingSize.priceAdjustment} onChange={(e) => setEditingSize({ ...editingSize, priceAdjustment: Number(e.target.value) })} /></div>
                    <div className="col-span-2"><Input type="number" value={editingSize.sortOrder} onChange={(e) => setEditingSize({ ...editingSize, sortOrder: Number(e.target.value) })} /></div>
                    <div className="col-span-2"><Switch checked={editingSize.isAvailable} onCheckedChange={(v) => setEditingSize({ ...editingSize, isAvailable: v })} /></div>
                    <div className="col-span-1 flex gap-1"><Button size="icon" variant="ghost" onClick={updateSize}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteSize(s.id)}><Trash2 className="h-4 w-4" /></Button></div>
                  </div>
                ) : (
                  <div key={s.id} className="flex items-center justify-between p-2 border rounded-md">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{s.name}</span>
                      <span className="text-sm text-muted-foreground">{s.priceAdjustment > 0 ? `+${s.priceAdjustment}` : s.priceAdjustment} MAD</span>
                      <Badge variant={s.isAvailable ? "default" : "secondary"}>{s.isAvailable ? "Actif" : "Inactif"}</Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => setEditingSize(s)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteSize(s.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="extras" className="space-y-4 pt-2">
            <div className="grid grid-cols-12 gap-2 items-end border-b pb-3">
              <div className="col-span-4"><Field label="Nom"><Input value={extraForm.name} onChange={(e) => setExtraForm({ ...extraForm, name: e.target.value })} placeholder="Fromage extra" /></Field></div>
              <div className="col-span-3"><Field label="Prix"><Input type="number" value={extraForm.price} onChange={(e) => setExtraForm({ ...extraForm, price: e.target.value })} /></Field></div>
              <div className="col-span-2"><Field label="Ordre"><Input type="number" value={extraForm.sortOrder} onChange={(e) => setExtraForm({ ...extraForm, sortOrder: e.target.value })} /></Field></div>
              <div className="col-span-2"><label className="flex items-center gap-2 text-sm"><Switch checked={extraForm.isAvailable} onCheckedChange={(v) => setExtraForm({ ...extraForm, isAvailable: v })} /> Actif</label></div>
              <div className="col-span-1"><Button size="icon" onClick={createExtra} disabled={!extraForm.name}><Plus className="h-4 w-4" /></Button></div>
            </div>
            {extrasLoading ? <Skeleton className="h-20 w-full" /> : extras?.length === 0 ? <p className="text-sm text-muted-foreground">Aucun supplément.</p> : (
              <div className="space-y-2">
                {extras?.map((x) => editingExtra?.id === x.id ? (
                  <div key={x.id} className="grid grid-cols-12 gap-2 items-end bg-muted/40 p-2 rounded-md">
                    <div className="col-span-4"><Input value={editingExtra.name} onChange={(e) => setEditingExtra({ ...editingExtra, name: e.target.value })} /></div>
                    <div className="col-span-3"><Input type="number" value={editingExtra.price} onChange={(e) => setEditingExtra({ ...editingExtra, price: Number(e.target.value) })} /></div>
                    <div className="col-span-2"><Input type="number" value={editingExtra.sortOrder} onChange={(e) => setEditingExtra({ ...editingExtra, sortOrder: Number(e.target.value) })} /></div>
                    <div className="col-span-2"><Switch checked={editingExtra.isAvailable} onCheckedChange={(v) => setEditingExtra({ ...editingExtra, isAvailable: v })} /></div>
                    <div className="col-span-1 flex gap-1"><Button size="icon" variant="ghost" onClick={updateExtra}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteExtra(x.id)}><Trash2 className="h-4 w-4" /></Button></div>
                  </div>
                ) : (
                  <div key={x.id} className="flex items-center justify-between p-2 border rounded-md">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{x.name}</span>
                      <span className="text-sm text-muted-foreground">{x.price > 0 ? `+${x.price}` : x.price === 0 ? "Inclus" : x.price} MAD</span>
                      <Badge variant={x.isAvailable ? "default" : "secondary"}>{x.isAvailable ? "Actif" : "Inactif"}</Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => setEditingExtra(x)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteExtra(x.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function OptionsDialogWrapper({ product, onClose }: { product: any | null; onClose: () => void }) {
  return product ? <OptionsDialog product={product} onClose={onClose} /> : null;
}

import { useState } from "react";
import {
  useListBackendCategories,
  getListBackendCategoriesQueryKey,
  useBackendMe,
} from "@workspace/api-client-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tags, Pencil, Trash2, Loader2, Plus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api";

// ─── Shop categories ───────────────────────────────────────────────────────────
type ShopCategory = { id: number; name: string; slug: string; icon: string; accentColor: string; isActive: boolean; count: number };

function ShopCategories() {
  const { data: categories, isLoading } = useListBackendCategories();
  const qc = useQueryClient();
  const { toast } = useToast();

  const [creating, setCreating] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("storefront");
  const [newCatColor, setNewCatColor] = useState("#E91E63");

  const [renaming, setRenaming] = useState<ShopCategory | null>(null);
  const [newName, setNewName] = useState("");
  const [deleting, setDeleting] = useState<ShopCategory | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: getListBackendCategoriesQueryKey() });

  const createMutation = useMutation({
    mutationFn: () =>
      apiFetch("/api/backend/categories", {
        method: "POST",
        body: JSON.stringify({ name: newCatName.trim(), icon: newCatIcon.trim(), accentColor: newCatColor }),
      }),
    onSuccess: () => {
      invalidate();
      setCreating(false);
      setNewCatName(""); setNewCatIcon("storefront"); setNewCatColor("#E91E63");
      toast({ title: "Catégorie créée" });
    },
    onError: (e: any) => toast({ title: "Erreur", description: e?.message, variant: "destructive" }),
  });

  const renameMutation = useMutation({
    mutationFn: (vars: { oldName: string; newName: string }) =>
      apiFetch(`/api/backend/categories/${encodeURIComponent(vars.oldName)}`, {
        method: "PATCH",
        body: JSON.stringify({ name: vars.newName }),
      }),
    onSuccess: () => { invalidate(); setRenaming(null); toast({ title: "Catégorie renommée" }); },
    onError: (e: any) => toast({ title: "Erreur", description: e?.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (name: string) =>
      apiFetch(`/api/backend/categories/${encodeURIComponent(name)}`, { method: "DELETE" }),
    onSuccess: () => { invalidate(); setDeleting(null); toast({ title: "Catégorie supprimée" }); },
    onError: (e: any) => toast({ title: "Erreur", description: e?.message, variant: "destructive" }),
  });

  return (
    <Card className="max-w-3xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center space-x-2">
          <Tags className="h-5 w-5 text-primary" />
          <span>Catégories de boutiques</span>
        </CardTitle>
        <Button size="sm" onClick={() => setCreating(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Nouvelle
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="text-right">Boutiques</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-4 w-8 ml-auto" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
              </TableRow>
            )) : (categories as ShopCategory[] | undefined)?.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="h-24 text-center text-muted-foreground">Aucune catégorie.</TableCell></TableRow>
            ) : (categories as ShopCategory[] | undefined)?.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell className="font-medium">{cat.name}</TableCell>
                <TableCell className="text-muted-foreground text-xs">{cat.slug}</TableCell>
                <TableCell className="text-right"><Badge variant="secondary">{cat.count} boutique{cat.count !== 1 ? "s" : ""}</Badge></TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => { setRenaming(cat); setNewName(cat.name); }}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleting(cat)} disabled={cat.count > 0} title={cat.count > 0 ? "Réaffectez les boutiques d'abord" : "Supprimer"}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={creating} onOpenChange={(o) => !o && setCreating(false)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nouvelle catégorie</DialogTitle><DialogDescription>Catégorie de boutiques visible dans l'application.</DialogDescription></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); if (newCatName.trim()) createMutation.mutate(); }} className="space-y-4 pt-2">
            <div className="space-y-1"><Label className="text-xs">Nom *</Label><Input value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="Ex: Sushi, Épicerie…" required autoFocus /></div>
            <div className="space-y-1"><Label className="text-xs">Icône (Material icon name)</Label><Input value={newCatIcon} onChange={(e) => setNewCatIcon(e.target.value)} placeholder="storefront" /></div>
            <div className="space-y-1">
              <Label className="text-xs">Couleur d'accent</Label>
              <div className="flex items-center gap-2">
                <input type="color" value={newCatColor} onChange={(e) => setNewCatColor(e.target.value)} className="h-9 w-12 rounded border cursor-pointer" />
                <Input value={newCatColor} onChange={(e) => setNewCatColor(e.target.value)} placeholder="#E91E63" className="flex-1" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreating(false)}>Annuler</Button>
              <Button type="submit" disabled={createMutation.isPending || !newCatName.trim()}>{createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Créer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!renaming} onOpenChange={(o) => !o && setRenaming(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Renommer la catégorie</DialogTitle><DialogDescription>Appliqué à toutes les boutiques de «{renaming?.name}».</DialogDescription></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); if (renaming && newName.trim()) renameMutation.mutate({ oldName: renaming.name, newName: newName.trim() }); }} className="space-y-4 pt-2">
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
          <AlertDialogHeader><AlertDialogTitle>Supprimer «{deleting?.name}» ?</AlertDialogTitle><AlertDialogDescription>Suppression définitive. La catégorie ne contient aucune boutique.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deleting && deleteMutation.mutate(deleting.name)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

// ─── Product categories ────────────────────────────────────────────────────────
type ProductCategory = { id: number; restaurantId: number | null; name: string; sortOrder: number; isActive: boolean };

function ProductCategories() {
  const { data: me } = useBackendMe();
  const qc = useQueryClient();
  const { toast } = useToast();
  const isOwner = me?.user.role === "restaurant_owner";
  const scopedShopIds: number[] = me?.scopedShopIds ?? [];

  // restaurantId filter for the list
  const [filterRestaurantId, setFilterRestaurantId] = useState<string>("");

  const { data: shops } = useQuery<{ id: number; name: string }[]>({
    queryKey: ["/api/backend/shops"],
    queryFn: () => apiFetch("/api/backend/shops"),
  });
  const visibleShops = isOwner ? (shops ?? []).filter((s) => scopedShopIds.includes(s.id)) : (shops ?? []);

  const listKey = ["/api/backend/menu-categories", filterRestaurantId];
  const { data: categories, isLoading } = useQuery<ProductCategory[]>({
    queryKey: listKey,
    queryFn: () => apiFetch(`/api/backend/menu-categories${filterRestaurantId ? `?restaurantId=${filterRestaurantId}` : ""}`),
  });

  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", restaurantId: "", sortOrder: "0" });

  const [editing, setEditing] = useState<ProductCategory | null>(null);
  const [editForm, setEditForm] = useState({ name: "", sortOrder: "0", isActive: true });

  const [deleting, setDeleting] = useState<ProductCategory | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["/api/backend/menu-categories"] });

  const createMutation = useMutation({
    mutationFn: () => apiFetch("/api/backend/menu-categories", {
      method: "POST",
      body: JSON.stringify({
        name: form.name.trim(),
        restaurantId: form.restaurantId ? Number(form.restaurantId) : null,
        sortOrder: Number(form.sortOrder) || 0,
      }),
    }),
    onSuccess: () => { invalidate(); setCreating(false); setForm({ name: "", restaurantId: "", sortOrder: "0" }); toast({ title: "Catégorie créée" }); },
    onError: (e: any) => toast({ title: "Erreur", description: e?.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apiFetch(`/api/backend/menu-categories/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => { invalidate(); setEditing(null); toast({ title: "Catégorie modifiée" }); },
    onError: (e: any) => toast({ title: "Erreur", description: e?.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/backend/menu-categories/${id}`, { method: "DELETE" }),
    onSuccess: () => { invalidate(); setDeleting(null); toast({ title: "Catégorie supprimée" }); },
    onError: (e: any) => toast({ title: "Erreur", description: e?.message, variant: "destructive" }),
  });

  const openEdit = (cat: ProductCategory) => {
    setEditing(cat);
    setEditForm({ name: cat.name, sortOrder: String(cat.sortOrder), isActive: cat.isActive });
  };

  return (
    <Card className="max-w-3xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center space-x-2">
          <Package className="h-5 w-5 text-primary" />
          <span>Catégories de produits</span>
        </CardTitle>
        <Button size="sm" onClick={() => setCreating(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Nouvelle
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filter */}
        <div className="flex items-center gap-3">
          <Select value={filterRestaurantId} onValueChange={setFilterRestaurantId}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Toutes (globales + restaurants)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Toutes</SelectItem>
              {visibleShops.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
          {filterRestaurantId && <Button variant="ghost" size="sm" onClick={() => setFilterRestaurantId("")}>Réinitialiser</Button>}
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Portée</TableHead>
              <TableHead>Ordre</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
              </TableRow>
            )) : categories?.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">Aucune catégorie.</TableCell></TableRow>
            ) : categories?.map((cat) => {
              const shop = visibleShops.find((s) => s.id === cat.restaurantId);
              const isGlobal = cat.restaurantId === null;
              const canEdit = !isGlobal || !isOwner;
              return (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell>
                    {isGlobal
                      ? <Badge variant="outline" className="text-xs">Globale</Badge>
                      : <Badge variant="secondary" className="text-xs">{shop?.name ?? `#${cat.restaurantId}`}</Badge>
                    }
                  </TableCell>
                  <TableCell className="text-muted-foreground">{cat.sortOrder}</TableCell>
                  <TableCell>
                    <Badge variant={cat.isActive ? "default" : "secondary"}>{cat.isActive ? "Active" : "Inactive"}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {canEdit && <Button variant="ghost" size="icon" onClick={() => openEdit(cat)}><Pencil className="h-4 w-4" /></Button>}
                      {canEdit && <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleting(cat)}><Trash2 className="h-4 w-4" /></Button>}
                      {!canEdit && <span className="text-xs text-muted-foreground pr-2">Globale</span>}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>

      {/* Create dialog */}
      <Dialog open={creating} onOpenChange={(o) => !o && setCreating(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle catégorie produit</DialogTitle>
            <DialogDescription>
              {isOwner ? "Catégorie visible uniquement pour vos restaurants." : "Laissez 'Restaurant' vide pour créer une catégorie globale (tous les restaurants)."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); if (form.name.trim()) createMutation.mutate(); }} className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label className="text-xs">Nom *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Burger, Boisson…" required autoFocus />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Restaurant {isOwner ? "*" : "(optionnel — laisser vide = globale)"}</Label>
              <Select value={form.restaurantId} onValueChange={(v) => setForm({ ...form, restaurantId: v })}>
                <SelectTrigger><SelectValue placeholder={isOwner ? "Votre restaurant" : "Globale (tous)"} /></SelectTrigger>
                <SelectContent>
                  {!isOwner && <SelectItem value="">Globale</SelectItem>}
                  {visibleShops.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Ordre d'affichage</Label>
              <Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreating(false)}>Annuler</Button>
              <Button type="submit" disabled={createMutation.isPending || !form.name.trim() || (isOwner && !form.restaurantId)}>
                {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Créer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Modifier «{editing?.name}»</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); if (!editing) return; updateMutation.mutate({ id: editing.id, data: { name: editForm.name.trim(), sortOrder: Number(editForm.sortOrder), isActive: editForm.isActive } }); }} className="space-y-4 pt-2">
            <div className="space-y-1"><Label className="text-xs">Nom *</Label><Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required /></div>
            <div className="space-y-1"><Label className="text-xs">Ordre d'affichage</Label><Input type="number" value={editForm.sortOrder} onChange={(e) => setEditForm({ ...editForm, sortOrder: e.target.value })} /></div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={editForm.isActive} onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })} className="rounded" />
              Active
            </label>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>Annuler</Button>
              <Button type="submit" disabled={updateMutation.isPending || !editForm.name.trim()}>{updateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Enregistrer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Supprimer «{deleting?.name}» ?</AlertDialogTitle><AlertDialogDescription>Les produits déjà assignés à cette catégorie garderont leur valeur actuelle — seule la gestion depuis cette liste sera supprimée.</AlertDialogDescription></AlertDialogHeader>
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

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function Categories() {
  const { data: me } = useBackendMe();
  const isOwner = me?.user.role === "restaurant_owner";
  // Owners only see product categories (they don't manage shop categories)
  const defaultTab = isOwner ? "products" : "shops";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold tracking-tight">Catégories</h1>
      <Tabs defaultValue={defaultTab}>
        <TabsList>
          {!isOwner && <TabsTrigger value="shops" className="gap-2"><Tags className="h-4 w-4" />Boutiques</TabsTrigger>}
          <TabsTrigger value="products" className="gap-2"><Package className="h-4 w-4" />Produits</TabsTrigger>
        </TabsList>
        {!isOwner && (
          <TabsContent value="shops" className="pt-4">
            <ShopCategories />
          </TabsContent>
        )}
        <TabsContent value="products" className="pt-4">
          <ProductCategories />
        </TabsContent>
      </Tabs>
    </div>
  );
}

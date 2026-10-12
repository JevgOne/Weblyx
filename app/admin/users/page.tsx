"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/app/admin/_components/AdminAuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Plus,
  Users,
  Trash2,
  Edit,
  Shield,
  ShieldCheck,
  UserCog,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { type UserRole, ROLE_NAMES, ROLE_DESCRIPTIONS, ROLE_SUMMARY, isOwner } from "@/lib/auth/permissions";

interface Admin {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  active: number;
  created_at: number;
  isLegacy?: boolean;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { user } = useAdminAuth();
  const [admins, setAdmins] = useState<Admin[]>([]);
  // Registrations from /admin/register waiting for a decision.
  const [pending, setPending] = useState<Array<{ id: string; email: string; name: string; created_at: number }>>([]);
  const [pendingRoles, setPendingRoles] = useState<Record<string, UserRole>>({});
  const [decidingId, setDecidingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // New user form state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    name: '',
    password: '',
    role: 'specialist' as UserRole,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [creating, setCreating] = useState(false);

  // Edit user state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Admin | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'specialist' as UserRole,
  });
  const [updating, setUpdating] = useState(false);

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<Admin | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users');
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch admins');
      }

      setAdmins(data.admins || []);
      setPending(data.pending || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDecide = async (id: string, approve: boolean) => {
    setDecidingId(id);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/admin/users/pending/${id}`, approve
        ? {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: pendingRoles[id] || 'specialist' }),
          }
        : { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Akce selhala');
      setSuccess(
        !approve
          ? 'Žádost zamítnuta.'
          : data.emailed
            ? 'Žádost schválena. Uživateli odešel e-mail s potvrzením a přihlašovacími údaji.'
            : 'Žádost schválena, ale potvrzovací e-mail se nepodařilo odeslat. Dejte uživateli vědět sami.'
      );
      fetchAdmins();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDecidingId(null);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      setSuccess(`User ${newUser.email} created successfully!`);
      setIsCreateDialogOpen(false);
      setNewUser({ email: '', name: '', password: '', role: 'admin' });
      fetchAdmins();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setUpdating(true);
    setError(null);

    try {
      const updateData: any = {
        name: editForm.name,
        email: editForm.email,
        role: editForm.role,
      };

      // Only include password if it was changed
      if (editForm.password) {
        updateData.password = editForm.password;
      }

      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update user');
      }

      setSuccess(`User ${editForm.email} updated successfully!`);
      setIsEditDialogOpen(false);
      setEditingUser(null);
      fetchAdmins();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    setDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete user');
      }

      setSuccess(`User ${userToDelete.email} deleted successfully!`);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      fetchAdmins();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const openEditDialog = (admin: Admin) => {
    setEditingUser(admin);
    setEditForm({
      name: admin.name,
      email: admin.email,
      password: '',
      role: admin.role,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (admin: Admin) => {
    setUserToDelete(admin);
    setDeleteDialogOpen(true);
  };

  return (
    <div>
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-primary rounded-lg p-2">
                <Users className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
              </div>
            </div>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Admin User</DialogTitle>
                  <DialogDescription>
                    Add a new administrator to the system.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateUser}>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={newUser.name}
                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        placeholder="john@weblyx.cz"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={newUser.password}
                          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                          placeholder="Min. 8 characters"
                          minLength={8}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select
                        value={newUser.role}
                        onValueChange={(value: UserRole) =>
                          setNewUser({ ...newUser, role: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="specialist">
                            <div className="flex flex-col">
                              <span>Specialista</span>
                              <span className="text-xs text-muted-foreground">Poptávky, Projekty, Blog, Analýzy</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="admin">
                            <div className="flex flex-col">
                              <span>Admin</span>
                              <span className="text-xs text-muted-foreground">Plný přístup k administraci</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={creating}>
                      {creating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Creating...
                        </>
                      ) : (
                        'Create User'
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Alerts */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-500 text-green-700">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {pending.length > 0 && (
          <Card className="mb-6 border-amber-400">
            <CardHeader>
              <CardTitle>Žádosti o přístup ({pending.length})</CardTitle>
              <CardDescription>
                Tito lidé se zaregistrovali na /admin/register. Dokud je neschválíte, nemohou se přihlásit.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {pending.map((p) => (
                <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
                  <div className="min-w-0">
                    <p className="font-semibold">{p.name}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {p.email} · {new Date(p.created_at * 1000).toLocaleDateString('cs-CZ')}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Select
                      value={pendingRoles[p.id] || 'specialist'}
                      onValueChange={(value: UserRole) => setPendingRoles((prev) => ({ ...prev, [p.id]: value }))}
                    >
                      <SelectTrigger className="w-[170px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="specialist">{ROLE_NAMES.specialist.cs}</SelectItem>
                        <SelectItem value="admin">{ROLE_NAMES.admin.cs}</SelectItem>
                        {isOwner(user?.role) && <SelectItem value="owner">{ROLE_NAMES.owner.cs}</SelectItem>}
                      </SelectContent>
                    </Select>
                    <Button disabled={decidingId === p.id} onClick={() => handleDecide(p.id, true)}>
                      Schválit
                    </Button>
                    <Button variant="outline" disabled={decidingId === p.id} onClick={() => handleDecide(p.id, false)}>
                      Zamítnout
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* What each role may do. The server enforces this, not just the menu. */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Role a oprávnění</CardTitle>
            <CardDescription>
              Co která role v panelu smí. Platí to i při zadání adresy ručně, nejen v menu.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {ROLE_SUMMARY.map(({ role, can, cannot }) => (
                <div key={role} className="rounded-lg border p-4">
                  <p className="font-semibold">{ROLE_NAMES[role].cs}</p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-emerald-700">Smí</p>
                  <ul className="mt-1 space-y-1 text-sm">
                    {can.map((item) => (
                      <li key={item}>✓ {item}</li>
                    ))}
                  </ul>
                  {cannot.length > 0 && (
                    <>
                      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-red-700">Nesmí</p>
                      <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
                        {cannot.map((item) => (
                          <li key={item}>✕ {item}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Admin Users</CardTitle>
            <CardDescription>
              All administrator accounts with access to the admin panel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : admins.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No database users yet.</p>
                <p className="text-sm">Legacy users (from env vars) are not shown here.</p>
              </div>
            ) : (
              <Table className="min-w-[810px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell className="font-medium">{admin.name}</TableCell>
                      <TableCell>{admin.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={admin.role === 'owner' ? 'default' : admin.role === 'admin' ? 'secondary' : 'outline'}
                          className={admin.role === 'specialist' ? 'border-blue-500 text-blue-600' : ''}
                        >
                          {admin.role === 'owner' ? (
                            <ShieldCheck className="h-3 w-3 mr-1" />
                          ) : admin.role === 'admin' ? (
                            <Shield className="h-3 w-3 mr-1" />
                          ) : (
                            <UserCog className="h-3 w-3 mr-1" />
                          )}
                          {admin.role === 'owner' ? 'Vlastník' : admin.role === 'admin' ? 'Admin' : 'Specialista'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={admin.active ? 'outline' : 'destructive'}>
                            {admin.active ? 'Active' : 'Inactive'}
                          </Badge>
                          {admin.isLegacy && (
                            <Badge variant="secondary" className="text-xs">
                              ENV
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {admin.created_at > 0
                          ? new Date(admin.created_at * 1000).toLocaleDateString('cs-CZ')
                          : '-'
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(admin)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {isOwner(user?.role) && !admin.isLegacy && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => openDeleteDialog(admin)}
                              disabled={admin.id === user?.id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

      </main>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information. Leave password empty to keep current.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditUser}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-password">New Password (optional)</Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  placeholder="Leave empty to keep current"
                  minLength={8}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select
                  value={editForm.role}
                  onValueChange={(value: UserRole) =>
                    setEditForm({ ...editForm, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="specialist">
                      <div className="flex flex-col">
                        <span>Specialista</span>
                        <span className="text-xs text-muted-foreground">Poptávky, Projekty, Blog, Analýzy</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex flex-col">
                        <span>Admin</span>
                        <span className="text-xs text-muted-foreground">Plný přístup k administraci</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updating}>
                {updating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {userToDelete?.email}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser} disabled={deleting}>
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete User'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

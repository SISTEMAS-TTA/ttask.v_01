"use client";

import { useEffect, useMemo, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import useUser from "@/modules/auth/hooks/useUser";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  listAllUsers,
  deleteUser,
  updateUserProfileFields,
  type UserWithId,
} from "@/lib/firebase/firestore";
import { ALL_USER_ROLES, type UserRole } from "@/modules/types";
import { Loader2, Pencil, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

interface EditFormState {
  fullName: string;
  email: string;
  role: UserRole;
  active: boolean;
}

const allowedRoles: UserRole[] = ["Director", "Aux. Admin"];

const cleanRoleLabel = (value: string) =>
  value.toLowerCase().replace(/\./g, "").replace(/\s+/g, " ").trim();

const normalizeRole = (role?: string): UserRole => {
  if (!role) return "Usuario";
  const target = cleanRoleLabel(role);
  const match = ALL_USER_ROLES.find(
    (option) => cleanRoleLabel(option) === target
  );
  return match ?? "Usuario";
};

const getDisplayName = (user: UserWithId) => {
  const fullName =
    user.fullName ||
    `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  return fullName || user.email || "Sin nombre";
};

export default function AdmonPage() {
  const { user, profile, loading: userLoading } = useUser();
  const [users, setUsers] = useState<UserWithId[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [search, setSearch] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<UserWithId | null>(null);
  const [editForm, setEditForm] = useState<EditFormState>({
    fullName: "",
    email: "",
    role: "Usuario",
    active: true,
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const canAccess =
    !!profile && allowedRoles.includes(profile.role as UserRole);

  useEffect(() => {
    if (userLoading || !canAccess) return;
    void loadUsers();
  }, [userLoading, canAccess]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const allUsers = await listAllUsers();
      allUsers.sort((a, b) =>
        getDisplayName(a).localeCompare(getDisplayName(b), "es-MX")
      );
      setUsers(allUsers);
    } catch (error) {
      console.error(error);
      toast.error("No se pudieron cargar los usuarios");
    } finally {
      setLoadingUsers(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter((u) => {
      const name = getDisplayName(u).toLowerCase();
      const email = (u.email || "").toLowerCase();
      const role = (u.role || "").toLowerCase();
      return (
        name.includes(term) ||
        email.includes(term) ||
        role.includes(term)
      );
    });
  }, [users, search]);

  const stats = useMemo(() => {
    const active = users.filter((u) => u.active !== false).length;
    const roleSet = new Set(users.map((u) => normalizeRole(u.role)));
    return { total: users.length, active, roles: roleSet.size };
  }, [users]);

  const openEdit = (target: UserWithId) => {
    setEditTarget(target);
    setEditForm({
      fullName: getDisplayName(target),
      email: target.email || "",
      role: normalizeRole(target.role),
      active: target.active !== false,
    });
    setIsEditOpen(true);
  };

  const closeEdit = () => {
    setIsEditOpen(false);
    setEditTarget(null);
    setSavingEdit(false);
  };

  const handleEditSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editTarget) return;

    setSavingEdit(true);
    try {
      await updateUserProfileFields(editTarget.id, {
        fullName: editForm.fullName.trim(),
        email: editForm.email.trim(),
        role: editForm.role,
        active: editForm.active,
      });
      toast.success("Usuario actualizado");
      closeEdit();
      await loadUsers();
    } catch (error) {
      console.error(error);
      toast.error("No se pudo actualizar al usuario");
      setSavingEdit(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (id === user?.uid) {
      toast.error("No puedes eliminar tu propia cuenta");
      return;
    }
    const confirmDelete = window.confirm(
      "¿Estás seguro de eliminar este usuario?"
    );
    if (!confirmDelete) return;

    setDeletingId(id);
    try {
      await deleteUser(id);
      toast.success("Usuario eliminado");
      await loadUsers();
    } catch (error) {
      console.error(error);
      toast.error("No se pudo eliminar al usuario");
    } finally {
      setDeletingId(null);
    }
  };

  if (userLoading) {
    return (
      <AuthGuard>
        <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </AuthGuard>
    );
  }

  if (!canAccess) {
    return (
      <AuthGuard>
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Acceso restringido
          </h1>
          <p className="text-gray-600">
            Esta sección está reservada para el Director y el Auxiliar
            Administrativo.
          </p>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="h-[calc(100vh-4rem)] flex flex-col bg-white">
        <div className="px-6 py-4 border-b flex justify-between items-center flex-shrink-0 bg-white shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              Administración de Usuarios
            </h1>
            <p className="text-xs text-gray-500 uppercase font-medium">
              Gestiona, edita o elimina usuarios registrados
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => void loadUsers()}>
            Actualizar listado
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 px-6 py-4 border-b bg-gray-50">
          <Card className="p-4 flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-xs text-gray-500 uppercase">Usuarios</p>
              <p className="text-xl font-semibold text-gray-900">
                {stats.total}
              </p>
            </div>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-gray-500 uppercase">Activos</p>
            <p className="text-xl font-semibold text-emerald-600">
              {stats.active}
            </p>
            <p className="text-xs text-gray-400">
              {stats.total
                ? `${Math.round((stats.active / stats.total) * 100)}% activos`
                : "Sin registros"}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-gray-500 uppercase">
              Roles representados
            </p>
            <p className="text-xl font-semibold text-gray-900">
              {stats.roles}
            </p>
          </Card>
        </div>

        <div className="px-6 py-4 border-b bg-white">
          <div className="max-w-lg">
            <Label className="text-xs uppercase text-gray-500">
              Buscar usuario
            </Label>
            <div className="mt-2 relative">
              {/* <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /> */}
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nombre, correo o rol"
                className="pl-9"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-50/40">
          <div className="max-w-5xl mx-auto p-6 space-y-4">
            {loadingUsers ? (
              <div className="flex items-center justify-center py-20 text-gray-500">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Cargando usuarios...
              </div>
            ) : filteredUsers.length === 0 ? (
              <Card className="p-8 text-center text-gray-500">
                No se encontraron usuarios con esos criterios.
              </Card>
            ) : (
              filteredUsers.map((u) => (
                <Card
                  key={u.id}
                  className="p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-semibold">
                        {getDisplayName(u)}
                      </h2>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          u.active !== false
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {u.active !== false ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{u.email}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Rol: {normalizeRole(u.role)}
                    </p>
                    {u.createdAt && (
                      <p className="text-xs text-gray-400">
                        Alta:{" "}
                        {u.createdAt?.toDate
                          ? u.createdAt.toDate().toLocaleDateString("es-MX", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "Sin registro"}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(u)}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => void handleDelete(u.id)}
                      disabled={deletingId === u.id}
                    >
                      {deletingId === u.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="mr-2 h-4 w-4" />
                      )}
                      Eliminar
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      <Dialog open={isEditOpen} onOpenChange={(open) => (!open ? closeEdit() : setIsEditOpen(true))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleEditSubmit}>
            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre completo</Label>
              <Input
                id="fullName"
                value={editForm.fullName}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, fullName: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, email: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Rol</Label>
              <Select
                value={editForm.role}
                onValueChange={(value) =>
                  setEditForm((prev) => ({
                    ...prev,
                    role: value as UserRole,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  {ALL_USER_ROLES.map((role) => (
                    <SelectItem value={role} key={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select
                value={editForm.active ? "activo" : "inactivo"}
                onValueChange={(value) =>
                  setEditForm((prev) => ({
                    ...prev,
                    active: value === "activo",
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={closeEdit}>
                Cancelar
              </Button>
              <Button type="submit" disabled={savingEdit}>
                {savingEdit ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando
                  </>
                ) : (
                  "Guardar cambios"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AuthGuard>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { listAllUsers, deleteUser } from "@/lib/firebase/firestore";
import { AddUserModal } from "@/modules/admin/components/AddUserModal";
import { toast } from "sonner";
import { useAdmin } from "@/hooks/useAdmin";
import { useRouter } from "next/navigation";

interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  role: string;
  createdAt: Date;
}

export default function AdminUsersPage() {
  const { user, isAdmin, loading } = useAdmin();
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    if (loading) return;

    if (!user || !isAdmin) {
      router.push("/dashboard");
      return;
    }

    loadUsers();
  }, [user, isAdmin, loading, router]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    const allUsers = await listAllUsers();
    const mappedUsers = allUsers.map((u) => ({
      uid: u.id,
      email: u.email,
      fullName: u.fullName || `${u.firstName} ${u.lastName}`,
      role: u.role,
      createdAt: u.createdAt.toDate(),
    }));
    setUsers(mappedUsers);
    setLoadingUsers(false);
  };

  const handleDeleteUser = async (uid: string) => {
    if (!confirm("¿Estás seguro de eliminar este usuario?")) return;
    try {
      await deleteUser(uid);
      toast.success("Usuario eliminado correctamente");
      loadUsers();
    } catch (error) {
      toast.error("Error al eliminar usuario");
      console.error(error);
    }
  };

  const handleUserAdded = () => {
    toast.success("Usuario agregado correctamente");
    setIsAddModalOpen(false);
    loadUsers();
  };

  if (loading || loadingUsers) {
    return <div className="p-8">Cargando...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Administrar Usuarios</h1>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Agregar Usuario
        </Button>
      </div>

      <div className="grid gap-4">
        {users.map((u) => (
          <Card key={u.uid} className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{u.fullName}</h3>
                <p className="text-sm text-gray-600">{u.email}</p>
                <p className="text-xs text-gray-500">Rol: {u.role}</p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteUser(u.uid)}
                disabled={u.uid === user?.uid}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onUserAdded={handleUserAdded}
      />
    </div>
  );
}

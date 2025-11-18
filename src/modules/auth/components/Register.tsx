"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";
import { getSaludo } from "@/lib/greeting";
import { DatePicker } from "@/components/core/DatePicker";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase/config";
import { Timestamp } from "firebase/firestore";

import { createUserProfile } from "@/lib/firebase/firestore";
// [CAMBIO 1]: Importar UserRole (o asegurarnos de que el path es correcto)
import { UserProfile, UserRole } from "@/modules/types/index";
import { USER_PROFILE_STORAGE_KEY } from "@/modules/auth/hooks/useUser";

// [CAMBIO 2]: Definir las props para recibir el rol forzado
interface RegisterProps {
  forcedRole?: UserRole; // Rol que se debe asignar automáticamente (si es Jefe de Área)
}

// [CAMBIO 3]: Aceptar forcedRole como prop
export default function Register({ forcedRole }: RegisterProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [saludo, setSaludo] = useState("");

  useEffect(() => {
    setSaludo(getSaludo());
  }, []);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // [CAMBIO 4]: Usar el rol forzado si existe, si no, usar el estado local
  const initialRole = forcedRole ?? "";
  const [role, setRole] = useState(initialRole);

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ [k: string]: string }>({});
  const router = useRouter();

  const [createUserWithEmailAndPassword, , loading, firebaseError] =
    useCreateUserWithEmailAndPassword(auth);

  // [CAMBIO 5]: Sincronizar el estado del rol con la prop forzada (si cambia)
  useEffect(() => {
    if (forcedRole) {
      setRole(forcedRole);
    }
  }, [forcedRole]);

  useEffect(() => {
    if (firebaseError) {
      setError(firebaseError.message ?? "Error al crear la cuenta");
    }
  }, [firebaseError]);

  const handleSignUp = async () => {
    if (loading) return;
    setError("");
    setFieldErrors({});
    const errs: { [k: string]: string } = {};

    // [AJUSTE VALIDACIÓN]: Usamos el valor del estado 'role', que ya contiene el valor forzado si aplica.
    if (!firstName.trim()) errs.firstName = "Ingresa tu nombre";
    if (!lastName.trim()) errs.lastName = "Ingresa tus apellidos";
    if (!email.trim()) errs.email = "Ingresa tu correo";
    if (!role) errs.role = "Selecciona un rol";
    if (!password) errs.password = "Ingresa una contraseña";
    if (password && password.length < 6)
      errs.password = "La contraseña debe tener al menos 6 caracteres";
    if (password !== confirmPassword)
      errs.confirmPassword = "Las contraseñas no coinciden";

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setError("Corrige los errores antes de continuar");
      return;
    }

    try {
      const res = await createUserWithEmailAndPassword(email, password);
      // console.log({ res, role }); // Log actualizado para usar el rol ya validado

      if (res?.user) {
        const userProfile: UserProfile = {
          email: res.user.email ?? email,
          firstName,
          lastName,
          // [AJUSTE CLAVE]: Usamos el rol final del estado (incluye el valor forzado o el seleccionado).
          role: (role as UserProfile["role"]) || "Usuario",
          createdAt: Timestamp.now(),
          // [AJUSTE]: El campo isAreaChief NO se establece aquí. Se debe establecer
          // manualmente en Firebase para los jefes de área, ya que es un permiso.
        };
        try {
          await createUserProfile(res.user.uid, userProfile);
          localStorage.setItem(
            USER_PROFILE_STORAGE_KEY,
            JSON.stringify(userProfile)
          );
        } catch (storageError) {
          console.error("Error creating user profile", storageError);
          throw new Error("Error creating user profile");
        }
      }
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setFirstName("");
      setLastName("");
      setRole(initialRole); // Mantener el rol forzado o resetear a vacío si no está forzado
      router.push("/login");
    } catch (e) {
      console.error(e);
      setError("Error al crear la cuenta. Intenta de nuevo.");
    }
  };

  return (
    <div className="relative z-0 flex min-h-screen w-full items-center justify-center p-4 pt-16 md:p-8 md:pt-20">
      <Card className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl">
        <CardHeader className="space-y-1 sm:space-y-2">
          <CardTitle className="text-xl sm:text-2xl md:text-3xl">
            {saludo || "Hola"}
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Crea una cuenta para acceder al sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSignUp();
            }}
          >
            <div className="w-full">
              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-2 rounded mb-3">
                  {error}
                </div>
              )}
              <div className="grid gap-4 md:grid-cols-2">
                {/* ... Campos Nombre y Apellido se mantienen ... */}
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="firstName">Nombre</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="Ingresa tu nombre"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    aria-invalid={!!fieldErrors.firstName}
                  />
                  {fieldErrors.firstName && (
                    <p className="text-xs text-red-600">
                      {fieldErrors.firstName}
                    </p>
                  )}
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="lastName">Apellidos</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Ingresa tus apellidos"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    aria-invalid={!!fieldErrors.lastName}
                  />
                  {fieldErrors.lastName && (
                    <p className="text-xs text-red-600">
                      {fieldErrors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col space-y-1.5 mt-4">
                <Label htmlFor="email">Correo</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Ingresa tu correo"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={!!fieldErrors.email}
                />
                {fieldErrors.email && (
                  <p className="text-xs text-red-600">{fieldErrors.email}</p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2 mt-4">
                {/* ... Campos Contraseña se mantienen ... */}
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Ingresa tu contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      aria-invalid={!!fieldErrors.password}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      aria-label={
                        showPassword
                          ? "Ocultar contraseña"
                          : "Mostrar contraseña"
                      }
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center p-1 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="size-4 text-gray-500" />
                      ) : (
                        <Eye className="size-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="text-xs text-red-600">
                      {fieldErrors.password}
                    </p>
                  )}
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirma tu contraseña"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      aria-invalid={!!fieldErrors.confirmPassword}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      aria-label={
                        showConfirmPassword
                          ? "Ocultar contraseña"
                          : "Mostrar contraseña"
                      }
                      onClick={() => setShowConfirmPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center p-1 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="size-4 text-gray-500" />
                      ) : (
                        <Eye className="size-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && (
                    <p className="text-xs text-red-600">
                      {fieldErrors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col space-y-1.5 mt-4">
                <Label htmlFor="role">Area</Label>
                {/* [AJUSTE CLAVE 1]: Deshabilitar el selector si hay un rol forzado (Jefe de Área) */}
                <Select
                  onValueChange={(val) => setRole(val)}
                  value={role}
                  disabled={!!forcedRole}
                >
                  <SelectTrigger
                    className="w-full"
                    aria-label="Selecciona rol"
                    aria-describedby="role-help"
                  >
                    {/* Mostrar el rol forzado como el valor seleccionado */}
                    <SelectValue placeholder="Selecciona un Area" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* [AJUSTE CLAVE 2]: Si hay rol forzado, solo mostrar ese rol como opción */}
                    {forcedRole ? (
                      <SelectItem value={forcedRole}>{forcedRole}</SelectItem>
                    ) : (
                      <>
                        <SelectItem value="Director">Director</SelectItem>
                        <SelectItem value="Administrador">
                          Administrador
                        </SelectItem>
                        <SelectItem value="Proyectos">Proyectos</SelectItem>
                        <SelectItem value="Diseno">Diseño</SelectItem>
                        <SelectItem value="Gerencia">Gerencia</SelectItem>
                        <SelectItem value="Obra">Obra</SelectItem>
                        <SelectItem value="Sistemas">Sistemas</SelectItem>
                        <SelectItem value="Practicante">Practicante</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
                <p id="role-help" className="text-xs text-muted-foreground">
                  {/* Mensaje dinámico si el rol es forzado */}
                  {forcedRole
                    ? `Rol asignado automáticamente por ${forcedRole}.`
                    : "Selecciona tu area — se usará para permisos."}
                </p>
                {fieldErrors.role && (
                  <p className="text-xs text-red-600">{fieldErrors.role}</p>
                )}
              </div>

              <div className="flex flex-col space-y-1.5 mt-4">
                <DatePicker />
              </div>

              <div className="mt-4">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creando cuenta..." : "Crear cuenta"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

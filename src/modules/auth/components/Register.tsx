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
import { UserProfile, UserRole } from "@/modules/types/index";
import { USER_PROFILE_STORAGE_KEY } from "@/modules/auth/hooks/useUser";

interface RegisterProps {
  forcedRole?: UserRole; // Por qué: si un admin crea un usuario, se asigna el rol automáticamente
  isCurrentUserAdmin: boolean;
}

export default function Register({
  forcedRole,
  isCurrentUserAdmin,
}: RegisterProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [saludo, setSaludo] = useState("");
  const [isAreaChief, setIsAreaChief] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Por qué: el rol queda fijo si forcedRole viene de props
  const initialRole = forcedRole ?? "";
  const [role, setRole] = useState(initialRole);

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ [k: string]: string }>({});
  const router = useRouter();

  const [createUserWithEmailAndPassword, , loading, firebaseError] =
    useCreateUserWithEmailAndPassword(auth);

  useEffect(() => {
    setSaludo(getSaludo());
  }, []);

  // Mantener rol sincronizado si forcedRole cambia
  useEffect(() => {
    if (forcedRole) setRole(forcedRole);
  }, [forcedRole]);

  useEffect(() => {
    if (firebaseError) {
      setError(firebaseError.message ?? "Error al crear cuenta");
    }
  }, [firebaseError]);

  const handleSignUp = async () => {
    if (loading) return;
    setError("");
    setFieldErrors({});
    const errs: { [k: string]: string } = {};

    if (!firstName.trim()) errs.firstName = "Ingresa tu nombre";
    if (!lastName.trim()) errs.lastName = "Ingresa tus apellidos";
    if (!email.trim()) errs.email = "Ingresa tu correo";
    if (!role) errs.role = "Selecciona un rol";
    if (!password) errs.password = "Ingresa una contraseña";
    if (password.length < 6)
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
      if (res?.user) {
        const userProfile: UserProfile = {
          email: res.user.email ?? email,
          firstName,
          lastName,
          role: (role as UserProfile["role"]) || "Usuario",
          createdAt: Timestamp.now(),
          isAreaChief, // Por qué: guardar jefe de área si admin lo marcó
        };

        await createUserProfile(res.user.uid, userProfile);

        localStorage.setItem(
          USER_PROFILE_STORAGE_KEY,
          JSON.stringify(userProfile)
        );
      }

      // Reset
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setFirstName("");
      setLastName("");
      setRole(initialRole);

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

              {/* Nombre + Apellidos */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="firstName">Nombre</Label>
                  <Input
                    id="firstName"
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

              {/* Email */}
              <div className="flex flex-col space-y-1.5 mt-4">
                <Label htmlFor="email">Correo</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={!!fieldErrors.email}
                />
                {fieldErrors.email && (
                  <p className="text-xs text-red-600">{fieldErrors.email}</p>
                )}
              </div>

              {/* Password + Confirm */}
              <div className="grid gap-4 md:grid-cols-2 mt-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      aria-invalid={!!fieldErrors.password}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
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
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      aria-invalid={!!fieldErrors.confirmPassword}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showConfirmPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>

                  {fieldErrors.confirmPassword && (
                    <p className="text-xs text-red-600">
                      {fieldErrors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              {/* AREA + JEFE DE ÁREA — EN 2 COLUMNAS */}
              <div className="grid gap-4 md:grid-cols-2 mt-4">
                {/* SELECT: Área */}
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="role">Área</Label>

                  <Select
                    value={role}
                    onValueChange={(v) => setRole(v)}
                    disabled={!!forcedRole} // Por qué: si es rol forzado, no debe modificarse
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un área" />
                    </SelectTrigger>

                    <SelectContent>
                      {forcedRole ? (
                        <SelectItem value={forcedRole}>{forcedRole}</SelectItem>
                      ) : (
                        <>
                          <SelectItem value="Director">Director</SelectItem>
                          <SelectItem value="Administrador">
                            Administrador
                          </SelectItem>
                          <SelectItem value="Aux. Admin">Aux. Admin</SelectItem>
                          <SelectItem value="Arquitectura">
                            Arquitectura
                          </SelectItem>
                          <SelectItem value="Diseno">Diseño</SelectItem>
                          <SelectItem value="Gerencia">Gerencia</SelectItem>
                          <SelectItem value="Obra">Obra</SelectItem>
                          <SelectItem value="Sistemas">Sistemas</SelectItem>
                          <SelectItem value="Practicante">
                            Practicante
                          </SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>

                  <p className="text-xs text-muted-foreground">
                    {forcedRole
                      ? `Rol asignado automáticamente: ${forcedRole}.`
                      : "Selecciona un área."}
                  </p>

                  {fieldErrors.role && (
                    <p className="text-xs text-red-600">{fieldErrors.role}</p>
                  )}
                </div>

                {/* CHECKBOX: Jefe de Área */}
                {isCurrentUserAdmin && (
                  <div className="flex flex-col space-y-1.5 pt-1">
                    <Label htmlFor="isAreaChief">Jefe de Área</Label>

                    <div className="flex items-center space-x-2">
                      <input
                        id="isAreaChief"
                        type="checkbox"
                        checked={isAreaChief}
                        onChange={(e) => setIsAreaChief(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label
                        htmlFor="isAreaChief"
                        className="text-sm cursor-pointer"
                      >
                        Marcar como Jefe de Área
                      </label>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Define si este usuario será responsable del área.
                    </p>
                  </div>
                )}
              </div>

              {/* DatePicker */}
              <div className="flex flex-col space-y-1.5 mt-4">
                <DatePicker />
              </div>

              {/* Botón */}
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

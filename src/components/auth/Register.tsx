"use client";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
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
import { DatePicker } from "../core/DatePicker";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth } from "@/app/firebase/config";
import { Timestamp } from "firebase/firestore";
import { UserProfile } from "@/app/types/index";
import { USER_PROFILE_STORAGE_KEY } from "@/hooks/useUser";

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ [k: string]: string }>({});
  const router = useRouter();

  const [createUserWithEmailAndPassword] =
    useCreateUserWithEmailAndPassword(auth);

  const handleSignUp = async () => {
    setError("");
    setFieldErrors({});
    const errs: { [k: string]: string } = {};
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
      console.log({ res, role });

      if (res?.user) {
        const minimalProfile: UserProfile = {
          email: res.user.email ?? email,
          role: (role as UserProfile["role"]) || "Usuario",
          createdAt: Timestamp.now(),
        };
        try {
          localStorage.setItem(
            USER_PROFILE_STORAGE_KEY,
            JSON.stringify(minimalProfile),
          );
          // TODO: Reemplazar este almacenamiento local con la persistencia real en Firestore cuando el backend esté configurado.
        } catch (storageError) {
          console.error("Error storing fallback user profile", storageError);
        }
      }
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setFirstName("");
      setLastName("");
      setRole("");
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
            {getSaludo()}
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
                <div className="flex flex-col space-y-1.5 relative">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-invalid={!!fieldErrors.password}
                  />
                  <button
                    type="button"
                    aria-label={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-2 top-8 inline-flex items-center justify-center p-1"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                  {fieldErrors.password && (
                    <p className="text-xs text-red-600">
                      {fieldErrors.password}
                    </p>
                  )}
                </div>
                <div className="flex flex-col space-y-1.5 relative">
                  <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirma tu contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    aria-invalid={!!fieldErrors.confirmPassword}
                  />
                  <button
                    type="button"
                    aria-label={
                      showConfirmPassword
                        ? "Ocultar contraseña"
                        : "Mostrar contraseña"
                    }
                    onClick={() => setShowConfirmPassword((s) => !s)}
                    className="absolute right-2 top-8 inline-flex items-center justify-center p-1"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                  {fieldErrors.confirmPassword && (
                    <p className="text-xs text-red-600">
                      {fieldErrors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col space-y-1.5 mt-4">
                <Label htmlFor="role">Rol</Label>
                <Select onValueChange={(val) => setRole(val)} value={role}>
                  <SelectTrigger
                    className="w-full"
                    aria-label="Selecciona rol"
                    aria-describedby="role-help"
                  >
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Director">Director</SelectItem>
                    <SelectItem value="Administrador">Administrador</SelectItem>
                    <SelectItem value="Proyectos">Proyectos</SelectItem>
                    <SelectItem value="Diseno">Diseño</SelectItem>
                    <SelectItem value="Gerencia">Gerencia</SelectItem>
                    <SelectItem value="Obra">Obra</SelectItem>
                    <SelectItem value="Sistemas">Sistemas</SelectItem>
                    <SelectItem value="Practicante">Practicante</SelectItem>
                  </SelectContent>
                </Select>
                <p id="role-help" className="text-xs text-muted-foreground">
                  Selecciona tu rol — se usará para permisos.
                </p>
                {fieldErrors.role && (
                  <p className="text-xs text-red-600">{fieldErrors.role}</p>
                )}
              </div>

              <div className="flex flex-col space-y-1.5 mt-4">
                <DatePicker />
              </div>

              <div className="mt-4">
                <Button type="submit" className="w-full">
                  Crear cuenta
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

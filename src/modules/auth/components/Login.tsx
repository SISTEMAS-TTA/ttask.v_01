"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase/config";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [signInWithEmailAndPassword] = useSignInWithEmailAndPassword(auth);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Por favor ingresa email y contraseña");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await signInWithEmailAndPassword(email, password);

      if (res?.user) {
        setEmail("");
        setPassword("");
        router.push("/");
      } else {
        setError("Credenciales incorrectas. Verifica tu email y contraseña.");
      }
    } catch (error) {
      console.error("Error en login:", error);
      setError("Error al iniciar sesión. Verifica tus credenciales.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-[92%] xs:max-w-[340px] sm:max-w-md shadow-2xl border-0 backdrop-blur-sm bg-white/95 my-auto">
      <CardHeader className="space-y-1 pb-2 pt-4 sm:pt-6 sm:pb-4">
        <CardTitle className="text-xl sm:text-2xl md:text-3xl text-center font-bold text-gray-800">
          Bienvenido
        </CardTitle>
        <p className="text-center text-sm sm:text-base text-gray-500">
          Ingresa a tu cuenta
        </p>
      </CardHeader>

      <CardContent className="px-4 sm:px-6 pb-3 sm:pb-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
        >
          <div className="flex flex-col gap-3 sm:gap-4">
            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-2 sm:p-3 rounded-lg border border-red-200">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm sm:text-base font-medium text-gray-700">
                Correo electrónico
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="ejemplo@ttarquitectos.mx"
                  required
                  className="h-11 sm:h-12 pl-10 text-base"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm sm:text-base font-medium text-gray-700">
                Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="h-11 sm:h-12 pl-10 pr-10 text-base"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 sm:h-12 text-base font-medium mt-1 sm:mt-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Iniciando...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </div>
        </form>
      </CardContent>

      <CardFooter className="pt-0 pb-4 sm:pb-6 px-4 sm:px-6">
        <p className="w-full text-center text-xs sm:text-sm text-gray-500 italic leading-tight">
          &ldquo;Lo esencial es comprender que siempre hay espacio para mejorar&rdquo;
        </p>
      </CardFooter>
    </Card>
  );
}

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

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <div className="flex min-h-screen w-full items-center justify-center p-4 md:p-8">
      <Card className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl">
        <CardHeader className="space-y-1 sm:space-y-2">
          <CardTitle className="text-xl sm:text-2xl md:text-3xl text-center">
            Iniciar Sesion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >
            <div className="flex flex-col gap-4 sm:gap-6">
              {error && (
                <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
                  {error}
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-sm sm:text-base">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@ttarquitectos.mx"
                  required
                  className="h-9 sm:h-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
                  <Label htmlFor="password" className="text-sm sm:text-base">
                    Password
                  </Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  className="h-9 sm:h-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2 sm:gap-3">
          <Button
            type="submit"
            className="w-full h-9 sm:h-10 text-sm sm:text-base"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Iniciando sesión..." : "Login"}
          </Button>
          <h3 className="mt-2 text-sm sm:text-base">
            &ldquo;Lo esencial es comprender que siempre hay espacio para
            mejorar&rdquo;
          </h3>
        </CardFooter>
      </Card>
    </div>
  );
}

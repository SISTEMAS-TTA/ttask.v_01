"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function NavigationGuard() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Push a stable history state so we can control back/forward
    try {
      window.history.replaceState({ guarded: true }, "");
      window.history.pushState({ guarded: true, extra: 1 }, "");
    } catch {
      // ignore
    }

    const onPopState = () => {
      // If user presses back, the browser will fire popstate. We implement rules:
      // - If we're on dashboard ('/'), confirm exit
      // - Otherwise (inside app), just reload current page to avoid going to login

      const current = window.location.pathname;

      if (current === "/") {
        const ok = confirm("¿Estás seguro de que quieres salir?");
        if (ok) {
          // navigate away: sign out + redirect to external page (or close)
          // We'll redirect to /logout route if exists, otherwise to /api/auth/logout if you have one.
          // As a fallback, navigate to /login and clear history so forward cannot re-enter
          try {
            // Clear session storage/cookies if needed here
            // Force navigation to external page to exit app
            window.location.href = "/logout";
          } catch {
            router.push("/login");
          }
        } else {
          // user said no -> stay on page. push a new state so history doesn't move
          try {
            window.history.pushState({ guarded: true, stay: true }, "");
          } catch {
            // ignore
          }
        }
      } else {
        // Not on dashboard: do a reload to avoid exposing previous auth state (prevents going to login/back)
        // Replace current history entry then reload
        try {
          window.location.reload();
        } catch {
          // Fallback: push to current pathname via router
          router.replace(current);
        }
      }
    };

    window.addEventListener("popstate", onPopState);

    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  }, [pathname, router]);

  return null;
}

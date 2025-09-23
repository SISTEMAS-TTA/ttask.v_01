"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[1000] w-full shadow-lg transition-all duration-300
        ${isScrolled ? "bg-white/70 backdrop-blur-md" : "bg-white/80 backdrop-blur-sm"}
      `}
    >
      <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Image
              src="/LogoTT.png"
              alt="TT Arquitectos"
              width={1024}
              height={164}
              className="h-8 w-auto object-contain cursor-pointer hover:opacity-80 transition-opacity duration-200"
              priority
            />
          </div>
        </div>
      </div>
    </header>
  );
}

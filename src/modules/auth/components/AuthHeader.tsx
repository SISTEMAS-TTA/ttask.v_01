import Image from "next/image";
import Link from "next/link";

export function AuthHeader() {
  return (
    <header className="pointer-events-none absolute left-0 top-0 z-30 w-full p-4 bg-gray-50 ">
      <div className="pointer-events-auto">
        <Link href="/" aria-label="ttArquitectos">
          <Image
            src="/LogoTT.png"
            alt="Logo de ttArquitectos"
            width={220}
            height={35}
            priority
            className="h-auto w-40 md:w-56"
          />
        </Link>
      </div>
    </header>
  );
}

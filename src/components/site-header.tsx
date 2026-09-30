import Link from "next/link";
import { MapPin } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="border-sand-200/80 bg-sand-50/80 sticky top-0 z-50 border-b backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="bg-ink-900 grid size-8 place-items-center rounded-xl text-sm font-black text-white">
            M
          </span>
          <span className="leading-tight">
            <span className="text-ink-900 block text-sm font-bold">
              Monis Studio
            </span>
            <span className="text-ink-600 block text-[11px]">
              Workspace designer
            </span>
          </span>
        </Link>

        <span className="border-sand-300 text-ink-700 ml-auto hidden items-center gap-1.5 rounded-full border bg-white px-3 py-1.5 text-xs font-medium sm:flex">
          <MapPin className="size-3.5" />
          Bali, Indonesia
        </span>

        <a
          href="https://www.monis.rent"
          target="_blank"
          rel="noopener noreferrer"
          className="text-ink-700 hover:text-coral-600 text-xs font-medium"
        >
          monis.rent
        </a>
      </div>
    </header>
  );
}

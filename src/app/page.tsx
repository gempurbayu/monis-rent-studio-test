import { Configurator } from "@/components/configurator";
import { SiteHeader } from "@/components/site-header";

export default function HomePage() {
  return (
    <>
      <SiteHeader />

      <section className="mx-auto w-full max-w-7xl px-4 pt-5 pb-3 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-teal-50 border border-teal-200/80 px-2.5 py-0.5 text-[10px] font-bold text-teal-800 uppercase tracking-widest">
                Bali Studio Rentals
              </span>
              <span className="text-xs text-ink-400">· Deliver & setup across Bali</span>
            </div>
            <h1 className="text-ink-900 mt-1.5 text-2xl font-bold tracking-tight sm:text-3xl">
              Design your workspace.{" "}
              <span className="text-ink-500 font-normal">Then rent the whole thing.</span>
            </h1>
          </div>
        </div>
      </section>

      <main className="flex-1">
        <Configurator />
      </main>

      <footer className="border-sand-200 border-t py-8">
        <div className="text-ink-600 mx-auto w-full max-w-7xl px-4 text-xs sm:px-6 lg:px-8">
          Built for the Desent Solutions developer challenge. Inventory data and
          product photography ©{" "}
          <a
            href="https://www.monis.rent"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-coral-600 underline underline-offset-2"
          >
            monis.rent
          </a>
          .
        </div>
      </footer>
    </>
  );
}

import { Configurator } from "@/components/configurator";
import { SiteHeader } from "@/components/site-header";

export default function HomePage() {
  return (
    <>
      <SiteHeader />

      <section className="mx-auto w-full max-w-7xl px-4 pt-10 pb-6 sm:px-6 lg:px-8">
        <p className="text-coral-600 text-xs font-bold tracking-[0.18em] uppercase">
          Rent by the week · Bali
        </p>
        <h1 className="text-ink-900 mt-3 max-w-3xl text-4xl leading-[1.05] font-bold tracking-tight sm:text-5xl">
          Design your workspace.
          <br />
          <span className="text-ink-600">Then rent the whole thing.</span>
        </h1>
        <p className="text-ink-600 mt-4 max-w-xl text-base">
          Just landed and need an office by next week? Pick a desk, drop in a
          chair, stack on monitors and a plant — watch it come together, then hit
          rent. Delivered, set up and picked up for you.
        </p>
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

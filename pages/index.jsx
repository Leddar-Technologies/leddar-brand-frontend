import Link from "next/link";
import { Factory, ShieldCheck, Truck } from "lucide-react";
import Button from "../components/ui/Button";

const features = [
  {
    title: "Private B2B Platform",
    text: "A controlled manufacturing workspace designed exclusively for verified fashion brands.",
    icon: ShieldCheck,
  },
  {
    title: "Expert Artisans",
    text: "Partner with highly skilled leather artisans across Nigeria with premium finishing standards.",
    icon: Factory,
  },
  {
    title: "End-to-End Tracking",
    text: "Follow quotes, production, invoices, and delivery progress in one clear operational dashboard.",
    icon: Truck,
  },
];

export default function Home() {
  return (
    <div className="bg-atmosphere min-h-screen">
      <main className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <section className="rounded-2xl border border-[#E9DFD6] bg-white/70 p-8 shadow-card backdrop-blur-sm md:p-14">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            Leddar
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-ink md:text-6xl">
            Manufacture Premium Leather Products at Scale.
          </h1>
          <p className="mt-5 max-w-2xl text-base text-[#5D4D47] md:text-lg">
            Leddar connects fashion brands with expert leather artisans across
            Nigeria.
          </p>
          <Link href="/signup" className="mt-8 inline-block">
            <Button variant="accent" className="px-7 py-3 text-base">
              Request Access
            </Button>
          </Link>
        </section>

        <section className="mt-10 grid gap-5 md:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="card p-6">
              <feature.icon className="h-7 w-7 text-leather" />
              <h2 className="mt-4 text-xl font-semibold text-ink">
                {feature.title}
              </h2>
              <p className="mt-2 text-sm text-[#5E504A]">{feature.text}</p>
            </article>
          ))}
        </section>
      </main>
      <footer className="border-t border-[#E9DFD6] bg-white/70 py-6 text-center text-sm text-[#6B5C56]">
        Leddar
      </footer>
    </div>
  );
}

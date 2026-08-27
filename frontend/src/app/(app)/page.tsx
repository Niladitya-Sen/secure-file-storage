import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowRight,
  Download,
  LockKeyhole,
  Share2,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const features = [
  {
    eyebrow: "01 / store",
    title: "Your files, finally off the grid.",
    description:
      "A quiet, private home for the things you cannot replace. Upload everything from one beautifully simple workspace.",
    icon: Upload,
    tone: "bg-primary/10 text-primary",
  },
  {
    eyebrow: "02 / share",
    title: "Send the link. Keep the keys.",
    description:
      "Share with confidence using expiring links, optional passwords, and a clear view of who has access.",
    icon: ShieldCheck,
    tone: "bg-secondary text-secondary-foreground",
  },
  {
    eyebrow: "03 / find",
    title: "Everything where you left it.",
    description:
      "A fast, familiar file space that keeps your documents, photos, and archives close across every device.",
    icon: Sparkles,
    tone: "bg-accent text-accent-foreground",
  },
];

export default function LandingPage() {
  return (
    <main className="overflow-hidden bg-popover text-foreground">
      <section className="bg-primary text-primary-foreground">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <a
            href="#top"
            className="flex items-center gap-2.5 text-lg font-bold tracking-[-0.04em]"
          >
            <Image
              src="/assets/logo.png"
              alt="Upfold Logo"
              width={40}
              height={40}
            />
            upfold
          </a>
          <div className="hidden items-center gap-8 text-sm text-primary-foreground/70 md:flex">
            <a
              href="#features"
              className="transition-colors hover:text-primary-foreground"
            >
              Features
            </a>
            <a
              href="#security"
              className="transition-colors hover:text-primary-foreground"
            >
              Security
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="hidden text-sm font-medium text-primary-foreground/80 sm:block"
            >
              Sign in
            </Link>
            <Button
              variant={"secondary"}
              render={<Link href="/auth/register" />}
              nativeButton={false}
            >
              Get started <ArrowRight />
            </Button>
          </div>
        </nav>

        <div
          id="top"
          className="mx-auto min-h-[calc(100svh-81px)] max-w-7xl flex flex-col items-center justify-center px-6 text-center lg:px-10"
        >
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary-foreground/30 bg-primary-foreground/10 px-3 py-1.5 text-xs font-medium text-primary-foreground/80">
            <span className="size-1.5 rounded-full bg-primary-foreground" />{" "}
            Private by design
          </div>
          <h1 className="max-w-162.5 text-[clamp(3.5rem,7vw,6.4rem)] font-bold leading-[0.94] tracking-[-0.075em]">
            A safer place for{" "}
            <span className="text-primary-foreground/70">everything.</span>
          </h1>
          <p className="mt-8 max-w-md text-base leading-7 text-primary-foreground/75 sm:text-lg">
            Secure cloud storage for your files, photos, and ideas. Encrypted
            from end to end, so your private life stays yours.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Button
              variant={"secondary"}
              render={<Link href="/auth/register" />}
              nativeButton={false}
              size="lg"
            >
              Create your free vault{" "}
              <ArrowRight className="ml-2 inline size-4" />
            </Button>
            <a
              href="#security"
              className="text-sm font-semibold text-primary-foreground underline decoration-primary-foreground/60 decoration-2 underline-offset-8"
            >
              See how it works
            </a>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-popover px-6 py-9 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          <span>Private files, by default</span>
          <span className="hidden h-px min-w-16 flex-1 bg-border sm:block" />
          <span>End-to-end encrypted</span>
          <span className="hidden h-px min-w-16 flex-1 bg-border sm:block" />
          <span>Open source &amp; auditable</span>
        </div>
      </section>

      <section
        id="features"
        className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32 bg-popover"
      >
        <div className="max-w-2xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-primary">
            A little more peace of mind
          </p>
          <h2 className="text-4xl font-bold leading-tight tracking-[-0.05em] text-foreground sm:text-6xl">
            The cloud, with the lights on.
          </h2>
          <p className="mt-6 max-w-lg text-lg leading-8 text-muted-foreground">
            Upfold makes privacy feel effortless. No trade-offs, no confusing
            settings, just a place that treats your data with respect.
          </p>
        </div>
        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {features.map(({ eyebrow, title, description, icon: Icon, tone }) => (
            <article
              key={eyebrow}
              className="group border-t border-border pt-5"
            >
              <div
                className={`mb-12 grid size-12 place-items-center rounded-xl ${tone} transition-transform group-hover:rotate-6`}
              >
                <Icon className="size-5" />
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                {eyebrow}
              </p>
              <h3 className="mt-4 text-2xl font-bold leading-tight tracking-[-0.04em]">
                {title}
              </h3>
              <p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">
                {description}
              </p>
              <a
                href="#security"
                className="mt-8 inline-flex items-center text-sm font-bold text-primary"
              >
                Explore{" "}
                <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
              </a>
            </article>
          ))}
        </div>
      </section>

      <section id="security" className="bg-muted px-6 py-24 lg:px-10 lg:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <div className="mb-7 grid size-14 place-items-center rounded-xl bg-primary text-primary-foreground">
              <LockKeyhole className="size-6" />
            </div>
            <h2 className="text-4xl font-bold leading-tight tracking-tighter sm:text-6xl">
              Privacy is not a feature. It is the foundation.
            </h2>
            <p className="mt-6 max-w-lg text-lg leading-8 text-muted-foreground">
              Your files are encrypted before they leave your device. The result
              is simple: your data stays readable to you and the people you
              choose.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Card className="bg-card/75 p-6 h-fit">
              <Share2 className="size-6 text-primary-foreground" />
              <p className="text-xl font-bold tracking-[-0.03em]">
                Access to your files from us
              </p>
              <p className="text-sm leading-6 text-muted-foreground">
                Only you hold the keys.
              </p>
            </Card>
            <Card className="bg-primary p-6 text-primary-foreground sm:translate-y-8">
              <Download className="size-6 text-primary-foreground" />
              <p className="text-xl font-bold tracking-[-0.03em]">
                Your data. Your devices. Your call.
              </p>
              <p className="text-sm leading-6 text-primary-foreground/70">
                Web, desktop, and mobile access that moves at your pace.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <footer className="bg-primary px-6 pt-20 pb-6 text-primary-foreground lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-10 sm:flex-row sm:items-end">
          <div>
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground/70">
              Your private corner of the internet
            </p>
            <h2 className="max-w-2xl text-4xl font-bold leading-tight tracking-[-0.06em] sm:text-6xl">
              Make room for what matters.
            </h2>
          </div>
          <Button
            render={<Link href="/auth/register" />}
            size="lg"
            className="shrink-0 rounded-full"
            nativeButton={false}
          >
            Open your vault <ArrowRight className="ml-2 inline size-4" />
          </Button>
        </div>
        <div className="mx-auto mt-20 flex max-w-7xl flex-col justify-between gap-5 border-t border-primary-foreground/15 pt-6 text-xs text-primary-foreground/65 sm:flex-row">
          <span>© 2026 Upfold</span>
          <span>Private storage for a more intentional internet.</span>
          <span className="flex gap-5">
            <a href="#security" className="hover:text-primary-foreground">
              Security
            </a>
            <a href="/auth/login" className="hover:text-primary-foreground">
              Sign in
            </a>
          </span>
        </div>
      </footer>
    </main>
  );
}

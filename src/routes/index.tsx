import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Wallet,
  BookOpen,
  Bell,
  LineChart,
  ShieldCheck,
  Star,
  ArrowRight,
  Check,
  Phone,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Debbby Ajo — Your Trusted Digital Savings Partner" },
      {
        name: "description",
        content:
          "Join Debbby Ajo, a trusted digital thrift platform where daily, weekly, and monthly contributions are securely recorded and easy to monitor.",
      },
    ],
  }),
});

function Index() {
  const { user, ready } = useAuth();
  if (!ready) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return <Landing />;
}

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Hero />
      <WhySection />
      <Features />
      <HowItWorks />
      <WhyChoose />
      <DashboardPreview />
      <WhoCanJoin />
      <Testimonials />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground">
            <span className="font-display text-lg font-bold">D</span>
          </div>
          <span className="font-display text-xl font-bold tracking-tight">
            Debbby Ajo
          </span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <a href="#features" className="hover:text-foreground">Features</a>
          <a href="#how" className="hover:text-foreground">How it works</a>
          <a href="#faq" className="hover:text-foreground">FAQ</a>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link to="/login">Log in</Link>
          </Button>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link to="/login">Start saving</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="naira-grid-bg relative overflow-hidden border-b border-border/60">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 md:grid-cols-2 md:py-28">
        <div className="flex flex-col justify-center">
          <span className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-accent/40 bg-accent/15 px-3 py-1 text-xs font-medium text-accent-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Your trusted digital savings partner
          </span>
          <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
            Save with confidence.
            <br />
            <span className="text-secondary">Track every contribution.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base text-muted-foreground md:text-lg">
            Join Debbby Ajo — a trusted digital thrift and contribution platform
            where your daily, weekly, or monthly savings are securely recorded
            and easy to monitor.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
              <Link to="/login">
                Start Saving Today <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/login">Log In</Link>
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-secondary" /> Secure records</span>
            <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-secondary" /> Transparent ledger</span>
            <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-secondary" /> Trusted by traders</span>
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-accent/30 via-secondary/10 to-transparent blur-2xl" />
          <PassbookCard />
        </div>
      </div>
    </section>
  );
}

function PassbookCard() {
  const rows = [
    { d: "Jun 1", a: "₦5,000" },
    { d: "Jun 2", a: "₦5,000" },
    { d: "Jun 3", a: "₦5,000" },
  ];
  return (
    <Card className="relative w-full max-w-md overflow-hidden border-border/60 shadow-xl">
      <div className="flex items-center justify-between border-b border-border/60 bg-primary px-5 py-4 text-primary-foreground">
        <div>
          <p className="text-xs opacity-80">Current Savings</p>
          <p className="font-display text-2xl font-bold">₦85,000</p>
        </div>
        <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
          Active
        </span>
      </div>
      <CardContent className="p-5">
        <div className="grid grid-cols-3 gap-3 text-center">
          <Stat label="Today" value="₦5,000" />
          <Stat label="Total" value="17" />
          <Stat label="Next" value="Tomorrow" />
        </div>
        <div className="mt-5">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Contribution History
          </p>
          <ul className="space-y-2">
            {rows.map((r) => (
              <li
                key={r.d}
                className="flex items-center justify-between rounded-md bg-muted/60 px-3 py-2 text-sm"
              >
                <span className="inline-flex items-center gap-2">
                  <Check className="h-4 w-4 text-secondary" /> {r.d}
                </span>
                <span className="font-medium">{r.a}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border/60 p-2">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="font-display text-base font-semibold">{value}</p>
    </div>
  );
}

function WhySection() {
  return (
    <section className="border-b border-border/60 bg-card">
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h2 className="font-display text-3xl font-bold md:text-4xl">
          Why Save with Debbby Ajo?
        </h2>
        <p className="mt-5 text-muted-foreground">
          Managing your savings shouldn't involve uncertainty or paper records.
          With Debbby Ajo, every contribution is recorded instantly, every
          balance is visible, and every customer has access to their savings
          history whenever they need it.
        </p>
      </div>
    </section>
  );
}

const FEATURES = [
  { icon: Wallet, title: "Track Your Contributions", text: "See every payment you've made and your current savings balance in real time." },
  { icon: BookOpen, title: "Digital Savings Passbook", text: "No more paper books. Your contribution history is always available in your account." },
  { icon: Bell, title: "Payment Reminders", text: "Receive reminders so you never miss your contribution day." },
  { icon: LineChart, title: "Monitor Your Progress", text: "Watch your savings grow towards your financial goal." },
  { icon: ShieldCheck, title: "Safe & Secure Records", text: "Your contribution records are securely stored and accessible whenever you need them." },
];

function Features() {
  return (
    <section id="features" className="border-b border-border/60">
      <div className="mx-auto max-w-6xl px-4 py-20">
        <div className="mb-12 max-w-xl">
          <p className="text-sm font-medium uppercase tracking-wider text-secondary">Features</p>
          <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">
            Everything you need in one place
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title} className="border-border/60 transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                <div className="mb-4 grid h-11 w-11 place-items-center rounded-md bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  { n: "1", title: "Register", text: "Create your free account in minutes." },
  { n: "2", title: "Join a Savings Plan", text: "Choose your preferred daily, weekly, or monthly contribution amount." },
  { n: "3", title: "Make Contributions", text: "Pay your contributions to Debbby through your preferred payment method." },
  { n: "4", title: "Track Your Savings", text: "View your contribution history and current balance anytime." },
  { n: "5", title: "Receive Your Payout", text: "At the end of your savings cycle, receive your accumulated funds." },
];

function HowItWorks() {
  return (
    <section id="how" className="border-b border-border/60 bg-card">
      <div className="mx-auto max-w-5xl px-4 py-20">
        <div className="mb-12 text-center">
          <p className="text-sm font-medium uppercase tracking-wider text-secondary">Process</p>
          <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">How it works</h2>
        </div>
        <ol className="relative space-y-5 md:space-y-6">
          {STEPS.map((s) => (
            <li key={s.n} className="flex gap-5 rounded-lg border border-border/60 bg-background p-5">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary font-display text-lg font-bold text-primary-foreground">
                {s.n}
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

const REASONS = [
  "Transparent contribution records",
  "Trusted savings platform",
  "Easy-to-track balances",
  "Digital transaction history",
  "Friendly customer support",
  "Secure account management",
];

function WhyChoose() {
  return (
    <section className="border-b border-border/60">
      <div className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="mb-10 font-display text-3xl font-bold md:text-4xl">
          Why customers choose Debbby Ajo
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {REASONS.map((r) => (
            <li key={r} className="flex items-center gap-3 rounded-md border border-border/60 bg-card p-4">
              <Check className="h-5 w-5 text-secondary" />
              <span className="text-sm font-medium">{r}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function DashboardPreview() {
  return (
    <section className="border-b border-border/60 bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 md:grid-cols-2 md:items-center">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-accent">Customer App</p>
          <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">
            Your savings dashboard, always at hand
          </h2>
          <p className="mt-5 max-w-md text-primary-foreground/80">
            Log in any time to see your current savings, today's contribution,
            payment history and the next payment due.
          </p>
          <div className="mt-8 grid max-w-md grid-cols-2 gap-3">
            <DashStat label="Current Savings" value="₦85,000" />
            <DashStat label="Today's Contribution" value="₦5,000" />
            <DashStat label="Total Contributions" value="17" />
            <DashStat label="Next Payment" value="Tomorrow" />
          </div>
        </div>
        <div className="flex justify-center md:justify-end">
          <PassbookCard />
        </div>
      </div>
    </section>
  );
}

function DashStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-primary-foreground/15 bg-primary-foreground/5 p-4">
      <p className="text-xs text-primary-foreground/70">{label}</p>
      <p className="mt-1 font-display text-xl font-bold">{value}</p>
    </div>
  );
}

const AUDIENCE = [
  "Traders",
  "Market Women",
  "Business Owners",
  "Salary Earners",
  "Artisans",
  "Students",
  "Anyone building a savings habit",
];

function WhoCanJoin() {
  return (
    <section className="border-b border-border/60">
      <div className="mx-auto max-w-5xl px-4 py-20 text-center">
        <h2 className="font-display text-3xl font-bold md:text-4xl">Who can join?</h2>
        <p className="mt-4 text-muted-foreground">Perfect for everyday savers across Nigeria.</p>
        <div className="mt-10 flex flex-wrap justify-center gap-2.5">
          {AUDIENCE.map((a) => (
            <span
              key={a}
              className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium"
            >
              {a}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

const TESTIMONIALS = [
  { q: "I can now see every contribution I've made without asking for my booklet.", n: "Mary A." },
  { q: "Saving with Debbby has become easier because I can monitor my balance anytime.", n: "Chinedu O." },
];

function Testimonials() {
  return (
    <section className="border-b border-border/60 bg-card">
      <div className="mx-auto max-w-5xl px-4 py-20">
        <h2 className="mb-10 text-center font-display text-3xl font-bold md:text-4xl">
          What customers say
        </h2>
        <div className="grid gap-5 md:grid-cols-2">
          {TESTIMONIALS.map((t) => (
            <Card key={t.n} className="border-border/60">
              <CardContent className="p-6">
                <div className="mb-3 flex gap-0.5 text-accent">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="font-display text-lg leading-snug">"{t.q}"</p>
                <p className="mt-4 text-sm text-muted-foreground">— {t.n}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

const FAQS = [
  { q: "How do I join Debbby Ajo?", a: "Create an account, choose a savings plan, and begin making your contributions." },
  { q: "Can I see all my payments?", a: "Yes. Every contribution is recorded and displayed in your account." },
  { q: "Is my information secure?", a: "Yes. Your savings records are securely stored and protected." },
  { q: "Can I access my account on my phone?", a: "Yes. Debbby Ajo works on any smartphone, tablet, or computer." },
];

function FAQ() {
  return (
    <section id="faq" className="border-b border-border/60">
      <div className="mx-auto max-w-3xl px-4 py-20">
        <h2 className="mb-10 text-center font-display text-3xl font-bold md:text-4xl">
          Frequently asked questions
        </h2>
        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left font-display text-base">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-primary text-primary-foreground">
      <div className="naira-grid-bg absolute inset-0 opacity-30" />
      <div className="relative mx-auto max-w-4xl px-4 py-20 text-center">
        <h2 className="font-display text-3xl font-bold md:text-5xl">
          Start building your savings today
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-primary-foreground/80">
          Join hundreds of customers who trust Debbby Ajo to help them save
          consistently and keep accurate records of every contribution.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link to="/login">Open an Account</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
            <a href="#faq"><Phone /> Contact Us</a>
          </Button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/60 bg-card">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground md:flex-row">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded bg-primary text-primary-foreground">
            <span className="font-display text-sm font-bold">D</span>
          </div>
          <span className="font-display font-semibold text-foreground">Debbby Ajo</span>
        </div>
        <p>© {new Date().getFullYear()} Debbby Ajo. Your trusted digital savings partner.</p>
      </div>
    </footer>
  );
}

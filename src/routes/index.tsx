import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { Button } from "@/components/ui/button";
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
  TrendingUp,
  Users,
  Sparkles,
  Twitter,
  Instagram,
  Facebook,
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
  return <Landing />;
}

/* ---------- Primitives ---------- */

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Counter({
  to,
  prefix = "",
  suffix = "",
  duration = 1.6,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => prefix + Math.round(v).toLocaleString() + suffix);
  const [display, setDisplay] = useState(prefix + "0" + suffix);

  useEffect(() => {
    const unsub = rounded.on("change", (v) => setDisplay(v));
    return () => unsub();
  }, [rounded]);

  useEffect(() => {
    if (inView) {
      const controls = animate(mv, to, { duration, ease: [0.22, 1, 0.36, 1] });
      return () => controls.stop();
    }
  }, [inView, to, duration, mv]);

  return <span ref={ref}>{display}</span>;
}

/* ---------- Landing ---------- */

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <Header />
      <Hero />
      <WhySection />
      <Features />
      <HowItWorks />
      <DashboardPreview />
      <WhoCanJoin />
      <Testimonials />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}

/* ---------- Header ---------- */

function Header() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-border/50 bg-background/70 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-sm">
            <span className="font-display text-lg font-bold">D</span>
          </div>
          <span className="font-display text-xl font-bold tracking-tight">Debbby Ajo</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#features" className="story-link transition-colors hover:text-foreground">Features</a>
          <a href="#how" className="story-link transition-colors hover:text-foreground">How it works</a>
          <a href="#faq" className="story-link transition-colors hover:text-foreground">FAQ</a>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild className="hidden sm:inline-flex">
            <Link to="/login">Log in</Link>
          </Button>
          <Button asChild className="rounded-full bg-primary px-5 shadow-sm transition-transform hover:scale-[1.03] hover:bg-primary/90 hover:shadow-md">
            <Link to="/login">Start saving</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

/* ---------- Hero ---------- */

function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-24 md:pt-40 md:pb-32">
      {/* gradient blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-24 h-[480px] w-[480px] rounded-full bg-secondary/25 blur-3xl" />
        <div className="absolute top-20 -right-32 h-[520px] w-[520px] rounded-full bg-accent/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-[360px] w-[360px] rounded-full bg-primary/15 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, color-mix(in oklab, var(--primary) 12%, transparent) 1px, transparent 0)",
            backgroundSize: "26px 26px",
            maskImage: "radial-gradient(ellipse at center, black 40%, transparent 75%)",
          }}
        />
      </div>

      <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 md:grid-cols-[1.1fr_1fr]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col"
        >
          <span className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-border/70 bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            Your trusted digital savings partner
          </span>
          <h1 className="font-display text-[clamp(2.4rem,5.5vw,4.25rem)] font-bold leading-[1.02] tracking-tight">
            Save with confidence.
            <br />
            <span className="bg-gradient-to-r from-secondary via-primary to-secondary bg-clip-text text-transparent">
              Track every contribution.
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-base text-muted-foreground md:text-lg">
            Join Debbby Ajo — a trusted digital thrift platform where your daily, weekly, or
            monthly savings are securely recorded and visible in real time.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="group rounded-full bg-primary px-7 shadow-md transition-all hover:scale-[1.03] hover:bg-primary/90 hover:shadow-lg"
            >
              <Link to="/login">
                Start Saving Today
                <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-border/70 bg-card/60 backdrop-blur transition-all hover:scale-[1.03]"
            >
              <Link to="/login">Log In</Link>
            </Button>
          </div>

          <div className="mt-10 grid max-w-md grid-cols-3 gap-6">
            <HeroStat value={<><Counter to={325000} prefix="₦" /></>} label="Today's collection" />
            <HeroStat value={<><Counter to={156} /></>} label="Active savers" />
            <HeroStat value={<><Counter to={98} suffix="%" /></>} label="On-time rate" />
          </div>
        </motion.div>

        <HeroVisual />
      </div>
    </section>
  );
}

function HeroStat({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div>
      <p className="font-display text-2xl font-bold tracking-tight md:text-3xl">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}

function HeroVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto h-[460px] w-full max-w-md md:h-[520px]"
    >
      {/* main passbook card */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-x-0 top-6 mx-auto w-[88%] overflow-hidden rounded-2xl border border-border/60 bg-card shadow-[0_30px_60px_-20px_rgba(11,59,46,0.35)]"
      >
        <div className="flex items-center justify-between bg-gradient-to-br from-primary to-secondary px-5 py-5 text-primary-foreground">
          <div>
            <p className="text-xs opacity-80">Current Savings</p>
            <p className="font-display text-3xl font-bold">
              ₦<Counter to={85000} />
            </p>
          </div>
          <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
            Active
          </span>
        </div>
        <div className="space-y-2 p-5">
          {[
            { d: "Jun 1", a: "₦5,000" },
            { d: "Jun 2", a: "₦5,000" },
            { d: "Jun 3", a: "₦5,000" },
          ].map((r) => (
            <div
              key={r.d}
              className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2.5 text-sm"
            >
              <span className="inline-flex items-center gap-2">
                <Check className="h-4 w-4 text-secondary" /> {r.d}
              </span>
              <span className="font-medium">{r.a}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* floating notification - received */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0, y: [0, -8, 0] }}
        transition={{
          opacity: { duration: 0.6, delay: 0.7 },
          x: { duration: 0.6, delay: 0.7 },
          y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.7 },
        }}
        className="absolute -left-2 top-2 flex items-center gap-3 rounded-xl border border-border/60 bg-background/85 px-4 py-3 shadow-lg backdrop-blur-xl md:-left-6"
      >
        <div className="grid h-9 w-9 place-items-center rounded-full bg-secondary/15 text-secondary">
          <TrendingUp className="h-4 w-4" />
        </div>
        <div>
          <p className="font-display text-sm font-semibold text-secondary">+ ₦5,000 Received</p>
          <p className="text-[11px] text-muted-foreground">Mary just made today's contribution</p>
        </div>
      </motion.div>

      {/* floating notification - savers */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0, y: [0, 10, 0] }}
        transition={{
          opacity: { duration: 0.6, delay: 1 },
          x: { duration: 0.6, delay: 1 },
          y: { duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 },
        }}
        className="absolute -right-2 bottom-16 w-[200px] rounded-xl border border-border/60 bg-background/85 p-4 shadow-lg backdrop-blur-xl md:-right-4"
      >
        <div className="mb-1 flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Active savers</p>
        </div>
        <p className="font-display text-2xl font-bold">
          <Counter to={156} />
        </p>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "82%" }}
            transition={{ duration: 1.4, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="h-full rounded-full bg-gradient-to-r from-secondary to-accent"
          />
        </div>
      </motion.div>

      {/* floating gold chip */}
      <motion.div
        animate={{ y: [0, -6, 0], rotate: [0, 2, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-2 left-6 inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground shadow-md"
      >
        <ShieldCheck className="h-3.5 w-3.5" />
        Secure & Verified
      </motion.div>
    </motion.div>
  );
}

/* ---------- Why ---------- */

function WhySection() {
  return (
    <section className="border-y border-border/60 bg-card">
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <Reveal>
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            Why save with Debbby Ajo?
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-5 text-muted-foreground">
            Managing your savings shouldn't involve uncertainty or paper records.
            Every contribution is recorded instantly, every balance is visible, and your
            savings history is available whenever you need it.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- Features ---------- */

const FEATURES = [
  { icon: Wallet, title: "Track Your Contributions", text: "See every payment you've made and your current savings balance in real time." },
  { icon: BookOpen, title: "Digital Savings Passbook", text: "No more paper books. Your contribution history is always available in your account." },
  { icon: Bell, title: "Payment Reminders", text: "Receive reminders so you never miss your contribution day." },
  { icon: LineChart, title: "Monitor Your Progress", text: "Watch your savings grow towards your financial goal." },
  { icon: ShieldCheck, title: "Safe & Secure Records", text: "Your contribution records are securely stored and accessible whenever you need them." },
  { icon: TrendingUp, title: "Insights at a Glance", text: "Spot trends, streaks, and milestones with a clean, friendly summary." },
];

function Features() {
  return (
    <section id="features" className="border-b border-border/60">
      <div className="mx-auto max-w-6xl px-4 py-24">
        <Reveal>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-secondary">Features</p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-2 max-w-2xl font-display text-3xl font-bold md:text-4xl">
            Everything you need in one place
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.05}>
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="group relative h-full overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-shadow hover:shadow-xl"
              >
                <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-secondary/10 blur-2xl transition-opacity group-hover:opacity-100" />
                <div className="relative mb-5 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 text-primary transition-transform group-hover:rotate-6">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- How it works (timeline) ---------- */

const STEPS = [
  { n: "1", title: "Register", text: "Create your free account in minutes." },
  { n: "2", title: "Join a Savings Plan", text: "Choose daily, weekly, or monthly contributions." },
  { n: "3", title: "Make Contributions", text: "Pay through your preferred payment method." },
  { n: "4", title: "Track Your Savings", text: "View history and current balance anytime." },
  { n: "5", title: "Receive Your Payout", text: "Get your accumulated funds on schedule." },
];

function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });

  return (
    <section id="how" className="border-b border-border/60 bg-card">
      <div className="mx-auto max-w-4xl px-4 py-24">
        <div className="mb-14 text-center">
          <Reveal>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-secondary">Process</p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">How it works</h2>
          </Reveal>
        </div>

        <div ref={ref} className="relative">
          {/* animated connecting line */}
          <div className="absolute bottom-2 left-[26px] top-2 w-px overflow-hidden bg-border/60 md:left-1/2">
            <motion.div
              initial={{ height: 0 }}
              animate={inView ? { height: "100%" } : {}}
              transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
              className="w-px bg-gradient-to-b from-secondary via-primary to-accent"
            />
          </div>

          <ol className="space-y-7">
            {STEPS.map((s, i) => (
              <motion.li
                key={s.n}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                className={`relative flex items-start gap-5 md:w-1/2 ${
                  i % 2 === 0 ? "md:pr-12" : "md:ml-auto md:pl-12"
                }`}
              >
                <div className={`absolute top-1 ${i % 2 === 0 ? "left-0 md:left-auto md:-right-[26px]" : "left-0 md:-left-[26px]"} grid h-[52px] w-[52px] place-items-center rounded-full bg-gradient-to-br from-primary to-secondary font-display text-lg font-bold text-primary-foreground shadow-lg ring-4 ring-card`}>
                  {s.n}
                </div>
                <div className="ml-[68px] rounded-xl border border-border/60 bg-background p-5 shadow-sm md:ml-0 md:w-full">
                  <h3 className="font-display text-lg font-semibold">{s.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ---------- Dashboard preview (animated) ---------- */

function DashboardPreview() {
  return (
    <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-br from-primary via-[#0d4536] to-secondary text-primary-foreground">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 left-1/4 h-72 w-72 rounded-full bg-accent/25 blur-3xl" />
        <div className="absolute -bottom-20 right-1/4 h-80 w-80 rounded-full bg-secondary/40 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 py-24 md:grid-cols-2">
        <Reveal>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">Customer App</p>
          <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">
            Your savings dashboard, always at hand
          </h2>
          <p className="mt-5 max-w-md text-primary-foreground/80">
            Log in any time to see your current savings, today's contribution, payment
            history, and your next payment due — all updated the moment a collection lands.
          </p>
          <div className="mt-8 grid max-w-md grid-cols-2 gap-3">
            <DashStat label="Current Savings" value={<>₦<Counter to={85000} /></>} />
            <DashStat label="Today's Contribution" value={<>₦<Counter to={5000} /></>} />
            <DashStat label="Total Contributions" value={<Counter to={17} />} />
            <DashStat label="Next Payment" value={<span className="text-xl">Tomorrow</span>} />
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <LiveDashboard />
        </Reveal>
      </div>
    </section>
  );
}

function DashStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-primary-foreground/15 bg-primary-foreground/5 p-4 backdrop-blur">
      <p className="text-xs text-primary-foreground/70">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold">{value}</p>
    </div>
  );
}

function LiveDashboard() {
  const baseRows = [
    { name: "Mary A.", amount: 5000, time: "9:12 AM" },
    { name: "Chinedu O.", amount: 5000, time: "9:34 AM" },
    { name: "Aisha B.", amount: 5000, time: "10:02 AM" },
  ];
  const [rows, setRows] = useState(baseRows);
  const [balance, setBalance] = useState(85000);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    const names = ["Tunde K.", "Ngozi E.", "Sade O.", "Ibrahim M.", "Funke L."];
    let i = 0;
    const t = setInterval(() => {
      const name = names[i % names.length];
      i++;
      setToast(true);
      setRows((prev) => [{ name, amount: 5000, time: "now" }, ...prev].slice(0, 4));
      setBalance((b) => b + 5000);
      setTimeout(() => setToast(false), 2200);
    }, 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="overflow-hidden rounded-2xl border border-primary-foreground/15 bg-background/95 text-foreground shadow-[0_40px_80px_-30px_rgba(0,0,0,0.5)] backdrop-blur-xl">
        <div className="flex items-center justify-between bg-gradient-to-br from-primary to-secondary px-5 py-5 text-primary-foreground">
          <div>
            <p className="text-xs opacity-80">Today's Collection</p>
            <p className="font-display text-3xl font-bold">
              ₦{balance.toLocaleString()}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            Live
          </span>
        </div>
        <div className="space-y-2 p-5">
          <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Recent contributions
          </p>
          {rows.map((r, i) => (
            <motion.div
              key={`${r.name}-${i}`}
              layout
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2.5 text-sm"
            >
              <span className="inline-flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-secondary/15 text-xs font-semibold text-secondary">
                  {r.name.charAt(0)}
                </span>
                <span>
                  <span className="font-medium">{r.name}</span>
                  <span className="ml-2 text-[11px] text-muted-foreground">{r.time}</span>
                </span>
              </span>
              <span className="font-medium text-secondary">+₦{r.amount.toLocaleString()}</span>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div
        initial={false}
        animate={toast ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
        transition={{ duration: 0.4 }}
        className="pointer-events-none absolute -top-4 right-4 flex items-center gap-2 rounded-full border border-border/60 bg-background px-3.5 py-2 text-xs font-medium text-foreground shadow-lg"
      >
        <Check className="h-3.5 w-3.5 text-secondary" />
        Payment recorded
      </motion.div>
    </div>
  );
}

/* ---------- Who can join ---------- */

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
      <div className="mx-auto max-w-5xl px-4 py-24 text-center">
        <Reveal>
          <h2 className="font-display text-3xl font-bold md:text-4xl">Who can join?</h2>
        </Reveal>
        <Reveal delay={0.05}>
          <p className="mt-4 text-muted-foreground">Perfect for everyday savers across Nigeria.</p>
        </Reveal>
        <div className="mt-10 flex flex-wrap justify-center gap-2.5">
          {AUDIENCE.map((a, i) => (
            <Reveal key={a} delay={i * 0.04}>
              <motion.span
                whileHover={{ y: -3 }}
                className="inline-block cursor-default rounded-full border border-border bg-card px-4 py-2 text-sm font-medium shadow-sm transition-shadow hover:shadow-md"
              >
                {a}
              </motion.span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Testimonials ---------- */

const TESTIMONIALS = [
  { q: "I can now see every contribution I've made without asking for my booklet.", n: "Mary A.", role: "Market trader" },
  { q: "Saving with Debbby has become easier because I can monitor my balance anytime.", n: "Chinedu O.", role: "Small business owner" },
  { q: "The reminders keep me consistent. My savings grew faster than I expected.", n: "Aisha B.", role: "Artisan" },
];

function Testimonials() {
  return (
    <section className="border-b border-border/60 bg-card">
      <div className="mx-auto max-w-6xl px-4 py-24">
        <Reveal>
          <h2 className="mb-12 text-center font-display text-3xl font-bold md:text-4xl">
            What customers say
          </h2>
        </Reveal>
        <div className="grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.n} delay={i * 0.08}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="h-full rounded-2xl border border-border/60 bg-background p-6 shadow-sm transition-shadow hover:shadow-xl"
              >
                <div className="mb-3 flex gap-0.5 text-accent">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="font-display text-lg leading-snug">"{t.q}"</p>
                <div className="mt-5 flex items-center gap-3 border-t border-border/60 pt-4">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-sm font-semibold text-primary-foreground">
                    {t.n.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.n}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- FAQ ---------- */

const FAQS = [
  { q: "How do I join Debbby Ajo?", a: "Create an account, choose a savings plan, and begin making your contributions." },
  { q: "Can I see all my payments?", a: "Yes. Every contribution is recorded and displayed in your account." },
  { q: "Is my information secure?", a: "Yes. Your savings records are securely stored and protected." },
  { q: "Can I access my account on my phone?", a: "Yes. Debbby Ajo works on any smartphone, tablet, or computer." },
];

function FAQ() {
  return (
    <section id="faq" className="border-b border-border/60">
      <div className="mx-auto max-w-3xl px-4 py-24">
        <Reveal>
          <h2 className="mb-10 text-center font-display text-3xl font-bold md:text-4xl">
            Frequently asked questions
          </h2>
        </Reveal>
        <Reveal delay={0.05}>
          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left font-display text-base">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- Final CTA ---------- */

function FinalCTA() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#0B6E4F_0%,#18A058_55%,#34D399_100%)]" />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-accent/30 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-4xl px-4 py-24 text-center text-white">
        <Reveal>
          <h2 className="font-display text-3xl font-bold md:text-5xl">
            Start building your savings today
          </h2>
        </Reveal>
        <Reveal delay={0.05}>
          <p className="mx-auto mt-5 max-w-xl text-white/85">
            Join hundreds of customers who trust Debbby Ajo to help them save consistently
            and keep accurate records of every contribution.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-white px-7 text-primary shadow-lg transition-transform hover:scale-[1.03] hover:bg-white/95"
            >
              <Link to="/login">Open an Account</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-white/50 bg-white/10 text-white backdrop-blur transition-transform hover:scale-[1.03] hover:bg-white/20"
            >
              <a href="#faq"><Phone /> Contact Us</a>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- Footer ---------- */

function Footer() {
  return (
    <footer className="border-t border-border/60 bg-card">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-10 text-sm text-muted-foreground md:flex-row">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-secondary text-primary-foreground">
            <span className="font-display text-sm font-bold">D</span>
          </div>
          <span className="font-display font-semibold text-foreground">Debbby Ajo</span>
        </div>
        <p>© {new Date().getFullYear()} Debbby Ajo. Your trusted digital savings partner.</p>
        <div className="flex items-center gap-2">
          {[Twitter, Instagram, Facebook].map((I, i) => (
            <a
              key={i}
              href="#"
              className="grid h-9 w-9 place-items-center rounded-full border border-border/60 text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-secondary hover:text-secondary hover:shadow-sm"
              aria-label="Social link"
            >
              <I className="h-4 w-4" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

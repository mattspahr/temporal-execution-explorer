import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  RotateCcw,
  Bell,
  Timer,
  ArrowRight,
  BookOpen,
  Github,
  Cloud,
} from "lucide-react";
import { STEPS } from "@/lib/steps";
import { useStepper } from "@/lib/StepperContext";

const recapItems = [
  { icon: ShieldCheck, label: "Crash Recovery", color: "text-temporal-green" },
  { icon: RotateCcw, label: "Automatic Retries", color: "text-temporal-orange" },
  { icon: Bell, label: "Signals", color: "text-temporal-pink" },
  { icon: Timer, label: "Durable Timers", color: "text-temporal-amber" },
];

const ctaLinks = [
  {
    icon: BookOpen,
    label: "Read the Docs",
    description: "Step-by-step guides to build your first workflow",
    href: "https://docs.temporal.io/develop",
  },
  {
    icon: Github,
    label: "GitHub",
    description: "Explore samples and SDK source code",
    href: "https://github.com/temporalio",
  },
  {
    icon: Cloud,
    label: "Try Temporal Cloud",
    description: "Managed service — no infrastructure to run",
    href: "https://temporal.io/cloud",
  },
];

export const ClosingPage = () => {
  const navigate = useNavigate();
  const { completedSteps } = useStepper();
  const allCompleted = STEPS.every((s) => completedSteps.has(s.id));

  return (
    <div className="min-h-[calc(100vh-3rem)] flex flex-col items-center justify-center px-8 py-16">
      {/* Headline */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-2xl mx-auto mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4 leading-tight">
          Speed without sacrificing{" "}
          <span className="text-temporal-purple">durability</span>
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Temporal lets you write business logic as straightforward code while
          the platform handles failures, retries, and state — so nothing gets
          lost, even when everything else goes wrong.
        </p>
      </motion.div>

      {/* Recap strip */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-wrap items-center justify-center gap-6 mb-14"
      >
        {recapItems.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 + i * 0.08 }}
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <item.icon className={`w-4 h-4 ${item.color}`} />
            <span>{item.label}</span>
          </motion.div>
        ))}
        {allCompleted && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-xs text-temporal-green font-medium ml-2"
          >
            All demos completed
          </motion.span>
        )}
      </motion.div>

      {/* CTA cards */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl w-full mb-12"
      >
        {ctaLinks.map((cta, i) => (
          <motion.a
            key={cta.label}
            href={cta.href}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex flex-col gap-2 p-5 rounded-xl border border-slide-border bg-slide-surface hover:border-temporal-purple/40 transition-colors group"
          >
            <cta.icon className="w-5 h-5 text-temporal-purple" />
            <span className="text-sm font-semibold text-foreground group-hover:text-temporal-purple transition-colors">
              {cta.label}
            </span>
            <span className="text-xs text-muted-foreground leading-relaxed">
              {cta.description}
            </span>
          </motion.a>
        ))}
      </motion.div>

      {/* Replay demos link */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        onClick={() => navigate("/")}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowRight className="w-3.5 h-3.5" />
        Replay the demos
      </motion.button>
    </div>
  );
};

import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { STEPS } from "@/lib/steps";
import { useStepper } from "@/lib/StepperContext";

export const LandingPage = () => {
  const navigate = useNavigate();
  const { visitedSteps, completedSteps } = useStepper();

  const firstIncomplete = STEPS.find((s) => !completedSteps.has(s.id));
  const ctaPath = firstIncomplete ? firstIncomplete.path : STEPS[0].path;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 py-16">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-3xl mx-auto mb-16"
      >
        <div className="mb-6">
          <span className="text-muted-foreground text-lg font-normal">Temporal Workflow Demos</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4 leading-tight">
          See how Temporal keeps your workflows running — no matter what
        </h1>
        <p className="text-muted-foreground text-lg mb-8">
          A 5-minute interactive walkthrough
        </p>
        <motion.button
          onClick={() => navigate(ctaPath)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-temporal-purple text-white text-sm font-semibold shadow-lg shadow-temporal-purple/25"
        >
          Start the Demo
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      </motion.div>

      {/* Step Cards */}
      <div className="w-full max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {/* Connector lines (desktop only) */}
          <div className="hidden md:block absolute top-6 left-[calc(12.5%+12px)] right-[calc(12.5%+12px)] h-px bg-slide-border z-0" />

          {STEPS.map((step, i) => {
            const isVisited = visitedSteps.has(step.id);
            const isCompleted = completedSteps.has(step.id);

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * i }}
                onClick={() => navigate(step.path)}
                className="relative z-10 flex flex-col items-center text-center p-4 rounded-xl border border-slide-border bg-slide-surface hover:border-temporal-purple/40 cursor-pointer transition-colors group"
              >
                {/* Step number circle */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold mb-3 transition-colors ${
                    isCompleted
                      ? "bg-temporal-green text-white"
                      : isVisited
                        ? "bg-temporal-purple text-white"
                        : "border-2 border-slide-border text-muted-foreground"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    step.stepNumber
                  )}
                </div>

                <h3 className="text-sm font-semibold text-foreground mb-1 group-hover:text-temporal-purple transition-colors">
                  {step.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {step.question}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

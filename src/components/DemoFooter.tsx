import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { STEPS, getStepByPath, getAdjacentSteps } from "@/lib/steps";
import { useStepper } from "@/lib/StepperContext";

export const DemoFooter = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { completedSteps } = useStepper();

  const current = getStepByPath(pathname);
  if (!current) return null;

  const { prev, next } = getAdjacentSteps(pathname);
  const isCurrentCompleted = completedSteps.has(current.id);
  const isLastStep = !next;

  const nextLabel = isLastStep ? "Get Started" : `Next: ${next.title}`;
  const nextPath = isLastStep ? "/get-started" : next.path;

  return (
    <nav className="fixed bottom-2 left-0 right-0 z-50 bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-12">
        {/* Left: Previous */}
        <div className="w-48">
          {prev ? (
            <button
              onClick={() => navigate(prev.path)}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              {prev.title}
            </button>
          ) : (
            <span />
          )}
        </div>

        {/* Center: Progress dots */}
        <div className="flex items-center gap-2">
          {STEPS.map((step) => {
            const isActive = step.id === current.id;
            const isDone = completedSteps.has(step.id);

            return (
              <button
                key={step.id}
                onClick={() => navigate(step.path)}
                title={step.title}
                className={`w-2 h-2 rounded-full transition-all ${
                  isActive
                    ? "bg-temporal-purple scale-125"
                    : isDone
                      ? "bg-temporal-green"
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
              />
            );
          })}
        </div>

        {/* Right: Next */}
        <div className="w-48 flex justify-end">
          <AnimatePresence mode="wait">
            {isCurrentCompleted ? (
              <motion.button
                key="cta"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{
                  opacity: 1,
                  scale: [1, 1.05, 1],
                  boxShadow: [
                    "0 0 0px rgba(68,76,231,0)",
                    "0 0 16px rgba(68,76,231,0.5)",
                    "0 0 0px rgba(68,76,231,0)",
                  ],
                }}
                transition={{
                  opacity: { duration: 0.2 },
                  scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
                  boxShadow: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
                }}
                onClick={() => navigate(nextPath)}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-temporal-purple text-white text-sm font-semibold"
              >
                {nextLabel}
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            ) : (
              <motion.button
                key="quiet"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => navigate(nextPath)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {nextLabel}
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
};

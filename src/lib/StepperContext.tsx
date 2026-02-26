import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface StepperState {
  visitedSteps: Set<string>;
  completedSteps: Set<string>;
  markVisited: (stepId: string) => void;
  markCompleted: (stepId: string) => void;
  resetProgress: () => void;
}

const StepperContext = createContext<StepperState | null>(null);

export function StepperProvider({ children }: { children: ReactNode }) {
  const [visitedSteps, setVisitedSteps] = useState<Set<string>>(new Set());
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const markVisited = useCallback((stepId: string) => {
    setVisitedSteps((prev) => {
      if (prev.has(stepId)) return prev;
      const next = new Set(prev);
      next.add(stepId);
      return next;
    });
  }, []);

  const markCompleted = useCallback((stepId: string) => {
    setCompletedSteps((prev) => {
      if (prev.has(stepId)) return prev;
      const next = new Set(prev);
      next.add(stepId);
      return next;
    });
  }, []);

  const resetProgress = useCallback(() => {
    setVisitedSteps(new Set());
    setCompletedSteps(new Set());
  }, []);

  return (
    <StepperContext.Provider value={{ visitedSteps, completedSteps, markVisited, markCompleted, resetProgress }}>
      {children}
    </StepperContext.Provider>
  );
}

export function useStepper(): StepperState {
  const ctx = useContext(StepperContext);
  if (!ctx) throw new Error("useStepper must be used within StepperProvider");
  return ctx;
}

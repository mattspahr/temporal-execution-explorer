export interface StepConfig {
  id: string;
  path: string;
  stepNumber: number;
  title: string;
  subtitle: string;
  question: string;
}

export const STEPS: StepConfig[] = [
  {
    id: "crash-recovery",
    path: "/crash-recovery",
    stepNumber: 1,
    title: "Crash Recovery",
    subtitle: "Workflows survive server failures",
    question: "What if your server crashes mid-checkout?",
  },
  {
    id: "activity-retries",
    path: "/activity-retries",
    stepNumber: 2,
    title: "Retries",
    subtitle: "Automatic retries with exponential backoff",
    question: "What if an external API is flaky?",
  },
  {
    id: "signals",
    path: "/signals",
    stepNumber: 3,
    title: "Signals",
    subtitle: "Pause for human decisions, durably",
    question: "What if you need human approval?",
  },
  {
    id: "timers",
    path: "/timers",
    stepNumber: 4,
    title: "Timers",
    subtitle: "Sleep for hours or days without compute",
    question: "What if you need to wait 24 hours?",
  },
];

export function getStepByPath(path: string): StepConfig | undefined {
  return STEPS.find((s) => s.path === path);
}

export function getAdjacentSteps(path: string): { prev?: StepConfig; next?: StepConfig } {
  const idx = STEPS.findIndex((s) => s.path === path);
  if (idx === -1) return {};
  return {
    prev: idx > 0 ? STEPS[idx - 1] : undefined,
    next: idx < STEPS.length - 1 ? STEPS[idx + 1] : undefined,
  };
}

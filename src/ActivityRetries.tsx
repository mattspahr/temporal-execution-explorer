import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipForward, RotateCcw, CheckCircle2, ChevronRight, ChevronDown, Server } from "lucide-react";
import {
  type SdkKey,
  type SdkDefinition,
  type EventItem,
  sdkOrder,
  buildDisplayItems,
  getEventColor,
  highlightCode,
} from "@/lib/shared";
import { useStepper } from "@/lib/StepperContext";

// --- SDK definitions with retry policy visible ---

const sdkDefinitions: Record<SdkKey, SdkDefinition> = {
  typescript: {
    label: "TypeScript",
    filename: "checkout-workflow.ts",
    codeLines: [
      { line: "import { proxyActivities } from '@temporalio/workflow';", type: "import" },
      { line: "", type: "empty" },
      { line: "const { chargeCard, reserveInventory, shipOrder } = proxyActivities<Activities>({", type: "const" },
      { line: "  startToCloseTimeout: '30 seconds',", type: "config" },
      { line: "  retry: {", type: "config" },
      { line: "    initialInterval: '1 second',", type: "config" },
      { line: "    backoffCoefficient: 2,", type: "config" },
      { line: "    maximumAttempts: 5,", type: "config" },
      { line: "  },", type: "config" },
      { line: "});", type: "const" },
      { line: "", type: "empty" },
      { line: "export async function CheckoutWorkflow(orderId: string) {", type: "function" },
      { line: "  const payment = await chargeCard(orderId);", type: "await", activity: "chargeCard" },
      { line: "  await reserveInventory(orderId);", type: "await", activity: "reserveInventory" },
      { line: "  await shipOrder(orderId);", type: "await", activity: "shipOrder" },
      { line: "  return { status: 'COMPLETED', authId: payment.authId };", type: "return" },
      { line: "}", type: "function" },
    ],
  },
  go: {
    label: "Go",
    filename: "checkout_workflow.go",
    codeLines: [
      { line: "package workflows", type: "keyword" },
      { line: "", type: "empty" },
      { line: "import (", type: "import" },
      { line: '  "go.temporal.io/sdk/temporal"', type: "import" },
      { line: '  "go.temporal.io/sdk/workflow"', type: "import" },
      { line: ")", type: "import" },
      { line: "", type: "empty" },
      { line: "func CheckoutWorkflow(ctx workflow.Context, orderID string) error {", type: "function" },
      { line: "  opts := workflow.ActivityOptions{", type: "const" },
      { line: "    StartToCloseTimeout: 30 * time.Second,", type: "config" },
      { line: "    RetryPolicy: &temporal.RetryPolicy{", type: "config" },
      { line: "      InitialInterval:    time.Second,", type: "config" },
      { line: "      BackoffCoefficient: 2,", type: "config" },
      { line: "      MaximumAttempts:    5,", type: "config" },
      { line: "    },", type: "config" },
      { line: "  }", type: "const" },
      { line: "  ctx = workflow.WithActivityOptions(ctx, opts)", type: "const" },
      { line: "", type: "empty" },
      { line: "  var payment PaymentResult", type: "const" },
      { line: "  err := workflow.ExecuteActivity(ctx, ChargeCard, orderID).Get(ctx, &payment)", type: "await", activity: "chargeCard" },
      { line: "  if err != nil { return err }", type: "keyword" },
      { line: "", type: "empty" },
      { line: "  err = workflow.ExecuteActivity(ctx, ReserveInventory, orderID).Get(ctx, nil)", type: "await", activity: "reserveInventory" },
      { line: "  if err != nil { return err }", type: "keyword" },
      { line: "", type: "empty" },
      { line: "  err = workflow.ExecuteActivity(ctx, ShipOrder, orderID).Get(ctx, nil)", type: "await", activity: "shipOrder" },
      { line: "  if err != nil { return err }", type: "keyword" },
      { line: "", type: "empty" },
      { line: "  return nil", type: "return" },
      { line: "}", type: "function" },
    ],
  },
  python: {
    label: "Python",
    filename: "checkout_workflow.py",
    codeLines: [
      { line: "from datetime import timedelta", type: "import" },
      { line: "from temporalio import workflow", type: "import" },
      { line: "from temporalio.common import RetryPolicy", type: "import" },
      { line: "", type: "empty" },
      { line: "@workflow.defn", type: "decorator" },
      { line: "class CheckoutWorkflow:", type: "function" },
      { line: "", type: "empty" },
      { line: "  @workflow.run", type: "decorator" },
      { line: "  async def run(self, order_id: str) -> dict:", type: "function" },
      { line: "    retry = RetryPolicy(", type: "config" },
      { line: "      initial_interval=timedelta(seconds=1),", type: "config" },
      { line: "      backoff_coefficient=2,", type: "config" },
      { line: "      maximum_attempts=5,", type: "config" },
      { line: "    )", type: "const" },
      { line: "", type: "empty" },
      { line: "    payment = await workflow.execute_activity(", type: "await", activity: "chargeCard" },
      { line: "      charge_card, order_id,", type: "config" },
      { line: "      start_to_close_timeout=timedelta(seconds=30),", type: "config" },
      { line: "      retry_policy=retry,", type: "config" },
      { line: "    )", type: "const" },
      { line: "", type: "empty" },
      { line: "    await workflow.execute_activity(", type: "await", activity: "reserveInventory" },
      { line: "      reserve_inventory, order_id,", type: "config" },
      { line: "      start_to_close_timeout=timedelta(seconds=30),", type: "config" },
      { line: "      retry_policy=retry,", type: "config" },
      { line: "    )", type: "const" },
      { line: "", type: "empty" },
      { line: "    await workflow.execute_activity(", type: "await", activity: "shipOrder" },
      { line: "      ship_order, order_id,", type: "config" },
      { line: "      start_to_close_timeout=timedelta(seconds=30),", type: "config" },
      { line: "      retry_policy=retry,", type: "config" },
      { line: "    )", type: "const" },
      { line: "", type: "empty" },
      { line: '    return {"status": "COMPLETED", "authId": payment["authId"]}', type: "return" },
    ],
  },
  java: {
    label: "Java",
    filename: "CheckoutWorkflow.java",
    codeLines: [
      { line: "import io.temporal.activity.ActivityOptions;", type: "import" },
      { line: "import io.temporal.common.RetryOptions;", type: "import" },
      { line: "import io.temporal.workflow.Workflow;", type: "import" },
      { line: "import java.time.Duration;", type: "import" },
      { line: "", type: "empty" },
      { line: "public class CheckoutWorkflowImpl implements CheckoutWorkflow {", type: "function" },
      { line: "", type: "empty" },
      { line: "  private final Activities activities = Workflow.newActivityStub(", type: "const" },
      { line: "    Activities.class,", type: "config" },
      { line: "    ActivityOptions.newBuilder()", type: "config" },
      { line: "      .setStartToCloseTimeout(Duration.ofSeconds(30))", type: "config" },
      { line: "      .setRetryOptions(RetryOptions.newBuilder()", type: "config" },
      { line: "        .setInitialInterval(Duration.ofSeconds(1))", type: "config" },
      { line: "        .setBackoffCoefficient(2)", type: "config" },
      { line: "        .setMaximumAttempts(5)", type: "config" },
      { line: "        .build())", type: "config" },
      { line: "      .build());", type: "config" },
      { line: "", type: "empty" },
      { line: "  @Override", type: "decorator" },
      { line: "  public CheckoutResult run(String orderId) {", type: "function" },
      { line: "    PaymentResult payment = activities.chargeCard(orderId);", type: "await", activity: "chargeCard" },
      { line: "    activities.reserveInventory(orderId);", type: "await", activity: "reserveInventory" },
      { line: "    activities.shipOrder(orderId);", type: "await", activity: "shipOrder" },
      { line: '    return new CheckoutResult("COMPLETED", payment.getAuthId());', type: "return" },
      { line: "  }", type: "function" },
      { line: "}", type: "function" },
    ],
  },
};

// --- Event history for retry scenario ---

const allEvents: EventItem[] = [
  { id: 1, name: "WorkflowExecutionStarted", type: "Workflow", timestamp: "00:00:00.000" },
  { id: 2, name: "WorkflowTaskScheduled", type: "WorkflowTask", timestamp: "00:00:00.001" },
  { id: 3, name: "WorkflowTaskStarted", type: "WorkflowTask", timestamp: "00:00:00.012" },
  { id: 4, name: "WorkflowTaskCompleted", type: "WorkflowTask", timestamp: "00:00:00.014" },
  { id: 5, name: "ActivityTaskScheduled", activity: "chargeCard", type: "Activity", timestamp: "00:00:00.015" },
  { id: 6, name: "ActivityTaskStarted", activity: "chargeCard", type: "Activity", timestamp: "00:00:00.045", attempt: 1 },
  { id: 7, name: "ActivityTaskFailed", activity: "chargeCard", type: "ActivityFailed", timestamp: "00:00:00.892", errorMessage: "Payment gateway timeout", attempt: 1 },
  { id: 8, name: "ActivityTaskStarted", activity: "chargeCard", type: "Activity", timestamp: "00:00:01.893", attempt: 2 },
  { id: 9, name: "ActivityTaskFailed", activity: "chargeCard", type: "ActivityFailed", timestamp: "00:00:02.401", errorMessage: "Payment gateway timeout", attempt: 2 },
  { id: 10, name: "ActivityTaskStarted", activity: "chargeCard", type: "Activity", timestamp: "00:00:04.402", attempt: 3 },
  { id: 11, name: "ActivityTaskCompleted", activity: "chargeCard", type: "Activity", timestamp: "00:00:05.120" },
  { id: 12, name: "WorkflowTaskScheduled", type: "WorkflowTask", timestamp: "00:00:05.121" },
  { id: 13, name: "WorkflowTaskStarted", type: "WorkflowTask", timestamp: "00:00:05.130" },
  { id: 14, name: "WorkflowTaskCompleted", type: "WorkflowTask", timestamp: "00:00:05.132" },
  { id: 15, name: "ActivityTaskScheduled", activity: "reserveInventory", type: "Activity", timestamp: "00:00:05.133" },
  { id: 16, name: "ActivityTaskStarted", activity: "reserveInventory", type: "Activity", timestamp: "00:00:05.160" },
  { id: 17, name: "ActivityTaskCompleted", activity: "reserveInventory", type: "Activity", timestamp: "00:00:05.390" },
  { id: 18, name: "WorkflowTaskScheduled", type: "WorkflowTask", timestamp: "00:00:05.391" },
  { id: 19, name: "WorkflowTaskStarted", type: "WorkflowTask", timestamp: "00:00:05.399" },
  { id: 20, name: "WorkflowTaskCompleted", type: "WorkflowTask", timestamp: "00:00:05.401" },
  { id: 21, name: "ActivityTaskScheduled", activity: "shipOrder", type: "Activity", timestamp: "00:00:05.402" },
  { id: 22, name: "ActivityTaskStarted", activity: "shipOrder", type: "Activity", timestamp: "00:00:05.430" },
  { id: 23, name: "ActivityTaskCompleted", activity: "shipOrder", type: "Activity", timestamp: "00:00:06.680" },
  { id: 24, name: "WorkflowTaskScheduled", type: "WorkflowTask", timestamp: "00:00:06.681" },
  { id: 25, name: "WorkflowTaskStarted", type: "WorkflowTask", timestamp: "00:00:06.690" },
  { id: 26, name: "WorkflowTaskCompleted", type: "WorkflowTask", timestamp: "00:00:06.692" },
  { id: 27, name: "WorkflowExecutionCompleted", type: "Workflow", timestamp: "00:00:06.693" },
];

const displayItems = buildDisplayItems(allEvents);

// --- Failure display indices (for chargeCard attempt 1 & 2 failures) ---

const FAILURE_1_INDEX = displayItems.findIndex((item) => {
  if (item.kind === 'single') {
    const ev = allEvents[item.eventIndex];
    return ev.name === "ActivityTaskFailed" && ev.attempt === 1;
  }
  return false;
});

const FAILURE_2_INDEX = displayItems.findIndex((item) => {
  if (item.kind === 'single') {
    const ev = allEvents[item.eventIndex];
    return ev.name === "ActivityTaskFailed" && ev.attempt === 2;
  }
  return false;
});

const SUCCESS_INDEX = displayItems.findIndex((item) => {
  if (item.kind === 'single') {
    const ev = allEvents[item.eventIndex];
    return ev.name === "ActivityTaskCompleted" && ev.activity === "chargeCard";
  }
  return false;
});

// --- Component ---

export const ActivityRetriesSlide = () => {
  const { markVisited, markCompleted } = useStepper();
  const [activeSDK, setActiveSDK] = useState<SdkKey>("typescript");
  const [visibleEvents, setVisibleEvents] = useState<number[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());
  const [displayItemCursor, setDisplayItemCursor] = useState(0);

  // Retry-specific state
  const [retryPaused, setRetryPaused] = useState(false);
  const [currentAttempt, setCurrentAttempt] = useState<number | null>(null);
  const [backoffSeconds, setBackoffSeconds] = useState(0);
  const [backoffCountdown, setBackoffCountdown] = useState(0);
  const [showRetryCallout, setShowRetryCallout] = useState(false);
  const [showSuccessCallout, setShowSuccessCallout] = useState(false);
  const [failedLineFlash, setFailedLineFlash] = useState(false);
  const [successLineFlash, setSuccessLineFlash] = useState(false);

  const hasAutoPlayed = useRef(false);
  const backoffTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeCodeLines = sdkDefinitions[activeSDK].codeLines;
  const chargeCardLineIndex = activeCodeLines.findIndex(item => item.activity === "chargeCard");

  const reset = useCallback(() => {
    if (backoffTimerRef.current) {
      clearInterval(backoffTimerRef.current);
      backoffTimerRef.current = null;
    }
    setVisibleEvents([]);
    setSelectedEvent(null);
    setIsPlaying(false);
    setCompleted(false);
    setExpandedGroups(new Set());
    setDisplayItemCursor(0);
    setRetryPaused(false);
    setCurrentAttempt(null);
    setBackoffSeconds(0);
    setBackoffCountdown(0);
    setShowRetryCallout(false);
    setShowSuccessCallout(false);
    setFailedLineFlash(false);
    setSuccessLineFlash(false);
    hasAutoPlayed.current = false;
  }, []);

  const startBackoffCountdown = useCallback((seconds: number) => {
    setBackoffCountdown(seconds);
    const startTime = Date.now();
    backoffTimerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const remaining = Math.max(0, seconds - elapsed);
      setBackoffCountdown(remaining);
      if (remaining <= 0) {
        clearInterval(backoffTimerRef.current!);
        backoffTimerRef.current = null;
        setRetryPaused(false);
        setFailedLineFlash(false);
        setBackoffCountdown(0);
        setIsPlaying(true);
      }
    }, 50);
  }, []);

  const addNextEvent = useCallback((stepMode = false) => {
    const nextDisplayIdx = displayItemCursor;

    if (nextDisplayIdx < displayItems.length) {
      const item = displayItems[nextDisplayIdx];
      let lastEventIndex: number;

      if (item.kind === 'single') {
        setVisibleEvents(prev => [...prev, item.eventIndex]);
        lastEventIndex = item.eventIndex;
      } else {
        setVisibleEvents(prev => [...prev, ...item.eventIndices]);
        lastEventIndex = item.eventIndices[item.eventIndices.length - 1];
      }

      setSelectedEvent(lastEventIndex);
      setDisplayItemCursor(nextDisplayIdx + 1);

      // Check if this is a failure event — always show retry UI
      if (nextDisplayIdx === FAILURE_1_INDEX) {
        setRetryPaused(true);
        setIsPlaying(false);
        setCurrentAttempt(1);
        setFailedLineFlash(true);
        setShowRetryCallout(true);
        setBackoffSeconds(1);
        if (!stepMode) startBackoffCountdown(1);
        return false;
      }

      if (nextDisplayIdx === FAILURE_2_INDEX) {
        setRetryPaused(true);
        setIsPlaying(false);
        setCurrentAttempt(2);
        setFailedLineFlash(true);
        setBackoffSeconds(2);
        if (!stepMode) startBackoffCountdown(2);
        return false;
      }

      // Check if chargeCard succeeded
      if (nextDisplayIdx === SUCCESS_INDEX) {
        setCurrentAttempt(null);
        setSuccessLineFlash(true);
        setShowRetryCallout(false);
        setShowSuccessCallout(true);
        setTimeout(() => {
          setSuccessLineFlash(false);
          setShowSuccessCallout(false);
        }, 2000);
      }

      if (nextDisplayIdx === displayItems.length - 1) {
        setCompleted(true);
        setIsPlaying(false);
        return false;
      }
      return true;
    }
    return false;
  }, [displayItemCursor, startBackoffCountdown]);

  useEffect(() => { markVisited("activity-retries"); }, [markVisited]);
  useEffect(() => { if (completed) markCompleted("activity-retries"); }, [completed, markCompleted]);

  // Auto-play on mount
  useEffect(() => {
    if (hasAutoPlayed.current) return;
    hasAutoPlayed.current = true;
    const timer = setTimeout(() => {
      setIsPlaying(true);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Playback interval
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const continued = addNextEvent();
      if (!continued) {
        setIsPlaying(false);
      }
    }, 800);

    return () => clearInterval(interval);
  }, [isPlaying, addNextEvent]);

  const highlightedActivity = selectedEvent !== null ? allEvents[selectedEvent]?.activity || null : null;
  const visibleSet = new Set(visibleEvents);

  const toggleGroup = (displayIdx: number) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(displayIdx)) {
        next.delete(displayIdx);
      } else {
        next.add(displayIdx);
      }
      return next;
    });
  };

  return (
    <div className="slide-content">
      <div className="w-full max-w-7xl flex flex-col h-full">
        {/* Header */}
        <div className="text-center mb-3 lg:mb-6">
          <h2 className="text-xl sm:text-2xl lg:text-4xl font-semibold tracking-tight text-foreground mb-1 lg:mb-2">
            What happens when an API is <span className="gradient-text">flaky</span>?
          </h2>
          <p className="text-muted-foreground text-sm lg:text-base max-w-2xl mx-auto">
            Temporal retries failed activities with exponential backoff by default.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mb-3 lg:mb-4 flex items-center gap-2 lg:gap-3 overflow-x-auto scrollbar-hide">
          <motion.button
            onClick={() => {
              if (isPlaying) {
                setIsPlaying(false);
              } else {
                if (retryPaused) {
                  if (backoffTimerRef.current) {
                    clearInterval(backoffTimerRef.current);
                    backoffTimerRef.current = null;
                  }
                  setRetryPaused(false);
                  setFailedLineFlash(false);
                  setBackoffCountdown(0);
                }
                setIsPlaying(true);
              }
            }}
            disabled={completed}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="shrink-0 flex items-center gap-1.5 px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg bg-primary text-primary-foreground text-xs lg:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> : <Play className="w-3.5 h-3.5 lg:w-4 lg:h-4" />}
            {isPlaying ? "Pause" : "Play"}
          </motion.button>

          <motion.button
            onClick={() => {
              if (retryPaused) {
                if (backoffTimerRef.current) {
                  clearInterval(backoffTimerRef.current);
                  backoffTimerRef.current = null;
                }
                setRetryPaused(false);
                setFailedLineFlash(false);
                setBackoffCountdown(0);
              }
              addNextEvent(true);
            }}
            disabled={isPlaying || completed}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="shrink-0 flex items-center gap-1.5 px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg bg-secondary text-secondary-foreground text-xs lg:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SkipForward className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
            <span className="hidden sm:inline">Step</span>
          </motion.button>

          <div className="flex-1" />

          <motion.button
            onClick={reset}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="shrink-0 flex items-center gap-1.5 px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg bg-secondary text-secondary-foreground text-xs lg:text-sm font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
            <span className="hidden sm:inline">Reset</span>
          </motion.button>
        </div>

        {/* Worker Status Strip */}
        <span className="text-[10px] text-muted-foreground/50 font-mono tracking-wider mb-1 block">Your infrastructure</span>
        <div className="flex flex-wrap items-center gap-2 lg:gap-3 mb-3 lg:mb-4">
          <motion.div
            className={`flex items-center gap-2 lg:gap-2.5 px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg border transition-colors duration-400 ${
              visibleEvents.length > 0 && !completed
                ? 'bg-temporal-green/10 border-temporal-green/30'
                : 'bg-secondary/50 border-slide-border'
            }`}
          >
            <Server className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-muted-foreground" />
            <span className="text-xs lg:text-sm font-medium text-foreground">Worker 1</span>
            {completed ? (
              <span className="flex items-center gap-1 lg:gap-1.5 text-[10px] lg:text-xs font-semibold px-1.5 lg:px-2 py-0.5 rounded-full bg-temporal-green/20 text-temporal-green border border-temporal-green/30">
                <CheckCircle2 className="w-3 h-3" />
                COMPLETED
              </span>
            ) : visibleEvents.length > 0 ? (
              <span className="flex items-center gap-1 lg:gap-1.5 text-[10px] lg:text-xs font-semibold px-1.5 lg:px-2 py-0.5 rounded-full bg-temporal-green/20 text-temporal-green border border-temporal-green/30">
                <motion.span
                  className="w-1.5 h-1.5 rounded-full bg-temporal-green"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                />
                RUNNING
              </span>
            ) : (
              <span className="flex items-center gap-1 lg:gap-1.5 text-[10px] lg:text-xs font-semibold px-1.5 lg:px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-slide-border">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                IDLE
              </span>
            )}
          </motion.div>

          {/* Attempt badge */}
          <AnimatePresence>
            {currentAttempt !== null && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-temporal-orange/10 border border-temporal-orange/30"
              >
                <span className="text-xs font-semibold text-temporal-orange">
                  Attempt {currentAttempt} of 5
                </span>
                {retryPaused && backoffSeconds > 0 && (
                  <span className="text-xs text-temporal-orange/70 font-mono">
                    {backoffCountdown > 0
                      ? `retry in ${backoffCountdown.toFixed(1)}s`
                      : `backoff: ${backoffSeconds}s`}
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Two Column Layout — stacks on mobile */}
        <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
          {/* Left Column - Code (55%) */}
          <div className="w-full lg:w-[55%] flex flex-col min-h-[250px] sm:min-h-[300px] lg:min-h-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
                Workflow code
              </span>
            </div>

            <div className="flex items-center gap-1 mb-2">
              {sdkOrder.map(sdk => (
                <button
                  key={sdk}
                  onClick={() => { setActiveSDK(sdk); reset(); }}
                  className={`px-2 lg:px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    activeSDK === sdk
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  {sdkDefinitions[sdk].label}
                </button>
              ))}
            </div>

            <div className="code-block flex-1 overflow-auto relative">
              <div className="absolute top-0 left-0 right-0 h-8 flex items-center gap-2 px-4 border-b border-slide-border bg-code-bg">
                <div className="w-3 h-3 rounded-full bg-destructive/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-temporal-green/60" />
                <span className="ml-4 text-xs text-muted-foreground font-mono truncate">{sdkDefinitions[activeSDK].filename}</span>
              </div>

              <pre className="mt-8 text-xs sm:text-sm leading-relaxed">
                <code>
                  {activeCodeLines.map((item, idx) => {
                    const isHighlighted = item.activity && item.activity === highlightedActivity && !failedLineFlash && !successLineFlash;
                    const isFailFlash = failedLineFlash && idx === chargeCardLineIndex;
                    const isSuccessFlash = successLineFlash && idx === chargeCardLineIndex;

                    return (
                      <motion.div
                        key={idx}
                        className={`px-2 -mx-2 rounded relative transition-all duration-200 border-l-[3px] ${
                          isFailFlash
                            ? 'bg-destructive/30 border-destructive shadow-[inset_0_0_20px_rgba(239,68,68,0.15)]'
                            : isSuccessFlash
                              ? 'bg-temporal-green/30 border-temporal-green shadow-[inset_0_0_20px_rgba(24,182,129,0.15)]'
                              : isHighlighted
                                ? 'bg-primary/40 border-primary shadow-[inset_0_0_20px_rgba(139,92,246,0.15)]'
                                : 'border-transparent'
                        }`}
                        animate={
                          isFailFlash
                            ? { backgroundColor: ["hsl(0 84% 60% / 0.2)", "hsl(0 84% 60% / 0.4)", "hsl(0 84% 60% / 0.2)"] }
                            : isSuccessFlash
                              ? { backgroundColor: ["hsl(160 78% 39% / 0.2)", "hsl(160 78% 39% / 0.5)", "hsl(160 78% 39% / 0.2)"] }
                              : isHighlighted
                                ? { backgroundColor: ["hsl(263 70% 58% / 0.25)", "hsl(263 70% 58% / 0.45)", "hsl(263 70% 58% / 0.25)"] }
                                : { backgroundColor: "transparent" }
                        }
                        transition={
                          isFailFlash
                            ? { duration: 0.6, repeat: Infinity, ease: "easeInOut" }
                            : isSuccessFlash
                              ? { duration: 0.8, repeat: Infinity, ease: "easeInOut" }
                              : isHighlighted
                                ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
                                : { duration: 0.2 }
                        }
                      >
                        <span className="text-muted-foreground/50 select-none inline-block w-4 lg:w-6 text-right mr-1.5 lg:mr-4 text-[10px] lg:text-xs">
                          {idx + 1}
                        </span>
                        {highlightCode(item.line, activeSDK)}
                      </motion.div>
                    );
                  })}
                </code>
              </pre>
            </div>
          </div>

          {/* Center Divider — hidden on mobile */}
          <div className="hidden lg:block w-px bg-slide-border relative">
            {/* Retry Policy Callout */}
            <AnimatePresence>
              {showRetryCallout && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-64 p-4 rounded-xl bg-slide-surface border border-temporal-orange/30 shadow-xl"
                >
                  <h4 className="font-semibold text-temporal-orange mb-3 text-center text-sm">Retry Policy</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">initialInterval</span>
                      <span className="font-mono text-foreground">1s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">backoffCoefficient</span>
                      <span className="font-mono text-foreground">2</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">maximumAttempts</span>
                      <span className="font-mono text-foreground">5</span>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slide-border">
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span>1s</span>
                        <span className="text-foreground">&rarr;</span>
                        <span>2s</span>
                        <span className="text-foreground">&rarr;</span>
                        <span>4s</span>
                        <span className="text-foreground">&rarr;</span>
                        <span>8s</span>
                        <span className="text-foreground">&rarr;</span>
                        <span>16s</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground/60 mt-1 block">Exponential backoff schedule</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success Callout */}
            <AnimatePresence>
              {showSuccessCallout && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-56 p-4 rounded-xl bg-slide-surface border border-temporal-green/30 shadow-xl"
                >
                  <div className="flex items-center gap-2 justify-center">
                    <CheckCircle2 className="w-5 h-5 text-temporal-green" />
                    <h4 className="font-semibold text-temporal-green text-sm">Activity recovered!</h4>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    chargeCard succeeded on attempt 3. Workflow continues.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Retry Policy Callout — shown inline on mobile only */}
          <AnimatePresence>
            {showRetryCallout && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="lg:hidden p-3 rounded-xl bg-slide-surface border border-temporal-orange/30 shadow-xl"
              >
                <h4 className="font-semibold text-temporal-orange mb-2 text-center text-sm">Retry Policy</h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">initialInterval</span>
                    <span className="font-mono text-foreground">1s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">backoffCoefficient</span>
                    <span className="font-mono text-foreground">2</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">maximumAttempts</span>
                    <span className="font-mono text-foreground">5</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile Success Callout — shown inline on mobile only */}
          <AnimatePresence>
            {showSuccessCallout && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="lg:hidden p-3 rounded-xl bg-slide-surface border border-temporal-green/30 shadow-xl"
              >
                <div className="flex items-center gap-2 justify-center">
                  <CheckCircle2 className="w-4 h-4 text-temporal-green" />
                  <h4 className="font-semibold text-temporal-green text-sm">Activity recovered!</h4>
                </div>
                <p className="text-xs text-muted-foreground mt-1 text-center">
                  chargeCard succeeded on attempt 3. Workflow continues.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Right Column - Events (45%) */}
          <div className="w-full lg:w-[45%] flex flex-col min-h-[200px] sm:min-h-[250px] lg:min-h-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-muted-foreground/50 font-mono tracking-wider">Temporal Cloud</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
                Event History (append-only)
              </span>
              {completed && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-1.5 px-2 py-1 rounded bg-temporal-green/20 text-temporal-green text-xs font-semibold"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  COMPLETED
                </motion.div>
              )}
            </div>

            <div className="flex-1 rounded-xl bg-slide-surface border border-slide-border overflow-hidden">
              <div className="h-full overflow-auto p-2 lg:p-3 space-y-1 lg:space-y-1.5">
                {visibleEvents.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground/50 text-sm italic">
                    Events will appear as execution progresses
                  </div>
                ) : (
                  <AnimatePresence>
                    {displayItems.map((displayItem, displayIdx) => {
                      if (displayItem.kind === 'single') {
                        const eventIdx = displayItem.eventIndex;
                        if (!visibleSet.has(eventIdx)) return null;
                        const event = allEvents[eventIdx];
                        const isSelected = selectedEvent === eventIdx;
                        const isFailed = event.type === "ActivityFailed";

                        return (
                          <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{
                              opacity: 1,
                              y: 0,
                              ...(isFailed ? {
                                backgroundColor: ["hsl(0 62.8% 50% / 0.1)", "hsl(0 62.8% 50% / 0.25)", "hsl(0 62.8% 50% / 0.1)"]
                              } : {})
                            }}
                            transition={isFailed ? { backgroundColor: { duration: 1, repeat: 2, ease: "easeInOut" } } : undefined}
                            onClick={() => setSelectedEvent(eventIdx)}
                            className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all text-xs ${
                              isSelected
                                ? isFailed
                                  ? 'bg-destructive/15 border border-destructive/40'
                                  : 'bg-primary/10 border border-primary/30'
                                : isFailed
                                  ? 'bg-destructive/5 border border-destructive/20'
                                  : 'hover:bg-secondary/50 border border-transparent'
                            }`}
                          >
                            <span className={`w-5 h-5 flex items-center justify-center rounded font-mono text-[10px] ${
                              isFailed ? 'bg-destructive/20 text-destructive' : 'bg-secondary text-muted-foreground'
                            }`}>
                              {event.id}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] border ${getEventColor(event.type)}`}>
                              {event.type === "ActivityFailed" ? "Activity" : event.type}
                            </span>
                            <span className={`flex-1 font-mono truncate ${isFailed ? 'text-destructive' : 'text-foreground'}`}>
                              {event.name}
                              {event.activity && <span className={isFailed ? "text-destructive/70" : "text-muted-foreground"}> ({event.activity})</span>}
                            </span>
                            {event.attempt && (
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                isFailed
                                  ? 'bg-destructive/20 text-destructive border border-destructive/30'
                                  : 'bg-temporal-green/20 text-temporal-green border border-temporal-green/30'
                              }`}>
                                #{event.attempt}
                              </span>
                            )}
                            <span className="text-muted-foreground/60 font-mono text-[10px]">
                              {event.timestamp}
                            </span>
                          </motion.div>
                        );
                      } else {
                        // Group row
                        const allVisible = displayItem.eventIndices.every(idx => visibleSet.has(idx));
                        if (!allVisible) return null;

                        const lastEvent = allEvents[displayItem.eventIndices[displayItem.eventIndices.length - 1]];
                        const isExpanded = expandedGroups.has(displayIdx);
                        const isSelected = displayItem.eventIndices.includes(selectedEvent ?? -1);

                        return (
                          <div key={`group-${displayIdx}`}>
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              onClick={() => toggleGroup(displayIdx)}
                              className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all text-xs ${
                                isSelected
                                  ? 'bg-primary/10 border border-primary/30'
                                  : 'hover:bg-secondary/50 border border-transparent'
                              }`}
                            >
                              <span className="w-5 h-5 flex items-center justify-center rounded bg-secondary text-muted-foreground font-mono text-[10px]">
                                {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded text-[10px] border ${getEventColor("WorkflowTask")}`}>
                                WorkflowTask
                              </span>
                              <span className="flex-1 font-mono text-foreground truncate">
                                {displayItem.label}
                              </span>
                              <span className="text-muted-foreground/60 font-mono text-[10px]">
                                {lastEvent.timestamp}
                              </span>
                            </motion.div>

                            <AnimatePresence>
                              {isExpanded && displayItem.eventIndices.map(eventIdx => {
                                const event = allEvents[eventIdx];
                                const isEvSelected = selectedEvent === eventIdx;

                                return (
                                  <motion.div
                                    key={event.id}
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    onClick={() => setSelectedEvent(eventIdx)}
                                    className={`flex items-center gap-2 p-2 pl-8 rounded-lg cursor-pointer transition-all text-xs ${
                                      isEvSelected
                                        ? 'bg-primary/10 border border-primary/30'
                                        : 'hover:bg-secondary/50 border border-transparent'
                                    }`}
                                  >
                                    <span className="w-5 h-5 flex items-center justify-center rounded bg-secondary text-muted-foreground font-mono text-[10px]">
                                      {event.id}
                                    </span>
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] border ${getEventColor(event.type)}`}>
                                      {event.type}
                                    </span>
                                    <span className="flex-1 font-mono text-foreground truncate">
                                      {event.name}
                                    </span>
                                    <span className="text-muted-foreground/60 font-mono text-[10px]">
                                      {event.timestamp}
                                    </span>
                                  </motion.div>
                                );
                              })}
                            </AnimatePresence>
                          </div>
                        );
                      }
                    })}
                  </AnimatePresence>
                )}
              </div>

              {/* Backoff info */}
              <AnimatePresence>
                {retryPaused && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-3 border-t border-slide-border bg-slide-bg/50"
                  >
                    {backoffCountdown > 0 ? (
                      <>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-temporal-orange font-medium">
                            Backoff: waiting {backoffSeconds}s before retry
                          </span>
                          <span className="text-xs text-muted-foreground font-mono">
                            {backoffCountdown.toFixed(1)}s
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                          <motion.div
                            className="h-full bg-temporal-orange rounded-full"
                            initial={{ width: "100%" }}
                            animate={{ width: "0%" }}
                            transition={{ duration: backoffSeconds, ease: "linear" }}
                          />
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-temporal-orange font-medium">
                          Temporal waits {backoffSeconds}s before retry (exponential backoff)
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Press Step or Play to continue
                        </span>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

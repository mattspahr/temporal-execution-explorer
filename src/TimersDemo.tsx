import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipForward, RotateCcw, CheckCircle2, ChevronRight, ChevronDown, Server, ArrowRight } from "lucide-react";
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

// --- SDK definitions with sleep/timer code ---

const sdkDefinitions: Record<SdkKey, SdkDefinition> = {
  typescript: {
    label: "TypeScript",
    filename: "checkout-workflow.ts",
    codeLines: [
      { line: "import { proxyActivities, sleep } from '@temporalio/workflow';", type: "import" },
      { line: "", type: "empty" },
      { line: "const { chargeCard, reserveInventory, shipOrder } = proxyActivities<Activities>({", type: "const" },
      { line: "  startToCloseTimeout: '30 seconds',", type: "config" },
      { line: "});", type: "const" },
      { line: "", type: "empty" },
      { line: "export async function CheckoutWorkflow(orderId: string) {", type: "function" },
      { line: "  const payment = await chargeCard(orderId);", type: "await", activity: "chargeCard" },
      { line: "  // Fraud review hold — durable timer, no compute used", type: "comment" },
      { line: "  await sleep('24 hours');", type: "await", activity: "timer" },
      { line: "", type: "empty" },
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
      { line: '  "time"', type: "import" },
      { line: '  "go.temporal.io/sdk/workflow"', type: "import" },
      { line: ")", type: "import" },
      { line: "", type: "empty" },
      { line: "func CheckoutWorkflow(ctx workflow.Context, orderID string) error {", type: "function" },
      { line: "  opts := workflow.ActivityOptions{", type: "const" },
      { line: "    StartToCloseTimeout: 30 * time.Second,", type: "config" },
      { line: "  }", type: "const" },
      { line: "  ctx = workflow.WithActivityOptions(ctx, opts)", type: "const" },
      { line: "", type: "empty" },
      { line: "  var payment PaymentResult", type: "const" },
      { line: "  err := workflow.ExecuteActivity(ctx, ChargeCard, orderID).Get(ctx, &payment)", type: "await", activity: "chargeCard" },
      { line: "  if err != nil { return err }", type: "keyword" },
      { line: "", type: "empty" },
      { line: "  // Fraud review hold — durable timer, no compute used", type: "comment" },
      { line: "  err = workflow.Sleep(ctx, 24*time.Hour)", type: "await", activity: "timer" },
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
      { line: "", type: "empty" },
      { line: "@workflow.defn", type: "decorator" },
      { line: "class CheckoutWorkflow:", type: "function" },
      { line: "", type: "empty" },
      { line: "  @workflow.run", type: "decorator" },
      { line: "  async def run(self, order_id: str) -> dict:", type: "function" },
      { line: "    payment = await workflow.execute_activity(", type: "await", activity: "chargeCard" },
      { line: "      charge_card, order_id,", type: "config" },
      { line: "      start_to_close_timeout=timedelta(seconds=30),", type: "config" },
      { line: "    )", type: "const" },
      { line: "", type: "empty" },
      { line: "    # Fraud review hold — durable timer, no compute used", type: "comment" },
      { line: "    await workflow.sleep(timedelta(hours=24))", type: "await", activity: "timer" },
      { line: "", type: "empty" },
      { line: "    await workflow.execute_activity(", type: "await", activity: "reserveInventory" },
      { line: "      reserve_inventory, order_id,", type: "config" },
      { line: "      start_to_close_timeout=timedelta(seconds=30),", type: "config" },
      { line: "    )", type: "const" },
      { line: "", type: "empty" },
      { line: "    await workflow.execute_activity(", type: "await", activity: "shipOrder" },
      { line: "      ship_order, order_id,", type: "config" },
      { line: "      start_to_close_timeout=timedelta(seconds=30),", type: "config" },
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
      { line: "import io.temporal.workflow.Workflow;", type: "import" },
      { line: "import java.time.Duration;", type: "import" },
      { line: "", type: "empty" },
      { line: "public class CheckoutWorkflowImpl implements CheckoutWorkflow {", type: "function" },
      { line: "", type: "empty" },
      { line: "  private final Activities activities = Workflow.newActivityStub(", type: "const" },
      { line: "    Activities.class,", type: "config" },
      { line: "    ActivityOptions.newBuilder()", type: "config" },
      { line: "      .setStartToCloseTimeout(Duration.ofSeconds(30))", type: "config" },
      { line: "      .build());", type: "config" },
      { line: "", type: "empty" },
      { line: "  @Override", type: "decorator" },
      { line: "  public CheckoutResult run(String orderId) {", type: "function" },
      { line: "    PaymentResult payment = activities.chargeCard(orderId);", type: "await", activity: "chargeCard" },
      { line: "    // Fraud review hold — durable timer, no compute used", type: "comment" },
      { line: "    Workflow.sleep(Duration.ofHours(24));", type: "await", activity: "timer" },
      { line: "", type: "empty" },
      { line: "    activities.reserveInventory(orderId);", type: "await", activity: "reserveInventory" },
      { line: "    activities.shipOrder(orderId);", type: "await", activity: "shipOrder" },
      { line: '    return new CheckoutResult("COMPLETED", payment.getAuthId());', type: "return" },
      { line: "  }", type: "function" },
      { line: "}", type: "function" },
    ],
  },
};

// --- Event history for timers scenario ---

const allEvents: EventItem[] = [
  { id: 1, name: "WorkflowExecutionStarted", type: "Workflow", timestamp: "00:00:00.000" },
  { id: 2, name: "WorkflowTaskScheduled", type: "WorkflowTask", timestamp: "00:00:00.001" },
  { id: 3, name: "WorkflowTaskStarted", type: "WorkflowTask", timestamp: "00:00:00.012" },
  { id: 4, name: "WorkflowTaskCompleted", type: "WorkflowTask", timestamp: "00:00:00.014" },
  { id: 5, name: "ActivityTaskScheduled", activity: "chargeCard", type: "Activity", timestamp: "00:00:00.015" },
  { id: 6, name: "ActivityTaskStarted", activity: "chargeCard", type: "Activity", timestamp: "00:00:00.045" },
  { id: 7, name: "ActivityTaskCompleted", activity: "chargeCard", type: "Activity", timestamp: "00:00:00.892" },
  { id: 8, name: "WorkflowTaskScheduled", type: "WorkflowTask", timestamp: "00:00:00.893" },
  { id: 9, name: "WorkflowTaskStarted", type: "WorkflowTask", timestamp: "00:00:00.901" },
  { id: 10, name: "WorkflowTaskCompleted", type: "WorkflowTask", timestamp: "00:00:00.904" },
  { id: 11, name: "TimerStarted", activity: "timer", type: "Timer", timestamp: "00:00:00.905" },
  // ═══ TIMER PAUSE — fast-forward animation plays before TimerFired ═══
  { id: 12, name: "TimerFired", activity: "timer", type: "Timer", timestamp: "24:00:00.905" },
  { id: 13, name: "WorkflowTaskScheduled", type: "WorkflowTask", timestamp: "24:00:00.906" },
  { id: 14, name: "WorkflowTaskStarted", type: "WorkflowTask", timestamp: "24:00:00.914" },
  { id: 15, name: "WorkflowTaskCompleted", type: "WorkflowTask", timestamp: "24:00:00.916" },
  { id: 16, name: "ActivityTaskScheduled", activity: "reserveInventory", type: "Activity", timestamp: "24:00:00.917" },
  { id: 17, name: "ActivityTaskStarted", activity: "reserveInventory", type: "Activity", timestamp: "24:00:00.950" },
  { id: 18, name: "ActivityTaskCompleted", activity: "reserveInventory", type: "Activity", timestamp: "24:00:01.170" },
  { id: 19, name: "WorkflowTaskScheduled", type: "WorkflowTask", timestamp: "24:00:01.171" },
  { id: 20, name: "WorkflowTaskStarted", type: "WorkflowTask", timestamp: "24:00:01.179" },
  { id: 21, name: "WorkflowTaskCompleted", type: "WorkflowTask", timestamp: "24:00:01.181" },
  { id: 22, name: "ActivityTaskScheduled", activity: "shipOrder", type: "Activity", timestamp: "24:00:01.182" },
  { id: 23, name: "ActivityTaskStarted", activity: "shipOrder", type: "Activity", timestamp: "24:00:01.210" },
  { id: 24, name: "ActivityTaskCompleted", activity: "shipOrder", type: "Activity", timestamp: "24:00:02.460" },
  { id: 25, name: "WorkflowTaskScheduled", type: "WorkflowTask", timestamp: "24:00:02.461" },
  { id: 26, name: "WorkflowTaskStarted", type: "WorkflowTask", timestamp: "24:00:02.470" },
  { id: 27, name: "WorkflowTaskCompleted", type: "WorkflowTask", timestamp: "24:00:02.472" },
  { id: 28, name: "WorkflowExecutionCompleted", type: "Workflow", timestamp: "24:00:02.473" },
];

const displayItems = buildDisplayItems(allEvents);

// Timer pause index: the display item containing TimerFired (pause BEFORE showing it)
const TIMER_PAUSE_INDEX = displayItems.findIndex((item) => {
  if (item.kind === 'single') {
    const ev = allEvents[item.eventIndex];
    return ev.name === "TimerFired";
  }
  return false;
});

const FAST_FORWARD_DURATION_MS = 4000;
const TOTAL_TIMER_SECONDS = 86400; // 24 hours

const formatTime = (totalSeconds: number): string => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

// --- Component ---

export const TimersDemoSlide = () => {
  const { markVisited, markCompleted } = useStepper();
  const [activeSDK, setActiveSDK] = useState<SdkKey>("typescript");
  const [visibleEvents, setVisibleEvents] = useState<number[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());
  const [displayItemCursor, setDisplayItemCursor] = useState(0);

  // Timer-specific state
  const [waitingForTimer, setWaitingForTimer] = useState(false);
  const [isFastForwarding, setIsFastForwarding] = useState(false);
  const [timerFired, setTimerFired] = useState(false);
  const [clockSeconds, setClockSeconds] = useState(0);
  const [narrativeStep, setNarrativeStep] = useState<string | null>(null);
  const narrativeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const eventsScrollRef = useRef<HTMLDivElement>(null);

  const hasAutoPlayed = useRef(false);
  const wasPlayingRef = useRef(false);
  const fastForwardStartRef = useRef<number>(0);
  const fastForwardIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeCodeLines = sdkDefinitions[activeSDK].codeLines;
  const timerLineIndex = activeCodeLines.findIndex(item => item.activity === "timer");

  const reset = useCallback(() => {
    setVisibleEvents([]);
    setSelectedEvent(null);
    setIsPlaying(false);
    setCompleted(false);
    setExpandedGroups(new Set());
    setDisplayItemCursor(0);
    setWaitingForTimer(false);
    setIsFastForwarding(false);
    setTimerFired(false);
    setClockSeconds(0);
    setNarrativeStep(null);
    if (narrativeTimerRef.current) clearTimeout(narrativeTimerRef.current);
    hasAutoPlayed.current = false;
    wasPlayingRef.current = false;
    if (fastForwardIntervalRef.current) {
      clearInterval(fastForwardIntervalRef.current);
      fastForwardIntervalRef.current = null;
    }
  }, []);

  const finishFastForward = useCallback(() => {
    if (fastForwardIntervalRef.current) {
      clearInterval(fastForwardIntervalRef.current);
      fastForwardIntervalRef.current = null;
    }
    setClockSeconds(TOTAL_TIMER_SECONDS);
    setIsFastForwarding(false);
    setWaitingForTimer(false);
    setTimerFired(true);

    // Add the TimerFired event
    const item = displayItems[TIMER_PAUSE_INDEX];
    if (item.kind === 'single') {
      setVisibleEvents(prev => [...prev, item.eventIndex]);
      setSelectedEvent(item.eventIndex);
    }
    setDisplayItemCursor(TIMER_PAUSE_INDEX + 1);

    // Resume if was auto-playing
    if (wasPlayingRef.current) {
      setTimeout(() => setIsPlaying(true), 1500);
    }
  }, []);

  const startFastForward = useCallback(() => {
    setIsFastForwarding(true);
    setClockSeconds(0);
    fastForwardStartRef.current = Date.now();

    fastForwardIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - fastForwardStartRef.current;
      const progress = Math.min(elapsed / FAST_FORWARD_DURATION_MS, 1);
      const currentSeconds = Math.floor(progress * TOTAL_TIMER_SECONDS);
      setClockSeconds(currentSeconds);

      if (progress >= 1) {
        finishFastForward();
      }
    }, 50);
  }, [finishFastForward]);

  const addNextEvent = useCallback((stepMode = false) => {
    const nextDisplayIdx = displayItemCursor;

    // Pause BEFORE showing TimerFired
    if (nextDisplayIdx === TIMER_PAUSE_INDEX && !timerFired) {
      if (!waitingForTimer) {
        wasPlayingRef.current = !stepMode;
        setWaitingForTimer(true);
        setIsPlaying(false);
        // Start fast-forward after 1.5s delay
        setTimeout(() => {
          startFastForward();
        }, 1500);
      }
      return false;
    }

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

      if (nextDisplayIdx === displayItems.length - 1) {
        setCompleted(true);
        setIsPlaying(false);
        return false;
      }
      return true;
    }
    return false;
  }, [displayItemCursor, timerFired, waitingForTimer, startFastForward]);

  useEffect(() => { markVisited("timers"); }, [markVisited]);
  useEffect(() => { if (completed) markCompleted("timers"); }, [completed, markCompleted]);

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

  // Cleanup fast-forward interval on unmount
  useEffect(() => {
    return () => {
      if (fastForwardIntervalRef.current) {
        clearInterval(fastForwardIntervalRef.current);
      }
    };
  }, []);

  // Narrative pill helper
  const showNarrative = useCallback((step: string, duration = 5000) => {
    if (narrativeTimerRef.current) clearTimeout(narrativeTimerRef.current);
    setNarrativeStep(step);
    narrativeTimerRef.current = setTimeout(() => setNarrativeStep(null), duration);
  }, []);

  // Beat 1: Durable timer set
  useEffect(() => {
    if (waitingForTimer && !isFastForwarding) {
      showNarrative("timer-set", 6000);
    }
  }, [waitingForTimer, isFastForwarding, showNarrative]);

  // Beat 2: Timer fires
  useEffect(() => {
    if (timerFired) {
      showNarrative("timer-fires");
    }
  }, [timerFired, showNarrative]);

  // Auto-scroll event history
  useEffect(() => {
    const el = eventsScrollRef.current;
    if (el) {
      requestAnimationFrame(() => {
        el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      });
    }
  }, [visibleEvents]);

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

  // Worker status
  const getWorkerStatus = () => {
    if (completed) return "completed";
    if (waitingForTimer) return "idle";
    if (visibleEvents.length > 0) return "running";
    return "idle";
  };
  const workerStatus = getWorkerStatus();

  const clockProgress = clockSeconds / TOTAL_TIMER_SECONDS;

  return (
    <div className="slide-content">
      <div className="w-full max-w-7xl flex flex-col h-full">
        {/* Header */}
        <div className="text-center mb-3 lg:mb-6">
          <h2 className="text-xl sm:text-2xl lg:text-4xl font-semibold tracking-tight text-foreground mb-1 lg:mb-2">
            What if your workflow needs to <span className="gradient-text">wait 24 hours</span>?
          </h2>
          <p className="text-muted-foreground text-sm lg:text-base max-w-2xl mx-auto">
            Temporal workflows can sleep for hours or days — durably. No compute consumed, timers survive server restarts.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mb-3 lg:mb-4 flex items-center gap-2 lg:gap-3 overflow-x-auto scrollbar-hide">
          <motion.button
            onClick={() => {
              if (isPlaying) {
                setIsPlaying(false);
              } else {
                setIsPlaying(true);
              }
            }}
            disabled={completed || waitingForTimer}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="shrink-0 flex items-center gap-1.5 px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg bg-primary text-primary-foreground text-xs lg:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> : <Play className="w-3.5 h-3.5 lg:w-4 lg:h-4" />}
            {isPlaying ? "Pause" : "Play"}
          </motion.button>

          <motion.button
            onClick={() => {
              addNextEvent(true);
            }}
            disabled={isPlaying || completed || waitingForTimer}
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
              workerStatus === "running" || workerStatus === "completed"
                ? 'bg-temporal-green/10 border-temporal-green/30'
                : 'bg-secondary/50 border-slide-border'
            }`}
          >
            <Server className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-muted-foreground" />
            <span className="text-xs lg:text-sm font-medium text-foreground">Worker 1</span>
            {workerStatus === "completed" ? (
              <span className="flex items-center gap-1 lg:gap-1.5 text-[10px] lg:text-xs font-semibold px-1.5 lg:px-2 py-0.5 rounded-full bg-temporal-green/20 text-temporal-green border border-temporal-green/30">
                <CheckCircle2 className="w-3 h-3" />
                COMPLETED
              </span>
            ) : workerStatus === "running" ? (
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

          {/* Durable wait badge */}
          <AnimatePresence>
            {waitingForTimer && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-temporal-amber/10 border border-temporal-amber/30"
              >
                <motion.span
                  className="w-1.5 h-1.5 rounded-full bg-temporal-amber"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                />
                <span className="text-xs font-semibold text-temporal-amber">
                  Durable wait — no compute used
                </span>
                <span className="text-[10px] text-temporal-amber/70 font-mono tabular-nums">
                  {formatTime(clockSeconds)}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Two Column Layout — stacks on mobile */}
        <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
          {/* Left Column - Code */}
          <motion.div animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="w-full lg:w-[55%] flex flex-col min-h-[250px] sm:min-h-[300px] lg:min-h-0">
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
                    const isHighlighted = item.activity && item.activity === highlightedActivity && !waitingForTimer;
                    const isTimerWaitLine = waitingForTimer && idx === timerLineIndex;

                    return (
                      <motion.div
                        key={idx}
                        className={`px-2 -mx-2 rounded relative transition-all duration-200 border-l-[3px] ${
                          isTimerWaitLine
                            ? 'bg-temporal-amber/30 border-temporal-amber shadow-[inset_0_0_20px_rgba(245,158,11,0.15)]'
                            : isHighlighted
                              ? 'bg-primary/40 border-primary shadow-[inset_0_0_20px_rgba(139,92,246,0.15)]'
                              : 'border-transparent'
                        }`}
                        animate={
                          isTimerWaitLine
                            ? { backgroundColor: ["hsl(45 93% 47% / 0.2)", "hsl(45 93% 47% / 0.4)", "hsl(45 93% 47% / 0.2)"] }
                            : isHighlighted
                              ? { backgroundColor: ["hsl(263 70% 58% / 0.25)", "hsl(263 70% 58% / 0.45)", "hsl(263 70% 58% / 0.25)"] }
                              : { backgroundColor: "transparent" }
                        }
                        transition={
                          isTimerWaitLine
                            ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
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
          </motion.div>

          {/* Center Divider — hidden on mobile */}
          <div className="hidden lg:block w-px bg-slide-border relative">
            {/* Activity arrow connector */}
            <AnimatePresence>
              {highlightedActivity && isPlaying && (
                <motion.div
                  key={highlightedActivity}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center gap-1"
                >
                  <motion.div
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-temporal-green/20 border border-temporal-green/40 shadow-[0_0_12px_rgba(34,197,94,0.3)]"
                    animate={{ x: [0, 3, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-temporal-green" />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Narrative pills */}
            <AnimatePresence mode="wait">
              {narrativeStep && (
                <motion.div
                  key={narrativeStep}
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="absolute top-[62%] left-1/2 -translate-x-1/2 z-20 w-56 pointer-events-none"
                >
                  <div className={`px-3 py-2.5 rounded-xl border text-center text-xs leading-relaxed shadow-lg backdrop-blur-sm ${
                    narrativeStep === "timer-set"
                      ? "bg-temporal-amber/10 border-temporal-amber/30 text-temporal-amber"
                      : "bg-temporal-green/10 border-temporal-green/30 text-temporal-green"
                  }`}>
                    {narrativeStep === "timer-set" && (
                      <span>Durable timer started — <strong>no compute used</strong> for 24 hours</span>
                    )}
                    {narrativeStep === "timer-fires" && (
                      <span>Timer fired — workflow <strong>wakes up automatically</strong></span>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile-only inline callouts — shown between columns on small screens */}
          <AnimatePresence mode="wait">
            {narrativeStep && (
              <motion.div
                key={`mobile-${narrativeStep}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className={`lg:hidden px-3 py-2.5 rounded-xl border text-center text-xs leading-relaxed ${
                  narrativeStep === "timer-set"
                    ? "bg-temporal-amber/10 border-temporal-amber/30 text-temporal-amber"
                    : "bg-temporal-green/10 border-temporal-green/30 text-temporal-green"
                }`}
              >
                {narrativeStep === "timer-set" && (
                  <span>Durable timer started — <strong>no compute used</strong> for 24 hours</span>
                )}
                {narrativeStep === "timer-fires" && (
                  <span>Timer fired — workflow <strong>wakes up automatically</strong></span>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Right Column - Events */}
          <motion.div animate={{ opacity: waitingForTimer ? 0.4 : 1 }} transition={{ duration: 0.5 }} className="w-full lg:w-[45%] flex flex-col min-h-[200px] sm:min-h-[250px] lg:min-h-0">
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
              <div ref={eventsScrollRef} className="h-full overflow-auto p-2 pb-4 lg:p-3 lg:pb-6 space-y-1 lg:space-y-1.5">
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
                        const isTimer = event.type === "Timer";

                        return (
                          <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{
                              opacity: 1,
                              y: 0,
                              ...(isTimer ? {
                                backgroundColor: ["hsl(45 93% 47% / 0.1)", "hsl(45 93% 47% / 0.25)", "hsl(45 93% 47% / 0.1)"]
                              } : {})
                            }}
                            transition={isTimer ? { backgroundColor: { duration: 1, repeat: 2, ease: "easeInOut" } } : undefined}
                            onClick={() => setSelectedEvent(eventIdx)}
                            className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all text-xs ${
                              isSelected
                                ? isTimer
                                  ? 'bg-temporal-amber/15 border border-temporal-amber/40'
                                  : 'bg-primary/10 border border-primary/30'
                                : isTimer
                                  ? 'bg-temporal-amber/5 border border-temporal-amber/20'
                                  : 'hover:bg-secondary/50 border border-transparent'
                            }`}
                          >
                            <span className={`w-5 h-5 flex items-center justify-center rounded font-mono text-[10px] ${
                              isTimer ? 'bg-temporal-amber/20 text-temporal-amber' : 'bg-secondary text-muted-foreground'
                            }`}>
                              {event.id}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] border ${getEventColor(event.type)}`}>
                              {event.type}
                            </span>
                            <span className={`flex-1 font-mono truncate ${isTimer ? 'text-temporal-amber' : 'text-foreground'}`}>
                              {event.name}
                            </span>
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

              {/* Timer fast-forward footer */}
              <AnimatePresence>
                {waitingForTimer && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-3 border-t border-slide-border bg-slide-bg/50"
                  >
                    {isFastForwarding ? (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-lg text-temporal-amber tabular-nums">
                            {formatTime(clockSeconds)}
                          </span>
                          <button
                            onClick={finishFastForward}
                            className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                          >
                            Skip
                          </button>
                        </div>
                        <div className="relative h-1.5 rounded-full bg-secondary overflow-hidden">
                          <motion.div
                            className="absolute inset-y-0 left-0 rounded-full bg-temporal-amber"
                            style={{ width: `${clockProgress * 100}%` }}
                          />
                        </div>
                        <div className="flex justify-end mt-1">
                          <span className="text-[10px] text-muted-foreground/60 font-mono">24:00:00</span>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs text-temporal-amber font-medium">
                          Durable timer started — workflow sleeping for 24 hours
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Fast-forwarding in a moment...
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
};

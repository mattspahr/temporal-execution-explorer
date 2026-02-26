import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipForward, RotateCcw, CheckCircle2, ChevronRight, ChevronDown, Server, Send } from "lucide-react";
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

// --- SDK definitions with signal/condition code ---

const sdkDefinitions: Record<SdkKey, SdkDefinition> = {
  typescript: {
    label: "TypeScript",
    filename: "checkout-workflow.ts",
    codeLines: [
      { line: "import { proxyActivities, defineSignal, setHandler, condition } from '@temporalio/workflow';", type: "import" },
      { line: "", type: "empty" },
      { line: "const { chargeCard, reserveInventory, shipOrder } = proxyActivities<Activities>({", type: "const" },
      { line: "  startToCloseTimeout: '30 seconds',", type: "config" },
      { line: "});", type: "const" },
      { line: "", type: "empty" },
      { line: "const approvalSignal = defineSignal('approvalSignal');", type: "const" },
      { line: "", type: "empty" },
      { line: "export async function CheckoutWorkflow(orderId: string) {", type: "function" },
      { line: "  let approved = false;", type: "const" },
      { line: "  setHandler(approvalSignal, () => { approved = true; });", type: "const" },
      { line: "", type: "empty" },
      { line: "  const payment = await chargeCard(orderId);", type: "await", activity: "chargeCard" },
      { line: "  await condition(() => approved);", type: "await", activity: "signal" },
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
      { line: "  // Wait for approval signal", type: "comment" },
      { line: "  var approved bool", type: "const" },
      { line: "  signalCh := workflow.GetSignalChannel(ctx, \"ApprovalSignal\")", type: "const" },
      { line: "  signalCh.Receive(ctx, &approved)", type: "await", activity: "signal" },
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
      { line: "  approved = False", type: "const" },
      { line: "", type: "empty" },
      { line: "  @workflow.signal", type: "decorator" },
      { line: "  def approval_signal(self) -> None:", type: "function" },
      { line: "    self.approved = True", type: "const" },
      { line: "", type: "empty" },
      { line: "  @workflow.run", type: "decorator" },
      { line: "  async def run(self, order_id: str) -> dict:", type: "function" },
      { line: "    payment = await workflow.execute_activity(", type: "await", activity: "chargeCard" },
      { line: "      charge_card, order_id,", type: "config" },
      { line: "      start_to_close_timeout=timedelta(seconds=30),", type: "config" },
      { line: "    )", type: "const" },
      { line: "", type: "empty" },
      { line: "    await workflow.wait_condition(lambda: self.approved)", type: "await", activity: "signal" },
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
      { line: "  private boolean approved = false;", type: "const" },
      { line: "", type: "empty" },
      { line: "  private final Activities activities = Workflow.newActivityStub(", type: "const" },
      { line: "    Activities.class,", type: "config" },
      { line: "    ActivityOptions.newBuilder()", type: "config" },
      { line: "      .setStartToCloseTimeout(Duration.ofSeconds(30))", type: "config" },
      { line: "      .build());", type: "config" },
      { line: "", type: "empty" },
      { line: "  @SignalMethod", type: "decorator" },
      { line: "  public void approvalSignal() { this.approved = true; }", type: "function" },
      { line: "", type: "empty" },
      { line: "  @Override", type: "decorator" },
      { line: "  public CheckoutResult run(String orderId) {", type: "function" },
      { line: "    PaymentResult payment = activities.chargeCard(orderId);", type: "await", activity: "chargeCard" },
      { line: "    Workflow.await(() -> this.approved);", type: "await", activity: "signal" },
      { line: "", type: "empty" },
      { line: "    activities.reserveInventory(orderId);", type: "await", activity: "reserveInventory" },
      { line: "    activities.shipOrder(orderId);", type: "await", activity: "shipOrder" },
      { line: '    return new CheckoutResult("COMPLETED", payment.getAuthId());', type: "return" },
      { line: "  }", type: "function" },
      { line: "}", type: "function" },
    ],
  },
};

// --- Event history for signals scenario ---

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
  // ═══ SIGNAL PAUSE — user must click "Send Approval Signal" ═══
  { id: 11, name: "WorkflowExecutionSignaled", activity: "signal", type: "Signal", timestamp: "00:03:24.100" },
  { id: 12, name: "WorkflowTaskScheduled", type: "WorkflowTask", timestamp: "00:03:24.101" },
  { id: 13, name: "WorkflowTaskStarted", type: "WorkflowTask", timestamp: "00:03:24.110" },
  { id: 14, name: "WorkflowTaskCompleted", type: "WorkflowTask", timestamp: "00:03:24.112" },
  { id: 15, name: "ActivityTaskScheduled", activity: "reserveInventory", type: "Activity", timestamp: "00:03:24.113" },
  { id: 16, name: "ActivityTaskStarted", activity: "reserveInventory", type: "Activity", timestamp: "00:03:24.140" },
  { id: 17, name: "ActivityTaskCompleted", activity: "reserveInventory", type: "Activity", timestamp: "00:03:24.370" },
  { id: 18, name: "WorkflowTaskScheduled", type: "WorkflowTask", timestamp: "00:03:24.371" },
  { id: 19, name: "WorkflowTaskStarted", type: "WorkflowTask", timestamp: "00:03:24.379" },
  { id: 20, name: "WorkflowTaskCompleted", type: "WorkflowTask", timestamp: "00:03:24.381" },
  { id: 21, name: "ActivityTaskScheduled", activity: "shipOrder", type: "Activity", timestamp: "00:03:24.382" },
  { id: 22, name: "ActivityTaskStarted", activity: "shipOrder", type: "Activity", timestamp: "00:03:24.410" },
  { id: 23, name: "ActivityTaskCompleted", activity: "shipOrder", type: "Activity", timestamp: "00:03:25.660" },
  { id: 24, name: "WorkflowTaskScheduled", type: "WorkflowTask", timestamp: "00:03:25.661" },
  { id: 25, name: "WorkflowTaskStarted", type: "WorkflowTask", timestamp: "00:03:25.670" },
  { id: 26, name: "WorkflowTaskCompleted", type: "WorkflowTask", timestamp: "00:03:25.672" },
  { id: 27, name: "WorkflowExecutionCompleted", type: "Workflow", timestamp: "00:03:25.673" },
];

const displayItems = buildDisplayItems(allEvents);

// Signal pause index: the display item containing the Signal event
const SIGNAL_PAUSE_INDEX = displayItems.findIndex((item) => {
  if (item.kind === 'single') {
    const ev = allEvents[item.eventIndex];
    return ev.type === "Signal";
  }
  return false;
});

// --- Component ---

export const SignalsDemoSlide = () => {
  const { markVisited, markCompleted } = useStepper();
  const [activeSDK, setActiveSDK] = useState<SdkKey>("typescript");
  const [visibleEvents, setVisibleEvents] = useState<number[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());
  const [displayItemCursor, setDisplayItemCursor] = useState(0);

  // Signal-specific state
  const [waitingForSignal, setWaitingForSignal] = useState(false);
  const [signalReceived, setSignalReceived] = useState(false);
  const [showWaitingCallout, setShowWaitingCallout] = useState(false);
  const [showReceivedCallout, setShowReceivedCallout] = useState(false);

  const hasAutoPlayed = useRef(false);
  const wasPlayingRef = useRef(false);

  const activeCodeLines = sdkDefinitions[activeSDK].codeLines;
  const signalLineIndex = activeCodeLines.findIndex(item => item.activity === "signal");

  const reset = useCallback(() => {
    setVisibleEvents([]);
    setSelectedEvent(null);
    setIsPlaying(false);
    setCompleted(false);
    setExpandedGroups(new Set());
    setDisplayItemCursor(0);
    setWaitingForSignal(false);
    setSignalReceived(false);
    setShowWaitingCallout(false);
    setShowReceivedCallout(false);
    hasAutoPlayed.current = false;
    wasPlayingRef.current = false;
  }, []);

  const addNextEvent = useCallback((stepMode = false) => {
    const nextDisplayIdx = displayItemCursor;

    // Pause BEFORE showing the signal event
    if (nextDisplayIdx === SIGNAL_PAUSE_INDEX && !signalReceived) {
      if (!waitingForSignal) {
        wasPlayingRef.current = !stepMode;
        setWaitingForSignal(true);
        setShowWaitingCallout(true);
        setIsPlaying(false);
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
  }, [displayItemCursor, signalReceived, waitingForSignal]);

  const handleSendSignal = useCallback(() => {
    if (!waitingForSignal) return;

    setWaitingForSignal(false);
    setSignalReceived(true);
    setShowWaitingCallout(false);
    setShowReceivedCallout(true);

    // Add the signal event
    const item = displayItems[SIGNAL_PAUSE_INDEX];
    if (item.kind === 'single') {
      setVisibleEvents(prev => [...prev, item.eventIndex]);
      setSelectedEvent(item.eventIndex);
    }
    setDisplayItemCursor(SIGNAL_PAUSE_INDEX + 1);

    setTimeout(() => setShowReceivedCallout(false), 2000);

    // Resume if was auto-playing
    if (wasPlayingRef.current) {
      setTimeout(() => setIsPlaying(true), 1500);
    }
  }, [waitingForSignal]);

  useEffect(() => { markVisited("signals"); }, [markVisited]);
  useEffect(() => { if (completed) markCompleted("signals"); }, [completed, markCompleted]);

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

  // Worker status — worker goes IDLE while waiting for signal (no resources consumed)
  const getWorkerStatus = () => {
    if (completed) return "completed";
    if (waitingForSignal) return "idle";
    if (visibleEvents.length > 0) return "running";
    return "idle";
  };
  const workerStatus = getWorkerStatus();

  return (
    <div className="slide-content !px-8 !pt-6">
      <div className="w-full max-w-7xl flex flex-col h-full">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-2">
            What if your workflow needs <span className="gradient-text">human approval</span>?
          </h2>
          <p className="text-muted-foreground text-base max-w-2xl mx-auto">
            Temporal workflows can pause for external signals — minutes, hours, or days — without consuming resources.
          </p>
        </div>

        {/* Worker Status Strip */}
        <span className="text-[10px] text-muted-foreground/50 font-mono tracking-wider mb-1 block">Your infrastructure</span>
        <div className="flex items-center gap-3 mb-4">
          <motion.div
            className={`flex items-center gap-2.5 px-4 py-2 rounded-lg border transition-colors duration-400 ${
              workerStatus === "running" || workerStatus === "completed"
                ? 'bg-temporal-green/10 border-temporal-green/30'
                : 'bg-secondary/50 border-slide-border'
            }`}
          >
            <Server className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Worker 1</span>
            {workerStatus === "completed" ? (
              <span className="flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-temporal-green/20 text-temporal-green border border-temporal-green/30">
                <CheckCircle2 className="w-3 h-3" />
                COMPLETED
              </span>
            ) : workerStatus === "running" ? (
              <span className="flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-temporal-green/20 text-temporal-green border border-temporal-green/30">
                <motion.span
                  className="w-1.5 h-1.5 rounded-full bg-temporal-green"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                />
                RUNNING
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-slide-border">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                IDLE
              </span>
            )}
          </motion.div>

          {/* Waiting for signal badge — shown next to worker to emphasize it's Temporal holding state, not the worker */}
          <AnimatePresence>
            {waitingForSignal && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-temporal-pink/10 border border-temporal-pink/30"
              >
                <motion.span
                  className="w-1.5 h-1.5 rounded-full bg-temporal-pink"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                />
                <span className="text-xs font-semibold text-temporal-pink">
                  Durable wait — no compute used
                </span>
                <span className="text-[10px] text-temporal-pink/70">
                  (workflow paused on signal)
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Two Column Layout */}
        <div className="flex gap-4 flex-1 min-h-0">
          {/* Left Column - Code (55%) */}
          <div className="w-[55%] flex flex-col">
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
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
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
                <span className="ml-4 text-xs text-muted-foreground font-mono">{sdkDefinitions[activeSDK].filename}</span>
              </div>

              <pre className="mt-8 text-sm leading-relaxed">
                <code>
                  {activeCodeLines.map((item, idx) => {
                    const isHighlighted = item.activity && item.activity === highlightedActivity && !waitingForSignal;
                    const isSignalWaitLine = waitingForSignal && idx === signalLineIndex;

                    return (
                      <motion.div
                        key={idx}
                        className={`px-2 -mx-2 rounded relative transition-all duration-200 border-l-[3px] ${
                          isSignalWaitLine
                            ? 'bg-temporal-pink/30 border-temporal-pink shadow-[inset_0_0_20px_rgba(232,69,147,0.15)]'
                            : isHighlighted
                              ? 'bg-primary/40 border-primary shadow-[inset_0_0_20px_rgba(139,92,246,0.15)]'
                              : 'border-transparent'
                        }`}
                        animate={
                          isSignalWaitLine
                            ? { backgroundColor: ["hsl(330 78% 59% / 0.2)", "hsl(330 78% 59% / 0.4)", "hsl(330 78% 59% / 0.2)"] }
                            : isHighlighted
                              ? { backgroundColor: ["hsl(263 70% 58% / 0.25)", "hsl(263 70% 58% / 0.45)", "hsl(263 70% 58% / 0.25)"] }
                              : { backgroundColor: "transparent" }
                        }
                        transition={
                          isSignalWaitLine
                            ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
                            : isHighlighted
                              ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
                              : { duration: 0.2 }
                        }
                      >
                        <span className="text-muted-foreground/50 select-none inline-block w-6 text-right mr-4 text-xs">
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

          {/* Center Divider with Callouts */}
          <div className="w-px bg-slide-border relative">
            {/* Waiting Callout */}
            <AnimatePresence>
              {showWaitingCallout && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-64 p-4 rounded-xl bg-slide-surface border border-temporal-pink/30 shadow-xl"
                >
                  <h4 className="font-semibold text-temporal-pink mb-2 text-center text-sm">Waiting for Signal</h4>
                  <p className="text-xs text-muted-foreground text-center">
                    The workflow is paused on <code className="text-temporal-pink">condition()</code>, consuming no resources. It could wait minutes, hours, or days.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Received Callout */}
            <AnimatePresence>
              {showReceivedCallout && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-56 p-4 rounded-xl bg-slide-surface border border-temporal-green/30 shadow-xl"
                >
                  <div className="flex items-center gap-2 justify-center">
                    <CheckCircle2 className="w-5 h-5 text-temporal-green" />
                    <h4 className="font-semibold text-temporal-green text-sm">Signal received!</h4>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Approval granted. Workflow resumes execution.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column - Events (45%) */}
          <div className="w-[45%] flex flex-col">
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
              <div className="h-full overflow-auto p-3 space-y-1.5">
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
                        const isSignal = event.type === "Signal";

                        return (
                          <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{
                              opacity: 1,
                              y: 0,
                              ...(isSignal ? {
                                backgroundColor: ["hsl(330 78% 59% / 0.1)", "hsl(330 78% 59% / 0.25)", "hsl(330 78% 59% / 0.1)"]
                              } : {})
                            }}
                            transition={isSignal ? { backgroundColor: { duration: 1, repeat: 2, ease: "easeInOut" } } : undefined}
                            onClick={() => setSelectedEvent(eventIdx)}
                            className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all text-xs ${
                              isSelected
                                ? isSignal
                                  ? 'bg-temporal-pink/15 border border-temporal-pink/40'
                                  : 'bg-primary/10 border border-primary/30'
                                : isSignal
                                  ? 'bg-temporal-pink/5 border border-temporal-pink/20'
                                  : 'hover:bg-secondary/50 border border-transparent'
                            }`}
                          >
                            <span className={`w-5 h-5 flex items-center justify-center rounded font-mono text-[10px] ${
                              isSignal ? 'bg-temporal-pink/20 text-temporal-pink' : 'bg-secondary text-muted-foreground'
                            }`}>
                              {event.id}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] border ${getEventColor(event.type)}`}>
                              {event.type}
                            </span>
                            <span className={`flex-1 font-mono truncate ${isSignal ? 'text-temporal-pink' : 'text-foreground'}`}>
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

              {/* Signal waiting footer */}
              <AnimatePresence>
                {waitingForSignal && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-3 border-t border-slide-border bg-slide-bg/50"
                  >
                    <p className="text-xs text-temporal-pink font-medium">
                      Workflow blocked — waiting for approval signal
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Click "Send Approval Signal" to continue
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Control Bar */}
        <div className="mt-4 flex items-center justify-center gap-3">
          <motion.button
            onClick={() => {
              if (isPlaying) {
                setIsPlaying(false);
              } else {
                setIsPlaying(true);
              }
            }}
            disabled={completed || waitingForSignal}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? "Pause" : "Play"}
          </motion.button>

          <motion.button
            onClick={() => {
              addNextEvent(true);
            }}
            disabled={isPlaying || completed || waitingForSignal}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SkipForward className="w-4 h-4" />
            Step
          </motion.button>

          <div className="w-px h-6 bg-slide-border mx-2" />

          {/* Send Approval Signal Button */}
          <AnimatePresence>
            {waitingForSignal && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{
                  opacity: 1,
                  scale: [1, 1.05, 1],
                  boxShadow: [
                    "0 0 0px rgba(232,69,147,0)",
                    "0 0 12px rgba(232,69,147,0.4)",
                    "0 0 0px rgba(232,69,147,0)",
                  ],
                }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{
                  opacity: { duration: 0.2 },
                  scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
                  boxShadow: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
                }}
                onClick={handleSendSignal}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-temporal-pink/20 text-temporal-pink border border-temporal-pink/30 text-sm font-medium"
              >
                <Send className="w-4 h-4" />
                Send Approval Signal
              </motion.button>
            )}
          </AnimatePresence>

          {!waitingForSignal && <div className="w-px h-6 bg-slide-border mx-2" />}

          <motion.button
            onClick={reset}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </motion.button>
        </div>
      </div>
    </div>
  );
};

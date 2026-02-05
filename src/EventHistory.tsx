import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, SkipForward, RotateCcw, RefreshCw, AlertTriangle, CheckCircle2, ChevronRight, ChevronDown } from "lucide-react";

type SdkKey = "typescript" | "go" | "python" | "java";

interface CodeLine { line: string; type: string; activity?: string; }
interface SdkDefinition { label: string; filename: string; codeLines: CodeLine[]; }

const sdkDefinitions: Record<SdkKey, SdkDefinition> = {
  typescript: {
    label: "TypeScript",
    filename: "checkout-workflow.ts",
    codeLines: [
      { line: "import { proxyActivities } from '@temporalio/workflow';", type: "import" },
      { line: "", type: "empty" },
      { line: "const { chargeCard, reserveInventory, shipOrder } = proxyActivities<{", type: "const" },
      { line: "  chargeCard(orderId: string): Promise<{ authId: string }>;", type: "type" },
      { line: "  reserveInventory(orderId: string): Promise<void>;", type: "type" },
      { line: "  shipOrder(orderId: string): Promise<void>;", type: "type" },
      { line: "}>({", type: "const" },
      { line: "  startToCloseTimeout: '30 seconds',", type: "config" },
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
      { line: "# Activity stubs with 30s timeout", type: "comment" },
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
      { line: "    activities.reserveInventory(orderId);", type: "await", activity: "reserveInventory" },
      { line: "    activities.shipOrder(orderId);", type: "await", activity: "shipOrder" },
      { line: '    return new CheckoutResult("COMPLETED", payment.getAuthId());', type: "return" },
      { line: "  }", type: "function" },
      { line: "}", type: "function" },
    ],
  },
};

const sdkOrder: SdkKey[] = ["typescript", "go", "python", "java"];

interface EventItem {
  id: number;
  name: string;
  activity?: string;
  type: "Workflow" | "WorkflowTask" | "Activity";
  timestamp: string;
}

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
  { id: 11, name: "ActivityTaskScheduled", activity: "reserveInventory", type: "Activity", timestamp: "00:00:00.905" },
  { id: 12, name: "ActivityTaskStarted", activity: "reserveInventory", type: "Activity", timestamp: "00:00:00.932" },
  { id: 13, name: "ActivityTaskCompleted", activity: "reserveInventory", type: "Activity", timestamp: "00:00:01.156" },
  { id: 14, name: "WorkflowTaskScheduled", type: "WorkflowTask", timestamp: "00:00:01.157" },
  { id: 15, name: "WorkflowTaskStarted", type: "WorkflowTask", timestamp: "00:00:01.165" },
  { id: 16, name: "WorkflowTaskCompleted", type: "WorkflowTask", timestamp: "00:00:01.167" },
  { id: 17, name: "ActivityTaskScheduled", activity: "shipOrder", type: "Activity", timestamp: "00:00:01.168" },
  { id: 18, name: "ActivityTaskStarted", activity: "shipOrder", type: "Activity", timestamp: "00:00:01.201" },
  { id: 19, name: "ActivityTaskCompleted", activity: "shipOrder", type: "Activity", timestamp: "00:00:02.445" },
  { id: 20, name: "WorkflowTaskScheduled", type: "WorkflowTask", timestamp: "00:00:02.446" },
  { id: 21, name: "WorkflowTaskStarted", type: "WorkflowTask", timestamp: "00:00:02.447" },
  { id: 22, name: "WorkflowTaskCompleted", type: "WorkflowTask", timestamp: "00:00:02.448" },
  { id: 23, name: "WorkflowExecutionCompleted", type: "Workflow", timestamp: "00:00:02.449" },
];

// --- Display Items: group consecutive WorkflowTask events ---

type DisplayItem =
  | { kind: 'single'; eventIndex: number }
  | { kind: 'group'; eventIndices: number[]; label: string };

function buildDisplayItems(events: EventItem[]): DisplayItem[] {
  const items: DisplayItem[] = [];
  let i = 0;
  while (i < events.length) {
    if (events[i].type === "WorkflowTask") {
      const start = i;
      while (i < events.length && events[i].type === "WorkflowTask") {
        i++;
      }
      const indices = [];
      for (let j = start; j < i; j++) indices.push(j);
      const first = events[start].name.replace("WorkflowTask", "");
      const last = events[i - 1].name.replace("WorkflowTask", "");
      const label = first === last
        ? `Scheduled \u2192 ${last}`
        : `${first} \u2192 ${last}`;
      items.push({ kind: 'group', eventIndices: indices, label });
    } else {
      items.push({ kind: 'single', eventIndex: i });
      i++;
    }
  }
  return items;
}

const displayItems = buildDisplayItems(allEvents);

// Crash display-item index: after ActivityTaskCompleted for chargeCard (event index 6, which is display item 4)
// displayItems: [0]=WES, [1]=WFT group(1-3), [2]=ATS chargeCard, [3]=ATStarted chargeCard, [4]=ATCompleted chargeCard, [5]=WFT group(7-9), ...
// We want crash after the chargeCard ATCompleted. Let's find it:
const CRASH_DISPLAY_INDEX = displayItems.findIndex((item) => {
  if (item.kind === 'single') {
    const ev = allEvents[item.eventIndex];
    return ev.name === "ActivityTaskCompleted" && ev.activity === "chargeCard";
  }
  return false;
}) + 1; // crash happens when trying to add the NEXT item after chargeCard completed

const getEventColor = (type: EventItem["type"]) => {
  switch (type) {
    case "Workflow": return "bg-temporal-purple/20 text-temporal-purple border-temporal-purple/30";
    case "WorkflowTask": return "bg-temporal-blue/20 text-temporal-blue border-temporal-blue/30";
    case "Activity": return "bg-temporal-green/20 text-temporal-green border-temporal-green/30";
  }
};

const getHighlightedLine = (eventIndex: number): string | null => {
  const event = allEvents[eventIndex];
  if (!event) return null;
  return event.activity || null;
};

export const EventHistorySlide = () => {
  const [activeSDK, setActiveSDK] = useState<SdkKey>("typescript");
  const [visibleEvents, setVisibleEvents] = useState<number[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasCrashed, setHasCrashed] = useState(false);
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayIndex, setReplayIndex] = useState(0);
  const [showCallout, setShowCallout] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());
  const [displayItemCursor, setDisplayItemCursor] = useState(0);

  const hasAutoPlayed = useRef(false);
  const replayIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const replayChargeCardIndexRef = useRef(0);

  const activeCodeLines = sdkDefinitions[activeSDK].codeLines;
  const chargeCardLineIndex = activeCodeLines.findIndex(item => item.activity === "chargeCard");

  const crashMode = true; // always on

  const reset = useCallback(() => {
    if (replayIntervalRef.current) {
      clearInterval(replayIntervalRef.current);
      replayIntervalRef.current = null;
    }
    setVisibleEvents([]);
    setSelectedEvent(null);
    setIsPlaying(false);
    setHasCrashed(false);
    setIsReplaying(false);
    setReplayIndex(0);
    setShowCallout(false);
    setCompleted(false);
    setExpandedGroups(new Set());
    setDisplayItemCursor(0);
    hasAutoPlayed.current = false;
  }, []);

  const addNextEvent = useCallback(() => {
    const nextDisplayIdx = displayItemCursor;

    if (crashMode && nextDisplayIdx === CRASH_DISPLAY_INDEX && !hasCrashed) {
      setHasCrashed(true);
      setIsPlaying(false);
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
  }, [displayItemCursor, crashMode, hasCrashed]);

  const startReplay = useCallback(() => {
    setIsReplaying(true);
    setShowCallout(true);
    setReplayIndex(0);
    replayChargeCardIndexRef.current = chargeCardLineIndex;

    setTimeout(() => setShowCallout(false), 3000);

    const stopAt = chargeCardLineIndex;
    let idx = 0;
    replayIntervalRef.current = setInterval(() => {
      setReplayIndex(idx);
      idx++;
      if (idx > stopAt) {
        clearInterval(replayIntervalRef.current!);
        replayIntervalRef.current = null;
        setTimeout(() => {
          setIsPlaying(true);
        }, 500);
      }
    }, 150);
  }, [chargeCardLineIndex]);

  // Auto-play on mount with 600ms delay
  useEffect(() => {
    if (hasAutoPlayed.current) return;
    hasAutoPlayed.current = true;
    const timer = setTimeout(() => {
      setIsPlaying(true);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Auto-trigger replay 2s after crash
  useEffect(() => {
    if (hasCrashed && !isReplaying) {
      const timer = setTimeout(() => {
        startReplay();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasCrashed, isReplaying, startReplay]);

  // Playback interval
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const continued = addNextEvent();
      if (!continued) {
        setIsPlaying(false);
      }
    }, 400);

    return () => clearInterval(interval);
  }, [isPlaying, addNextEvent]);

  const highlightedActivity = selectedEvent !== null ? getHighlightedLine(selectedEvent) : null;
  // Crash overlay: show when crashed and the visible events match the pre-crash count
  const crashEventCount = displayItems.slice(0, CRASH_DISPLAY_INDEX).reduce((sum, item) => {
    return sum + (item.kind === 'single' ? 1 : item.eventIndices.length);
  }, 0);
  const showCrashOverlay = hasCrashed && !isReplaying && visibleEvents.length === crashEventCount;

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

  // Build the set of visible event indices for quick lookup
  const visibleSet = new Set(visibleEvents);

  return (
    <div className="slide-content !px-8 !py-6">
      <div className="w-full max-w-7xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-2">
            What happens when your server <span className="gradient-text">crashes mid-checkout</span>?
          </h2>
          <p className="text-muted-foreground text-base max-w-2xl mx-auto">
            Temporal records every step. When a worker dies, a new one picks up exactly where it left off.
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="flex gap-4 h-[calc(100vh-280px)] min-h-[400px]">
          {/* Left Column - Code (55%) */}
          <div className="w-[55%] flex flex-col">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-muted-foreground/50 font-mono tracking-wider">Your infrastructure</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
                Workflow code {isReplaying && "(replayed)"}
              </span>
              {isReplaying && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-xs px-2 py-1 rounded bg-temporal-orange/20 text-temporal-orange border border-temporal-orange/30 font-mono"
                >
                  REPLAYING
                </motion.span>
              )}
            </div>

            <div className="flex items-center gap-1 mb-2">
              {sdkOrder.map(sdk => (
                <button
                  key={sdk}
                  onClick={() => setActiveSDK(sdk)}
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
                    const isHighlighted = item.activity && item.activity === highlightedActivity;
                    const isReplayingLine = isReplaying && replayIndex === idx;
                    const showHistoryAnnotation = isReplaying && item.activity === "chargeCard" && replayIndex >= replayChargeCardIndexRef.current;

                    return (
                      <motion.div
                        key={idx}
                        className={`px-2 -mx-2 rounded relative transition-all duration-200 border-l-[3px] ${
                          isHighlighted
                            ? 'bg-primary/30 border-primary'
                            : isReplayingLine
                              ? 'bg-temporal-orange/20 border-temporal-orange'
                              : 'border-transparent'
                        }`}
                        animate={isReplayingLine ? { backgroundColor: ["hsl(24 79% 56% / 0.15)", "hsl(24 79% 56% / 0.3)", "hsl(24 79% 56% / 0.15)"] } : { backgroundColor: "transparent" }}
                        transition={isReplayingLine ? { duration: 0.4, repeat: Infinity } : { duration: 0.2 }}
                      >
                        <span className="text-muted-foreground/50 select-none inline-block w-6 text-right mr-4 text-xs">
                          {idx + 1}
                        </span>
                        {highlightCode(item.line, activeSDK)}

                        {showHistoryAnnotation && (
                          <motion.span
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-2 py-0.5 rounded bg-temporal-blue/20 text-temporal-blue"
                          >
                            Result loaded from history
                          </motion.span>
                        )}
                      </motion.div>
                    );
                  })}
                </code>
              </pre>

              {/* Crash overlay */}
              {showCrashOverlay && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-20 left-4 right-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center gap-3"
                >
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  <span className="text-sm text-destructive">
                    Worker crashed before next Workflow Task completed
                  </span>
                </motion.div>
              )}
            </div>
          </div>

          {/* Center Divider */}
          <div className="w-px bg-slide-border relative">
            {/* Floating Callout */}
            <AnimatePresence>
              {showCallout && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-64 p-4 rounded-xl bg-slide-surface border border-primary/30 shadow-xl"
                >
                  <h4 className="font-semibold text-primary mb-2 text-center">Deterministic Replay</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>Re-executes workflow code</li>
                    <li>Past results come from Event History</li>
                    <li>Only new decisions append new events</li>
                  </ul>
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

                        return (
                          <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => setSelectedEvent(eventIdx)}
                            className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all text-xs ${
                              isSelected
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
                              {event.activity && <span className="text-muted-foreground"> ({event.activity})</span>}
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

                            {/* Expanded individual events */}
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

              {/* Crash note */}
              {showCrashOverlay && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 border-t border-slide-border bg-slide-bg/50"
                >
                  <p className="text-xs text-muted-foreground italic">
                    History is persisted. A new worker can replay.
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Control Bar */}
        <div className="mt-4 flex items-center justify-center gap-3">
          <motion.button
            onClick={() => setIsPlaying(true)}
            disabled={isPlaying || completed || (hasCrashed && !isReplaying)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4" />
            Play
          </motion.button>

          <motion.button
            onClick={addNextEvent}
            disabled={isPlaying || completed || (hasCrashed && !isReplaying)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SkipForward className="w-4 h-4" />
            Step
          </motion.button>

          <div className="w-px h-6 bg-slide-border mx-2" />

          <motion.button
            onClick={startReplay}
            disabled={!hasCrashed || isReplaying}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-temporal-orange/20 text-temporal-orange border border-temporal-orange/30 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className="w-4 h-4" />
            Replay on New Worker
          </motion.button>

          <div className="w-px h-6 bg-slide-border mx-2" />

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

const sdkKeywords: Record<SdkKey, string[]> = {
  typescript: ['import', 'from', 'const', 'export', 'async', 'function', 'await', 'return'],
  go: ['package', 'import', 'func', 'var', 'err', 'ctx', 'return', 'if', 'nil'],
  python: ['from', 'import', 'class', 'def', 'async', 'await', 'self', 'return'],
  java: ['import', 'public', 'private', 'class', 'return', 'new', 'final'],
};

const sdkTypes: Record<SdkKey, string[]> = {
  typescript: ['Promise', 'string', 'void'],
  go: ['string', 'error', 'Context'],
  python: ['str', 'dict', 'timedelta'],
  java: ['String', 'Duration', 'void'],
};

const activityNames = new Set([
  'chargeCard', 'reserveInventory', 'shipOrder',
  'ChargeCard', 'ReserveInventory', 'ShipOrder',
  'charge_card', 'reserve_inventory', 'ship_order',
]);

const functionNames = new Set([
  'proxyActivities', 'CheckoutWorkflow', 'CheckoutWorkflowImpl',
  'execute_activity', 'ExecuteActivity', 'WithActivityOptions',
  'newActivityStub', 'newBuilder', 'setStartToCloseTimeout',
  'workflow',
]);

function highlightCode(line: string, sdk: SdkKey): JSX.Element {
  if (!line) return <span>&nbsp;</span>;

  // Full-line comment detection
  const trimmed = line.trimStart();
  if ((sdk === 'python' && trimmed.startsWith('#')) ||
      ((sdk === 'typescript' || sdk === 'go' || sdk === 'java') && trimmed.startsWith('//'))) {
    return <span className="text-muted-foreground">{line}</span>;
  }

  // Decorator detection
  if ((sdk === 'python' || sdk === 'java') && trimmed.startsWith('@')) {
    return <span className="text-purple-400">{line}</span>;
  }

  const keywords = sdkKeywords[sdk];
  const types = sdkTypes[sdk];

  const parts = line.split(/(\s+|[{}()<>:;,.'"\[\]&])/);

  return (
    <span>
      {parts.map((part, i) => {
        if (keywords.includes(part)) {
          return <span key={i} className="text-temporal-purple">{part}</span>;
        }
        if (types.includes(part)) {
          return <span key={i} className="text-temporal-blue">{part}</span>;
        }
        if (part.startsWith("'") || part.startsWith('"')) {
          return <span key={i} className="text-temporal-green">{part}</span>;
        }
        if (activityNames.has(part)) {
          return <span key={i} className="text-temporal-orange">{part}</span>;
        }
        if (functionNames.has(part)) {
          return <span key={i} className="text-amber-300">{part}</span>;
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

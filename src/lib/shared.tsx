export type SdkKey = "typescript" | "go" | "python" | "java";

export interface CodeLine { line: string; type: string; activity?: string; }
export interface SdkDefinition { label: string; filename: string; codeLines: CodeLine[]; }

export interface EventItem {
  id: number;
  name: string;
  activity?: string;
  type: "Workflow" | "WorkflowTask" | "Activity" | "ActivityFailed" | "Signal" | "Timer";
  timestamp: string;
  errorMessage?: string;
  attempt?: number;
}

export type DisplayItem =
  | { kind: 'single'; eventIndex: number }
  | { kind: 'group'; eventIndices: number[]; label: string };

export const sdkOrder: SdkKey[] = ["typescript", "go", "python", "java"];

export function buildDisplayItems(events: EventItem[]): DisplayItem[] {
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

export const getEventColor = (type: EventItem["type"]) => {
  switch (type) {
    case "Workflow": return "bg-temporal-purple/20 text-temporal-purple border-temporal-purple/30";
    case "WorkflowTask": return "bg-temporal-blue/20 text-temporal-blue border-temporal-blue/30";
    case "Activity": return "bg-temporal-green/20 text-temporal-green border-temporal-green/30";
    case "ActivityFailed": return "bg-destructive/20 text-destructive border-destructive/30";
    case "Signal": return "bg-temporal-pink/20 text-temporal-pink border-temporal-pink/30";
    case "Timer": return "bg-temporal-amber/20 text-temporal-amber border-temporal-amber/30";
  }
};

// --- Syntax Highlighting ---

export const sdkKeywords: Record<SdkKey, string[]> = {
  typescript: ['import', 'from', 'const', 'export', 'async', 'function', 'await', 'return'],
  go: ['package', 'import', 'func', 'var', 'err', 'ctx', 'return', 'if', 'nil'],
  python: ['from', 'import', 'class', 'def', 'async', 'await', 'self', 'return'],
  java: ['import', 'public', 'private', 'class', 'return', 'new', 'final'],
};

export const sdkTypes: Record<SdkKey, string[]> = {
  typescript: ['Promise', 'string', 'void'],
  go: ['string', 'error', 'Context'],
  python: ['str', 'dict', 'timedelta'],
  java: ['String', 'Duration', 'void'],
};

export const activityNames = new Set([
  'chargeCard', 'reserveInventory', 'shipOrder',
  'ChargeCard', 'ReserveInventory', 'ShipOrder',
  'charge_card', 'reserve_inventory', 'ship_order',
]);

export const functionNames = new Set([
  'proxyActivities', 'CheckoutWorkflow', 'CheckoutWorkflowImpl',
  'execute_activity', 'ExecuteActivity', 'WithActivityOptions',
  'newActivityStub', 'newBuilder', 'setStartToCloseTimeout',
  'workflow', 'setRetryOptions', 'RetryOptions', 'setInitialInterval',
  'setBackoffCoefficient', 'setMaximumAttempts',
  'setHandler', 'defineSignal', 'condition', 'GetSignalChannel', 'Receive',
  'wait_condition',
  'sleep', 'Sleep',
]);

export const signalNames = new Set([
  'approvalSignal', 'approval_signal', 'ApprovalSignal',
  'approval', 'approved',
]);

export function highlightCode(line: string, sdk: SdkKey): JSX.Element {
  if (!line) return <span>&nbsp;</span>;

  const trimmed = line.trimStart();
  if ((sdk === 'python' && trimmed.startsWith('#')) ||
      ((sdk === 'typescript' || sdk === 'go' || sdk === 'java') && trimmed.startsWith('//'))) {
    return <span className="text-muted-foreground">{line}</span>;
  }

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
        if (signalNames.has(part)) {
          return <span key={i} className="text-temporal-pink">{part}</span>;
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

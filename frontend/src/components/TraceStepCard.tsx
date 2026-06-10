import { useState } from "react";
import { ChevronDown, ChevronRight, Bot, Wrench, AlertCircle, CheckCircle } from "lucide-react";
import type { TraceStep } from "../api";

interface Props {
  step: TraceStep;
}

const TYPE_ICONS: Record<string, typeof Bot> = {
  llm: Bot,
  tool: Wrench,
  error: AlertCircle,
  decision: CheckCircle,
};

export default function TraceStepCard({ step }: Props) {
  const [open, setOpen] = useState(false);
  const Icon = TYPE_ICONS[step.type] || Wrench;
  const hasError = !!step.error || step.retries > 0;

  return (
    <div
      className={`border rounded-lg p-3 mb-2 ${
        hasError ? "border-red-400 bg-red-50" : "border-gray-200 bg-white"
      }`}
    >
      <div
        className="flex items-center gap-2 cursor-pointer select-none"
        onClick={() => setOpen(!open)}
      >
        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        <Icon size={16} className={hasError ? "text-red-500" : "text-gray-500"} />
        <span className="font-mono text-sm font-medium">{step.name}</span>
        <span className="text-xs text-gray-400 ml-auto flex gap-3">
          <span>{step.latency_ms.toFixed(0)}ms</span>
          {(step.tokens_in > 0 || step.tokens_out > 0) && (
            <span>{step.tokens_in + step.tokens_out} tok</span>
          )}
          {step.retries > 0 && (
            <span className="text-red-600 font-semibold">{step.retries} retries</span>
          )}
        </span>
      </div>

      {open && (
        <div className="mt-3 space-y-2 text-xs">
          {step.input != null && (
            <div>
              <div className="font-semibold text-gray-500 mb-1">Input</div>
              <pre className="bg-gray-50 p-2 rounded overflow-x-auto max-h-48">
                {typeof step.input === "string"
                  ? step.input
                  : JSON.stringify(step.input, null, 2)}
              </pre>
            </div>
          )}
          {step.output != null && (
            <div>
              <div className="font-semibold text-gray-500 mb-1">Output</div>
              <pre className="bg-gray-50 p-2 rounded overflow-x-auto max-h-48">
                {typeof step.output === "string"
                  ? step.output
                  : JSON.stringify(step.output, null, 2)}
              </pre>
            </div>
          )}
          {step.error && (
            <div>
              <div className="font-semibold text-red-600 mb-1">Error</div>
              <pre className="bg-red-50 p-2 rounded text-red-700">{step.error}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

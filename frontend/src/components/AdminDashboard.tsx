import { useState, useEffect } from "react";
import { RefreshCw, Activity } from "lucide-react";
import { getRuns, getTrace, type RunSummary, type TraceStep } from "../api";
import TraceStepCard from "./TraceStepCard";

export default function AdminDashboard() {
  const [runs, setRuns] = useState<RunSummary[]>([]);
  const [selectedRun, setSelectedRun] = useState<string | null>(null);
  const [trace, setTrace] = useState<TraceStep[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRuns = async () => {
    const data = await getRuns();
    setRuns(data);
  };

  useEffect(() => {
    fetchRuns();
  }, []);

  const selectRun = async (runId: string) => {
    setSelectedRun(runId);
    setLoading(true);
    const data = await getTrace(runId);
    setTrace(data);
    setLoading(false);
  };

  const totalTokens = trace.reduce((s, t) => s + t.tokens_in + t.tokens_out, 0);
  const totalLatency = trace.reduce((s, t) => s + t.latency_ms, 0);
  const failedSteps = trace.filter((t) => t.error || t.retries > 0);

  return (
    <div className="flex h-full">
      {/* Run List */}
      <div className="w-72 border-r bg-white overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Runs</h2>
          <button onClick={fetchRuns} className="text-gray-400 hover:text-gray-600">
            <RefreshCw size={16} />
          </button>
        </div>
        {runs.length === 0 && (
          <p className="text-center text-gray-400 text-sm mt-8">No runs yet</p>
        )}
        {runs.map((r) => (
          <div
            key={r.run_id}
            onClick={() => selectRun(r.run_id)}
            className={`px-4 py-3 border-b cursor-pointer hover:bg-gray-50 ${
              selectedRun === r.run_id ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
            }`}
          >
            <div className="text-xs font-mono text-gray-500 truncate">{r.run_id.slice(0, 8)}...</div>
            <div className="flex gap-3 mt-1 text-xs text-gray-400">
              <span>{r.steps} steps</span>
              <span>{r.total_latency_ms.toFixed(0)}ms</span>
              <span>{r.total_tokens} tok</span>
            </div>
          </div>
        ))}
      </div>

      {/* Trace Timeline */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
        {!selectedRun && (
          <div className="text-center text-gray-400 mt-20">
            <Activity size={48} className="mx-auto mb-4" />
            <p>Select a run to view its trace</p>
          </div>
        )}
        {selectedRun && (
          <>
            <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
              <span className="font-mono">{selectedRun.slice(0, 12)}...</span>
              <span>{trace.length} steps</span>
              <span>{totalLatency.toFixed(0)}ms total</span>
              <span>{totalTokens} tokens</span>
              {failedSteps.length > 0 && (
                <span className="text-red-600 font-semibold">
                  {failedSteps.length} failed/retried
                </span>
              )}
            </div>
            {loading ? (
              <p className="text-gray-400">Loading trace...</p>
            ) : (
              trace.map((s, i) => <TraceStepCard key={i} step={s} />)
            )}
          </>
        )}
      </div>
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import { sendMessage, type ChatResponse, type TraceStep } from "../api";
import DecisionBadge from "./DecisionBadge";

interface Message {
  role: "user" | "assistant";
  content: string;
  decision?: string | null;
}

interface Props {
  onTrace?: (trace: TraceStep[], runId: string) => void;
}

export default function ChatWindow({ onTrace }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [runId, setRunId] = useState<string | undefined>();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);

    try {
      const res: ChatResponse = await sendMessage(text, runId);
      setRunId(res.run_id);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.reply, decision: res.decision },
      ]);
      if (onTrace && res.trace.length > 0) {
        onTrace(res.trace, res.run_id);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error: Could not reach the server." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setMessages([]);
    setRunId(undefined);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
        <h2 className="text-lg font-semibold text-gray-800">Customer Support Chat</h2>
        <button
          onClick={handleNew}
          className="text-sm text-blue-600 hover:underline"
        >
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-20">
            <p className="text-lg">Welcome! How can I help you today?</p>
            <p className="text-sm mt-1">Ask about a refund for any of your orders.</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                m.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-200 text-gray-800"
              }`}
            >
              <p className="whitespace-pre-wrap text-sm">{m.content}</p>
              {m.decision && (
                <div className="mt-2">
                  <DecisionBadge decision={m.decision} />
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2">
              <Loader2 size={16} className="animate-spin text-gray-400" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t bg-white p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your message..."
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-blue-600 text-white rounded-xl px-4 py-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

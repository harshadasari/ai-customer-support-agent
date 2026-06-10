import { useState } from "react";
import { MessageSquare, LayoutDashboard } from "lucide-react";
import ChatWindow from "./components/ChatWindow";
import AdminDashboard from "./components/AdminDashboard";

type Tab = "chat" | "admin";

function App() {
  const [tab, setTab] = useState<Tab>("chat");

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">
            AI Refund Agent
          </h1>
          <nav className="flex gap-1">
            <button
              onClick={() => setTab("chat")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                tab === "chat"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              <MessageSquare size={16} />
              Chat
            </button>
            <button
              onClick={() => setTab("admin")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                tab === "admin"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              <LayoutDashboard size={16} />
              Admin
            </button>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full">
          {tab === "chat" ? <ChatWindow /> : <AdminDashboard />}
        </div>
      </main>
    </div>
  );
}

export default App;

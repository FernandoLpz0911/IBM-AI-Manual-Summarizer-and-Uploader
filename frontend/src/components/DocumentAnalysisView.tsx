import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  ArrowLeft,
  MoreVertical,
  Download,
  Search,
  Sparkles,
  FileText,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { DocumentData, Message, Theme } from "../types";

interface DocumentAnalysisViewProps {
  document: DocumentData;
  theme: Theme;
  initialMessages: Message[];
  onBack: () => void;
}

const DocumentAnalysisView: React.FC<DocumentAnalysisViewProps> = ({
  document,
  theme,
  initialMessages,
  onBack,
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const styles = {
    bg: theme === "dark" ? "bg-slate-900" : "bg-slate-50",
    panelBg: theme === "dark" ? "bg-slate-800/50" : "bg-white",
    textMain: theme === "dark" ? "text-slate-100" : "text-slate-900",
    textSub: theme === "dark" ? "text-slate-400" : "text-slate-500",
    border: theme === "dark" ? "border-slate-700" : "border-slate-200",
    inputBg: theme === "dark" ? "bg-slate-900" : "bg-slate-50",
    chatBubbleUser: "bg-blue-600 text-white",
    chatBubbleAi:
      theme === "dark"
        ? "bg-slate-700 text-slate-100"
        : "bg-white border border-slate-200 text-slate-800",
    pageBg:
      theme === "dark"
        ? "bg-[#1e293b] text-slate-300"
        : "bg-white text-slate-800",
  };

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAnalyzing]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    // 1. Add User Message
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: inputValue,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");
    setIsAnalyzing(true);

    // 2. Simulate AI Analysis (Placeholder for API Call)
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: "I've analyzed the document. Based on the maintenance section, you should check the fuse on the emergency stop board if you encounter that error code.",
        referenceId: 3, // Simulated reference to page 3
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsAnalyzing(false);
    }, 1500);
  };

  const totalPages = document.content.length;

  return (
    <div
      className={`flex flex-col h-[calc(100vh-64px)] ${styles.bg} animate-in fade-in duration-300`}
    >
      {/* Header Toolbar */}
      <div
        className={`h-14 flex items-center justify-between px-4 border-b ${
          styles.border
        } ${theme === "dark" ? "bg-slate-900" : "bg-white"}`}
      >
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className={`p-2 rounded-lg hover:bg-slate-700/20 transition-colors ${styles.textSub}`}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2
              className={`font-semibold text-sm ${styles.textMain} truncate max-w-[200px] sm:max-w-md`}
            >
              {document.title}
            </h2>
            <div className="flex items-center space-x-2">
              <span className={`text-xs ${styles.textSub}`}>
                {document.fileSize} • {document.type}
              </span>
              <span className="text-xs text-emerald-500 flex items-center gap-1">
                <Sparkles size={10} /> AI Indexed
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            className={`p-2 rounded-lg hover:bg-slate-700/20 transition-colors ${styles.textSub}`}
            title="Search in Document"
          >
            <Search size={18} />
          </button>
          <button
            className={`p-2 rounded-lg hover:bg-slate-700/20 transition-colors ${styles.textSub}`}
            title="Download Original"
          >
            <Download size={18} />
          </button>
          <div
            className={`h-4 w-px mx-2 ${
              theme === "dark" ? "bg-slate-700" : "bg-slate-200"
            }`}
          ></div>
          <button
            className={`p-2 rounded-lg hover:bg-slate-700/20 transition-colors ${styles.textSub}`}
          >
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      {/* Main Content Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL: Document Viewer */}
        <div
          className={`flex-1 overflow-y-auto p-4 sm:p-8 relative ${
            theme === "dark" ? "bg-slate-900" : "bg-slate-100"
          }`}
        >
          <div
            className={`max-w-3xl mx-auto shadow-2xl rounded-sm min-h-[800px] flex flex-col ${styles.pageBg} transition-colors duration-300`}
          >
            {/* Document Content */}
            <div className="flex-1 p-10 sm:p-16 font-serif leading-relaxed">
              {/* Render All Pages vertically for scrolling, or just current page for pagination */}
              {document.content.map((pageContent, idx) => (
                <div
                  key={idx}
                  className="mb-16 border-b border-dashed border-slate-500/20 pb-16 last:border-0 last:pb-0"
                >
                  <div className="flex justify-between items-center mb-8 opacity-50 font-sans text-xs">
                    <span>{document.title}</span>
                    <span>Page {idx + 1}</span>
                  </div>
                  <div className="whitespace-pre-wrap">{pageContent}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: AI Chat Interface */}
        <div
          className={`w-96 flex flex-col border-l ${styles.border} ${styles.panelBg} shadow-xl z-10`}
        >
          {/* Chat Header */}
          <div
            className={`p-4 border-b ${styles.border} flex items-center justify-between`}
          >
            <div className="flex items-center gap-2">
              <Bot size={18} className="text-blue-500" />
              <span className={`font-medium text-sm ${styles.textMain}`}>
                AI Assistant
              </span>
            </div>
            <button
              className={`text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition`}
            >
              Clear Chat
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                    msg.sender === "user"
                      ? styles.chatBubbleUser
                      : styles.chatBubbleAi
                  }`}
                >
                  <p>{msg.text}</p>
                  {msg.referenceId && (
                    <button className="mt-2 text-xs flex items-center opacity-70 hover:opacity-100 underline bg-black/5 dark:bg-white/10 px-2 py-1 rounded transition-colors">
                      <FileText size={10} className="mr-1" /> Reference: Page{" "}
                      {msg.referenceId}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* AI Thinking Indicator */}
            {isAnalyzing && (
              <div className="flex justify-start">
                <div
                  className={`${styles.chatBubbleAi} rounded-2xl px-4 py-3 flex items-center space-x-2`}
                >
                  <Loader2 size={14} className="animate-spin text-blue-500" />
                  <span className="text-xs opacity-70">
                    Analyzing document context...
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div
            className={`p-4 border-t ${styles.border} ${
              theme === "dark" ? "bg-slate-900" : "bg-slate-50"
            }`}
          >
            <form onSubmit={handleSendMessage} className="relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about this document..."
                className={`w-full pl-4 pr-12 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  theme === "dark"
                    ? "bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500"
                    : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
                }`}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isAnalyzing}
                className={`absolute right-2 top-2 p-1.5 rounded-lg transition-colors ${
                  inputValue.trim()
                    ? "bg-blue-600 text-white hover:bg-blue-500"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
                }`}
              >
                <Send size={16} />
              </button>
            </form>
            <div className="mt-2 flex justify-center">
              <p className="text-[10px] text-slate-500">
                AI can make mistakes. Verify important info.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentAnalysisView;

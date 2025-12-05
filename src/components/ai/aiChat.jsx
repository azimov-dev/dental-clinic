// src/components/ai/AiChat.jsx
import { useState } from "react";
import { useLanguage } from "../../i18n/LanguageContext.jsx";
import { useAuth } from "../../features/auth/useAuth";
import { apiClient } from "../../api/client";

export default function AiChat() {
  const { t } = useLanguage();
  const { token } = useAuth();

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendMessage = async () => {
    if (!input.trim() || loading || !token) return;

    const userText = input.trim();
    const userMessage = { role: "user", content: userText };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const historyForGemini = messages.map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      }));

      const response = await apiClient("/ai/chat", {
        method: "POST",
        token,
        body: {
          message: userText,
          history: historyForGemini, // This prevents repetition!
        },
      });

      if (!response?.reply) {
        throw new Error("Bo'sh javob keldi");
      }

      const assistantMessage = {
        role: "assistant",
        content: response.reply
          .replace(/\*\*(.*?)\*\*/g, "$1")
          .replace(/\*(.*?)\*/g, "$1")
          .replace(/_(.*?)_/g, "$1")
          .replace(/###? ?/g, "")
          .replace(/^\d+\.\s*/gm, "")
          .trim(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("AI Chat error:", err);
      setError(err.message || "Xatolik yuz berdi. Qayta urinib ko'ring.");

      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!loading) sendMessage();
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-4 right-4 z-40 mr-3 mb-3 flex items-center gap-2 rounded-full bg-sky-500 px-3 py-2 text-xs font-semibold text-white shadow-lg hover:bg-sky-600"
      >
        AI Chat 🤖
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-16 right-4 z-40 w-full max-w-sm rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-500 text-xs text-white">
                🤖
              </span>
              <div className="text-[11px] leading-tight">
                <div className="font-semibold text-slate-800">
                  {t("aiTitle")}
                </div>
                <div className="text-[10px] text-slate-400">
                  {t("aiSubtitle")}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>

          <div className="max-h-64 space-y-2 overflow-y-auto px-3 py-2 text-[11px]">
            {messages.length === 0 && (
              <div className="rounded-lg bg-slate-50 px-3 py-2 text-slate-500">
                {t("aiExampleTitle")}:
                <ul className="mt-1 list-disc pl-4">
                  <li>{t("aiExample1")}</li>
                  <li>{t("aiExample2")}</li>
                  <li>{t("aiExample3")}</li>
                </ul>
              </div>
            )}

            {messages.map((m, idx) => (
              <div
                key={idx}
                className={
                  m.role === "user"
                    ? "ml-6 rounded-xl bg-sky-50 px-3 py-2 text-slate-800"
                    : "mr-6 rounded-xl bg-slate-900 px-3 py-2 text-slate-50"
                }
              >
                {m.content}
              </div>
            ))}

            {error && (
              <div className="rounded-lg bg-rose-50 px-3 py-2 text-rose-700">
                {error}
              </div>
            )}

            {loading && (
              <div className="text-[10px] text-slate-400">{t("aiTyping")}</div>
            )}
          </div>

          <div className="border-t border-slate-200 p-2">
            <div className="flex items-end gap-2">
              <textarea
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t("aiPlaceholder")}
                className="max-h-20 flex-1 resize-none rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
              <button
                type="button"
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="rounded-lg bg-sky-500 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-sky-300"
              >
                {t("aiSend")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

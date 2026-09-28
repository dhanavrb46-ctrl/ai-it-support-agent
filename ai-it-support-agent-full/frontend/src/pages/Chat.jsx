import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";
import Layout from "../components/Layout";

export default function Chat() {
  const { token } = useAuth();
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      content:
        "Hi! I'm the IT Help Desk assistant. Describe your issue (e.g. \"my VPN won't connect\") and I'll try to solve it instantly, or raise a ticket if I can't.",
    },
  ]);
  const [input, setInput] = useState("");
  const [chatId, setChatId] = useState(null);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  async function handleSend(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    setMessages((m) => [...m, { sender: "user", content: text }]);
    setInput("");
    setSending(true);

    try {
      const data = await api.sendMessage(token, { message: text, chatId });
      setChatId(data.chatId);
      setMessages((m) => [
        ...m,
        { sender: "bot", content: data.reply, isTicket: !!data.ticket },
      ]);
    } catch (err) {
      setMessages((m) => [...m, { sender: "bot", content: `Error: ${err.message}` }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <Layout>
      <h1 className="page-title">Help Desk Chat</h1>
      <p className="page-sub">Ask about password resets, Wi-Fi, VPN, printers, email, or hardware issues.</p>

      <div className="chat-window">
        <div className="chat-messages">
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.sender}${m.isTicket ? " ticket" : ""}`}>
              {m.content}
            </div>
          ))}
          {sending && <div className="typing-dots">Assistant is typing…</div>}
          <div ref={bottomRef} />
        </div>

        <form className="chat-input-row" onSubmit={handleSend}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your IT issue..."
            disabled={sending}
          />
          <button type="submit" disabled={sending || !input.trim()}>
            Send
          </button>
        </form>
      </div>
    </Layout>
  );
}

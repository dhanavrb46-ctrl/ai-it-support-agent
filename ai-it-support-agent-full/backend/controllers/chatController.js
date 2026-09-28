const ChatHistory = require("../models/ChatHistory");
const KnowledgeBase = require("../models/KnowledgeBase");
const Ticket = require("../models/Ticket");
const { generateRagAnswer, classifyUrgency } = require("../utils/groqClient");
const { checkAndLinkBulkIncident } = require("../utils/bulkIncidentDetector");

// @route POST /api/chat/message
// Body: { message: string, chatId?: string }
// 1. Retrieve relevant KB docs (MongoDB text search stands in for ChromaDB)
// 2. Ask Groq to answer using ONLY that context
// 3. If Groq says NOT_FOUND -> auto-create a classified ticket + bulk-incident check
async function sendMessage(req, res) {
  try {
    const { message, chatId } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    let chat = chatId
      ? await ChatHistory.findById(chatId)
      : await ChatHistory.create({ employee: req.user._id, messages: [] });

    if (!chat) return res.status(404).json({ message: "Chat not found" });

    chat.messages.push({ sender: "user", content: message });

    // Step 1: retrieve top matching KB docs via MongoDB text search
    const retrievedDocs = await KnowledgeBase.find(
      { $text: { $search: message } },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(3);

    let botReply;
    let ticketCreated = null;

    if (retrievedDocs.length === 0) {
      botReply = "NOT_FOUND";
    } else {
      botReply = await generateRagAnswer(message, retrievedDocs);
    }

    if (botReply.trim() === "NOT_FOUND") {
      // Step 2: chatbot couldn't resolve it -> auto-create a ticket
      const { priority, category } = await classifyUrgency(message, message);

      const ticket = await Ticket.create({
        employee: req.user._id,
        title: message.slice(0, 80),
        description: message,
        category,
        priority,
        chatSource: chat._id,
      });

      const incident = await checkAndLinkBulkIncident(ticket);
      ticketCreated = ticket;

      botReply =
        "I couldn't find an existing solution for this, so I've raised a support ticket " +
        `(Priority: ${priority}, Category: ${category}). Our IT team will follow up shortly.` +
        (incident ? " Several colleagues reported the same issue — it's now tracked as a bulk incident so IT can fix the root cause faster." : "");

      chat.resolved = false;
      chat.ticket = ticket._id;
    } else {
      chat.resolved = true;
    }

    chat.messages.push({
      sender: "bot",
      content: botReply,
      retrievedDocs: retrievedDocs.map((d) => d._id),
    });

    await chat.save();

    res.json({ chatId: chat._id, reply: botReply, resolved: chat.resolved, ticket: ticketCreated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// @route GET /api/chat/history/:id
async function getChatHistory(req, res) {
  try {
    const chat = await ChatHistory.findById(req.params.id).populate("ticket");
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    if (String(chat.employee) !== String(req.user._id) && req.user.role === "Employee") {
      return res.status(403).json({ message: "Not authorized" });
    }
    res.json(chat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// @route GET /api/chat/my-chats
async function listMyChats(req, res) {
  try {
    const chats = await ChatHistory.find({ employee: req.user._id })
      .sort({ updatedAt: -1 })
      .select("resolved createdAt updatedAt ticket");
    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { sendMessage, getChatHistory, listMyChats };

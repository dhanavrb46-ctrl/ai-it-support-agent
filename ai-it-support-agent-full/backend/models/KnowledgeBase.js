const mongoose = require("mongoose");

const knowledgeBaseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        "Password Reset",
        "Wi-Fi/Network",
        "VPN",
        "Printer",
        "Hardware",
        "Software",
        "Email",
        "Other",
      ],
      required: true,
    },
    content: {
      type: String,
      required: true, // the actual troubleshooting steps, also embedded into ChromaDB
    },
    tags: [String],
    // Reference to the vector stored in ChromaDB for this document
    chromaId: {
      type: String,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // null = seeded/system doc; set when an engineer's resolution is pushed back
    },
    sourceTicket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      default: null, // set when this KB entry was auto-created from a resolved ticket
    },
  },
  { timestamps: true }
);

// Text index enables MongoDB's built-in relevance search — this is our
// lightweight stand-in for a vector DB (ChromaDB), so no separate server
// needs to be hosted for the demo. Swappable later for real embeddings.
knowledgeBaseSchema.index({ title: "text", content: "text", tags: "text" });

module.exports = mongoose.model("KnowledgeBase", knowledgeBaseSchema);

const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
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
      default: "Other",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved", "Closed"],
      default: "Open",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // must be a user with role: ITEngineer
      default: null,
    },
    // Groups duplicate tickets reported by multiple employees for the same issue
    bulkIncident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BulkIncident",
      default: null,
    },
    chatSource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatHistory",
      default: null,
    },
    resolutionNotes: {
      type: String,
      default: "",
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Helpful index for bulk-incident duplicate detection
ticketSchema.index({ category: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model("Ticket", ticketSchema);

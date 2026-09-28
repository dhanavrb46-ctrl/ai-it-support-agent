const Ticket = require("../models/Ticket");
const KnowledgeBase = require("../models/KnowledgeBase");
const { classifyUrgency } = require("../utils/groqClient");
const { checkAndLinkBulkIncident } = require("../utils/bulkIncidentDetector");

// @route POST /api/tickets
// Creates a ticket directly (used internally by the chat flow, or manually by an employee)
async function createTicket(req, res) {
  try {
    const { title, description, chatSource } = req.body;

    // LLM classifies category + priority before the ticket is saved
    const { priority, category } = await classifyUrgency(title, description);

    const ticket = await Ticket.create({
      employee: req.user._id,
      title,
      description,
      priority,
      category,
      chatSource: chatSource || null,
    });

    const incident = await checkAndLinkBulkIncident(ticket);

    res.status(201).json({ ticket, bulkIncident: incident });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// @route GET /api/tickets
// Employee sees only their own tickets; Admin/ITEngineer see everything
async function listTickets(req, res) {
  try {
    const filter = req.user.role === "Employee" ? { employee: req.user._id } : {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.category) filter.category = req.query.category;

    const tickets = await Ticket.find(filter)
      .populate("employee", "name email department")
      .populate("assignedTo", "name email")
      .populate("bulkIncident", "title status")
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// @route GET /api/tickets/:id
async function getTicket(req, res) {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("employee", "name email department")
      .populate("assignedTo", "name email")
      .populate("bulkIncident");

    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    if (req.user.role === "Employee" && String(ticket.employee._id) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not authorized to view this ticket" });
    }

    res.json(ticket);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// @route PATCH /api/tickets/:id
// Admin/ITEngineer updates status, assignment, or resolution notes.
// When marked Resolved, the fix is optionally pushed back into the Knowledge Base
// so the chatbot can answer the same question instantly next time.
async function updateTicket(req, res) {
  try {
    const { status, assignedTo, resolutionNotes, pushToKnowledgeBase } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    if (status) ticket.status = status;
    if (assignedTo) ticket.assignedTo = assignedTo;
    if (resolutionNotes !== undefined) ticket.resolutionNotes = resolutionNotes;
    if (status === "Resolved") ticket.resolvedAt = new Date();

    await ticket.save();

    if (status === "Resolved" && pushToKnowledgeBase && resolutionNotes) {
      await KnowledgeBase.create({
        title: ticket.title,
        category: ticket.category,
        content: resolutionNotes,
        tags: [ticket.category],
        createdBy: req.user._id,
        sourceTicket: ticket._id,
      });
    }

    res.json(ticket);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { createTicket, listTickets, getTicket, updateTicket };

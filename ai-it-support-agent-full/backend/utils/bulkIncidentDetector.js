const Ticket = require("../models/Ticket");
const BulkIncident = require("../models/BulkIncident");

const BULK_WINDOW_MS = 60 * 60 * 1000; // look for duplicates within the last 1 hour
const BULK_THRESHOLD = 3; // 3+ similar tickets => treat as a bulk incident

// Checks recent tickets in the same category; if enough duplicates exist,
// groups them (and this new one) under a single BulkIncident.
async function checkAndLinkBulkIncident(newTicket) {
  const since = new Date(Date.now() - BULK_WINDOW_MS);

  const similarTickets = await Ticket.find({
    category: newTicket.category,
    createdAt: { $gte: since },
    _id: { $ne: newTicket._id },
  });

  const allTickets = [...similarTickets, newTicket];

  if (allTickets.length < BULK_THRESHOLD) {
    return null; // not enough duplicates yet — leave as a normal ticket
  }

  // Reuse an existing open bulk incident for this category if one already exists
  let incident = await BulkIncident.findOne({
    category: newTicket.category,
    status: { $in: ["Open", "In Progress"] },
  });

  if (!incident) {
    incident = await BulkIncident.create({
      title: `Bulk Incident: ${newTicket.category}`,
      category: newTicket.category,
      description: `Auto-grouped from ${allTickets.length} similar tickets reported within 1 hour.`,
      affectedTicketCount: allTickets.length,
    });
  } else {
    incident.affectedTicketCount = allTickets.length;
    await incident.save();
  }

  // Link every related ticket (old + new) to this incident
  await Ticket.updateMany(
    { _id: { $in: allTickets.map((t) => t._id) } },
    { bulkIncident: incident._id }
  );

  return incident;
}

module.exports = { checkAndLinkBulkIncident };

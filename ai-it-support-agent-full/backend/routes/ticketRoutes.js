const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const {
  createTicket,
  listTickets,
  getTicket,
  updateTicket,
} = require("../controllers/ticketController");

const router = express.Router();

router.use(protect);

router.post("/", createTicket);
router.get("/", listTickets);
router.get("/:id", getTicket);
router.patch("/:id", authorize("Admin", "ITEngineer"), updateTicket);

module.exports = router;

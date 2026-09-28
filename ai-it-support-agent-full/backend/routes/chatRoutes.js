const express = require("express");
const { protect } = require("../middleware/auth");
const { sendMessage, getChatHistory, listMyChats } = require("../controllers/chatController");

const router = express.Router();

router.use(protect);

router.post("/message", sendMessage);
router.get("/my-chats", listMyChats);
router.get("/history/:id", getChatHistory);

module.exports = router;

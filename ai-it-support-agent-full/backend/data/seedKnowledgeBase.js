// Run once after setup: node data/seedKnowledgeBase.js
require("dotenv").config();
const mongoose = require("mongoose");
const KnowledgeBase = require("../models/KnowledgeBase");

const docs = [
  {
    title: "How to reset your account password",
    category: "Password Reset",
    tags: ["password", "reset", "login", "locked out"],
    content:
      "1. Go to the company login page and click 'Forgot Password'.\n" +
      "2. Enter your registered company email address.\n" +
      "3. Check your email for a reset link (valid for 15 minutes).\n" +
      "4. Click the link and choose a new password (min 8 characters, 1 number, 1 symbol).\n" +
      "5. Log in with your new password. If you don't receive the email within 5 minutes, check your Spam folder.",
  },
  {
    title: "Fixing Wi-Fi connection issues in the office",
    category: "Wi-Fi/Network",
    tags: ["wifi", "wi-fi", "network", "internet", "connection"],
    content:
      "1. Turn Wi-Fi off and back on from your device settings.\n" +
      "2. Forget the 'Company-WiFi' network and reconnect using your employee ID as the username.\n" +
      "3. Restart your laptop's network adapter (Windows: Settings > Network > Change adapter options > Disable/Enable).\n" +
      "4. Move closer to the nearest access point (usually near the pantry or meeting rooms).\n" +
      "5. If the issue persists, restart your machine — most connectivity issues resolve after a restart.",
  },
  {
    title: "VPN not connecting from home",
    category: "VPN",
    tags: ["vpn", "remote", "work from home", "connection failed"],
    content:
      "1. Make sure you are connected to the internet before opening the VPN client.\n" +
      "2. Open the company VPN app and confirm the server address is 'vpn.company.com'.\n" +
      "3. Log in with your company email and password (not your personal Wi-Fi password).\n" +
      "4. If you see 'Authentication failed', your password may have expired — reset it first.\n" +
      "5. If you see 'Connection timed out', temporarily disable any personal VPN or firewall software and try again.",
  },
  {
    title: "Printer not printing or showing offline",
    category: "Printer",
    tags: ["printer", "print", "offline", "paper jam"],
    content:
      "1. Check that the printer is powered on and the network/USB cable is connected.\n" +
      "2. On your computer, go to Settings > Printers, right-click the printer, and select 'Use Printer Online' if it shows offline.\n" +
      "3. Clear the print queue: open the printer's queue window and cancel any stuck jobs.\n" +
      "4. Restart the print spooler service (Windows: services.msc > Print Spooler > Restart).\n" +
      "5. If a paper jam is shown, open the printer cover and gently remove any jammed paper, then close and retry.",
  },
  {
    title: "Outlook / email not syncing",
    category: "Email",
    tags: ["email", "outlook", "sync", "not receiving mail"],
    content:
      "1. Check your internet connection first.\n" +
      "2. In Outlook, go to Send/Receive tab and click 'Update Folder'.\n" +
      "3. Check if Outlook is in 'Work Offline' mode (Send/Receive tab) — click to disable it.\n" +
      "4. Verify your mailbox isn't full: Settings > Account > Mailbox usage.\n" +
      "5. If none of this works, remove and re-add your email account from File > Account Settings.",
  },
  {
    title: "Laptop running very slow",
    category: "Hardware",
    tags: ["slow", "laptop", "performance", "lag"],
    content:
      "1. Restart your laptop — this clears temporary memory issues.\n" +
      "2. Close unused browser tabs and background applications (check Task Manager for high CPU/memory usage).\n" +
      "3. Check available disk space — free up space if less than 10% is remaining.\n" +
      "4. Run Windows Update to install pending performance and security patches.\n" +
      "5. If the laptop is more than 3 years old and still slow after these steps, raise a ticket for a hardware health check.",
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB. Seeding knowledge base...");

  for (const doc of docs) {
    const exists = await KnowledgeBase.findOne({ title: doc.title });
    if (!exists) {
      await KnowledgeBase.create(doc);
      console.log(`Inserted: ${doc.title}`);
    } else {
      console.log(`Skipped (already exists): ${doc.title}`);
    }
  }

  console.log("Done seeding.");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

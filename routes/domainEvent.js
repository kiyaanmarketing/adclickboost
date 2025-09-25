const express = require("express");
const router = express.Router();
const { getDB } = require("../mongo-config");

// Store domain events
router.post("/", async (req, res) => {
  const { event, page, device_type, user_agent, referrer, origin } = req.body;

  if (!event || !origin) {
    return res.status(400).json({ success: false, error: "Event and origin are required" });
  }

  try {
    const db = getDB();

    await db.collection("DomainEvents").insertOne({
      event,
      page,
      device_type,
      user_agent,
      referrer,
      origin,
      createdAt: new Date()
    });

    res.json({ success: true, message: "Event logged successfully" });
  } catch (err) {
    console.error("domainEvent error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

module.exports = router;

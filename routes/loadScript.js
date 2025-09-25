const express = require("express");
const router = express.Router();
const { getDB } = require("../mongo-config");

// Load script dynamically based on domain
router.get("/", async (req, res) => {
  try {
    const db = getDB();
    const host = req.hostname;

    // Find script URL from DB
    const result = await db.collection("Scripts").findOne({ hostname: host });

    if (!result) {
      return res.status(404).json({ error: "Script not found for this domain" });
    }

    res.json({ scriptSrc: result.scriptUrl });
  } catch (err) {
    console.error("loadScript error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

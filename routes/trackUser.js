const express = require("express");
const router = express.Router();
const { getDB } = require("../mongo-config");



// Track user and return affiliate URL
router.post("/", async (req, res) => {
  const { url, referrer, unique_id, origin } = req.body;

  if (!url || !unique_id) {
    return res.status(400).json({ success: false, error: "Invalid request data" });
  }

  try {
    const db = getDB();

    // Save raw tracking data
    await db.collection("UserTracking").insertOne({
      url,
      referrer,
      unique_id,
      origin,
      createdAt: new Date()
    });

    // Fetch affiliate URL by hostname
    const result = await db.collection("HostName").findOne({ hostname: origin });
    const affiliateUrl = result ? result.affiliateUrl : "";

    res.json({ success: true, affiliate_url: affiliateUrl });
  } catch (err) {
    console.error("trackUser error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

module.exports = router;

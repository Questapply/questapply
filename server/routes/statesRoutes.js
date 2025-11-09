import db from "../config/db.config.js";
import { authenticateTokenOptional } from "../middleware/authMiddleware.js";
import express from "express";

const router = express.Router();

// API endpoint to fetch states for a country
router.get("/states", authenticateTokenOptional, async (req, res) => {
  try {
    const { country } = req.query;

    if (!country) {
      return res.status(400).json({ error: "Country ID is required" });
    }

    // Get states for this country from place taxonomy
    const [statesData] = await db.query(
      `
      SELECT t.term_id, t.name
      FROM qacom_wp_term_taxonomy tt
      JOIN qacom_wp_terms t ON tt.term_id = t.term_id
      WHERE tt.taxonomy = 'place' AND tt.parent = ?
      ORDER BY t.name ASC
    `,
      [country]
    );

    if (!statesData || statesData.length === 0) {
      return res.json({ states: [] });
    }

    const states = statesData.map((state) => ({
      id: state.term_id,
      name: state.name,
    }));

    res.json({ states });
  } catch (error) {
    console.error("Error fetching states for country:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

export default router;

// routes/metaRoutes.js
import express from "express";
import db from "../config/db.config.js";
import { authenticateTokenOptional } from "../middleware/authMiddleware.js";
import { decodeHtmlEntities } from "../utils/helpers.js";

import {
  countryMap,
  countryCurrency,
  getCurrencyForCountry,
} from "../config/constants.js";

const router = express.Router();

// GET /api/meta/countries?source=static|db|merge
router.get("/meta/countries", authenticateTokenOptional, async (req, res) => {
  const source = String(req.query.source || "static"); // پیش‌فرض: static
  try {
    let items = [];

    // از DB (taxonomy place parent=0)
    if (source !== "static") {
      const [rows] = await db.query(`
        SELECT t.term_id AS id, t.name
        FROM qacom_wp_term_taxonomy tt
        JOIN qacom_wp_terms t ON tt.term_id = t.term_id
        WHERE tt.taxonomy = 'place' AND tt.parent = 0
        ORDER BY t.name ASC
      `);

      items = (rows || []).map((r) => ({
        id: Number(r.id),
        name: decodeHtmlEntities(r.name),
        currency:
          countryCurrency[Number(r.id)] || getCurrencyForCountry(Number(r.id)),
      }));
    }

    // از ثابت‌ها (countryMap)
    if (source !== "db") {
      const statics = Object.entries(countryMap).map(([id, name]) => ({
        id: Number(id),
        name,
        currency:
          countryCurrency[Number(id)] || getCurrencyForCountry(Number(id)),
      }));

      if (source === "merge") {
        const map = new Map(items.map((i) => [i.id, i]));
        for (const s of statics) map.set(s.id, { ...map.get(s.id), ...s }); // static اولویت
        items = Array.from(map.values());
      } else {
        items = statics; // static-only
      }
    }

    items.sort((a, b) => a.name.localeCompare(b.name));
    return res.json({ countries: items });
  } catch (err) {
    console.error("Error /meta/countries:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

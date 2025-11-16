import express from "express";
import db from "../config/db.config.js";
import { decodeHtmlEntities as decodeHtmlEntitiesExt } from "../utils/helpers.js";
import {
  authenticateToken,
  authenticateTokenOptional,
} from "../middleware/authMiddleware.js";
import { BASE_UPLOADS_URL } from "../config/constants.js";
const router = express.Router();

/* ===== Helpers: بدون تغییر در خروجی ===== */
const decodeHtmlEntities = decodeHtmlEntitiesExt;
const maybeDecode = (s) => (s && /&/.test(s) ? decodeHtmlEntities(s) : s);

const toArr = (v) => {
  if (v == null) return [];
  if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean);
  return String(v)
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
};

const booleanSearch = (q) => {
  const raw = Array.isArray(q) ? q.join(" ") : String(q || "");
  const tokens = raw
    .split(/[,\s]+/)
    .map((w) => w.trim())
    .filter(Boolean)
    .slice(0, 5);
  return tokens.length ? tokens.map((w) => `+${w}*`).join(" ") : null;
};

const LEVEL_CANON = (raw) => {
  const t = String(raw || "").toLowerCase();
  if (
    /\bph\.?d\.?\b/.test(t) ||
    t.includes("doctor of philosophy") ||
    /\bdphil\b/.test(t)
  )
    return "PhD";
  if (
    t.includes("master") ||
    /\bm\.?s\.?c?(\b|$)/.test(t) ||
    /\bmeng\b/.test(t) ||
    /\bmtech\b/.test(t) ||
    /\bma\b/.test(t)
  )
    return "Master";
  if (
    t.includes("bachelor") ||
    /\bb\.?s\.?c?(\b|$)/.test(t) ||
    /\bbeng\b/.test(t) ||
    /\bbtech\b/.test(t) ||
    /\bba\b/.test(t)
  )
    return "Bachelor";
  return "Bachelor";
};
const LEVEL_LABEL = {
  Bachelor: "Bachelor (BSc)",
  Master: "Master (M.S.)",
  PhD: "Ph.D. (Doctor of Philosophy)",
};
const LEVEL_ORDER = { bachelor: 0, master: 1, phd: 2 };
const sortByLevel = (a, b) =>
  (LEVEL_ORDER[String(a.level || "").toLowerCase()] ?? 99) -
  (LEVEL_ORDER[String(b.level || "").toLowerCase()] ?? 99);

const cache = new Map();
const now = () => Date.now();
const getCache = (k) => {
  const e = cache.get(k);
  if (!e) return;
  if (e.exp < now()) {
    cache.delete(k);
    return;
  }
  return e.value;
};
const setCache = (k, v, ttlMs) =>
  cache.set(k, { value: v, exp: now() + ttlMs });

/* --------------------------- Helpers --------------------------- */

const utf8len = (str) => Buffer.byteLength(String(str ?? ""), "utf8");

/** PHP serialize: a:N:{ i:k;s:L:"val"; ... }  for array<string ids> */
function parsePhpArrayOfIds(serialized) {
  const out = [];
  if (!serialized || typeof serialized !== "string") return out;
  const m = serialized.match(/^a:\d+:{([\s\S]*)}$/);
  if (!m) return out;
  const body = m[1];
  const re = /i:\d+;s:(\d+):"(\d+)";/g;
  let mm;
  while ((mm = re.exec(body)) !== null) out.push(mm[2]);
  return out;
}
function serializePhpArrayOfIds(ids = []) {
  let body = "";
  ids.forEach((id, idx) => {
    const s = String(id);
    body += `i:${idx};s:${s.length}:"${s}";`;
  });
  return `a:${ids.length}:{${body}}`;
}

/** PHP serialize: a:N:{ i:id;s:L:"value"; ... }  for map<number -> string> */
function parsePhpMap(serialized) {
  const out = {};
  if (!serialized || typeof serialized !== "string") return out;
  const m = serialized.match(/^a:\d+:{([\s\S]*)}$/);
  if (!m) return out;
  const body = m[1];
  const re = /i:(\d+);s:(\d+):"([\s\S]*?)";/g;
  let mm;
  while ((mm = re.exec(body)) !== null) {
    out[mm[1]] = mm[3];
  }
  return out;
}
function serializePhpMap(obj = {}) {
  const entries = Object.entries(obj);
  const parts = entries.map(([id, val]) => {
    const v = String(val ?? "");
    return `i:${Number(id)};s:${utf8len(v)}:"${v}";`;
  });
  return `a:${entries.length}:{${parts.join("")}}`;
}

/** Parse WP serialized array like: a:N:{ i:x;s:L:"value"; ... } used in faculty.research_area */
function parseResearchArea(serialized) {
  const out = [];
  if (!serialized || typeof serialized !== "string") return out;
  const re = /s:\d+:"(.*?)";/g;
  let m;
  while ((m = re.exec(serialized)) !== null) {
    out.push(m[1]);
  }
  return out;
}

/* --------------------------- Router --------------------------- */
//find ?guest=1
function allowGuestOrAuth(req, res, next) {
  const isGuest = req.query.guest === "1" || req.query.guest === "true";
  if (isGuest) {
    // نشانه: کاربر مهمان است و req.user نخواهد داشت
    return next();
  }
  return authenticateToken(req, res, next);
}

/* Utility: get userId by JWT email */
async function getUserIdByEmail(email) {
  const [rows] = await db.query(
    `SELECT ID FROM qacom_wp_users WHERE user_email = ? LIMIT 1`,
    [email]
  );
  return rows?.[0]?.ID ?? null;
}

/* Utility: fetch attachment URL when image is numeric post ID */
async function getAttachmentUrlByPostId(postId) {
  const [rows] = await db.query(
    `
    SELECT CONCAT(?, pm.meta_value) AS url
    FROM qacom_wp_postmeta pm
    WHERE pm.post_id = ? AND pm.meta_key = '_wp_attached_file'
    LIMIT 1
    `,
    [
      BASE_UPLOADS_URL.endsWith("/")
        ? BASE_UPLOADS_URL
        : BASE_UPLOADS_URL + "/",
      postId,
    ]
  );
  return rows?.[0]?.url || null;
}

router.get("/find", authenticateTokenOptional, async (req, res) => {
  try {
    res.set({
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    });

    const page = parseInt(req.query.page) || 1;
    const askedLimit = parseInt(req.query.limit) || 10;

    // تشخیص مهمان: اگر allowGuestOrAuth عبور داده و user ندارد یا پارامتر guest آمده
    const isGuestParam = req.query.guest === "1" || req.query.guest === "true";
    const isGuest = isGuestParam || !(req.user && req.user.email);

    // سقف امن برای مهمان (۱۰) و برای لاگین (۵۰) — رفتار سابق حفظ شد
    const MAX_LIMIT = isGuest ? 10 : 50;
    const limit = Math.min(askedLimit, MAX_LIMIT);
    const offset = (page - 1) * limit;

    // Light mode برای صفحات بعدی (مثل قبل)
    const light =
      req.query.light === "1" || req.query.light === "true" || page > 1;

    /* ------------------ userPreferences: فقط برای لاگین و صفحه ۱ ------------------ */
    let userPreferences = {
      country: null,
      level: null,
      program: null,
      areaOfStudy: null,
      countryDetails: null,
      availableCountries: [],
      availableAreasOfStudy: [],
      availablePrograms: [],
    };

    let programAreaId = null;

    if (!isGuest && !light) {
      // رفتار سابق: از پروفایل کاربر بخوان
      const { email } = req.user;
      const [userData] = await db.query(
        `SELECT ID FROM qacom_wp_users WHERE user_email = ? LIMIT 1`,
        [email]
      );
      if (!userData?.length) {
        return res.status(404).json({ error: "User not found" });
      }
      const userId = userData[0].ID;

      const cacheKey = `userPrefs:${userId}:v1`;
      const cached = getCache(cacheKey);
      if (cached) {
        userPreferences = cached;
      } else {
        const preferredMetaKeys = [
          "application_country",
          "application_level",
          "application_program",
        ];
        const [userMetas] = await db.query(
          `SELECT meta_key, meta_value FROM qacom_wp_usermeta WHERE user_id = ? AND meta_key IN (?)`,
          [userId, preferredMetaKeys]
        );
        for (const m of userMetas) {
          if (m.meta_key === "application_country")
            userPreferences.country = m.meta_value;
          if (m.meta_key === "application_level")
            userPreferences.level = m.meta_value;
          if (m.meta_key === "application_program")
            userPreferences.program = m.meta_value;
        }

        const programInfoPromise = (async () => {
          if (!userPreferences.program) return null;
          const [rows] = await db.query(
            `
            SELECT 
              p.id,
              COALESCE(p.category_id, tt_rel.term_id) AS category_id,
              COALESCE(t_cat.name, t_rel_cat.name)    AS category_name
            FROM qacom_wp_apply_programs p
            LEFT JOIN qacom_wp_terms t_cat ON p.category_id = t_cat.term_id
            LEFT JOIN qacom_wp_term_relationships tr ON p.id = tr.object_id
            LEFT JOIN qacom_wp_term_taxonomy tt_rel
              ON tr.term_taxonomy_id = tt_rel.term_taxonomy_id
             AND tt_rel.taxonomy = 'program_category'
            LEFT JOIN qacom_wp_terms t_rel_cat ON tt_rel.term_id = t_rel_cat.term_id
            WHERE p.id = ? LIMIT 1
          `,
            [userPreferences.program]
          );
          if (!rows?.length) return null;
          return {
            id: rows[0].category_id,
            name: decodeHtmlEntities(rows[0].category_name),
          };
        })();

        const countriesPromise = db.query(`
          SELECT t.term_id AS country, t.name
          FROM qacom_wp_term_taxonomy tt
          JOIN qacom_wp_terms t ON t.term_id = tt.term_id
          WHERE tt.taxonomy = 'place' AND tt.parent = 0
        `);
        const categoriesPromise = db.query(`
          SELECT t.term_id, t.name
          FROM qacom_wp_term_taxonomy pr
          JOIN qacom_wp_terms t ON t.term_id = pr.term_id
          WHERE pr.taxonomy = 'program_category'
          ORDER BY t.name ASC
        `);

        const areaIdsFromQuery = toArr(req.query.areaOfStudy);
        const programAreaIdFromProfile = (await programInfoPromise)?.id;
        programAreaId = areaIdsFromQuery[0] || programAreaIdFromProfile || null;

        const programsListPromise = db.query(
          `
          SELECT p.id, p.name
          FROM qacom_wp_apply_programs p
          ${programAreaId ? `WHERE p.category_id = ?` : ``}
          ORDER BY p.name ASC
        `,
          programAreaId ? [programAreaId] : []
        );

        const [[countriesData], [categoriesData], [programsData], programInfo] =
          await Promise.all([
            countriesPromise,
            categoriesPromise,
            programsListPromise,
            programInfoPromise,
          ]);

        if (programInfo?.id)
          userPreferences.areaOfStudy = {
            id: programInfo.id,
            name: programInfo.name,
          };

        if (userPreferences.country) {
          const [cd] = await db.query(
            `SELECT t.term_id, t.name FROM qacom_wp_terms t WHERE t.term_id = ? LIMIT 1`,
            [userPreferences.country]
          );
          if (cd?.length)
            userPreferences.countryDetails = {
              id: cd[0].term_id,
              name: cd[0].name,
            };
        }
        if (countriesData?.length) {
          userPreferences.availableCountries = countriesData.map((c) => ({
            country: c.country,
            name: c.name,
          }));
        }
        if (categoriesData?.length) {
          userPreferences.availableAreasOfStudy = categoriesData.map((c) => ({
            id: c.term_id,
            name: decodeHtmlEntities(c.name),
          }));
        }
        if (programsData?.length) {
          userPreferences.availablePrograms = programsData.map((p) => ({
            id: p.id,
            name: decodeHtmlEntities(p.name),
          }));
        }

        setCache(cacheKey, userPreferences, 5 * 60_000);
      }
    } else {
      // Guest یا light → فقط از query
      const areaIdsFromQuery = toArr(req.query.areaOfStudy);
      programAreaId = areaIdsFromQuery[0] || null;
    }

    /* --------------------------- فیلترها --------------------------- */
    const filters = (() => {
      const base = {
        country: null,
        state: [],
        areaOfStudy: [],
        program: [],
        school: [],
        researchInterest: [],
        title: null,
      };

      // رفتار سابق برای لاگین: اگر light=false، از پروفایل هم کمک بگیر
      base.country = isGuest
        ? req.query.country || null
        : (light
            ? req.query.country
            : req.query.country || userPreferences.country) || null;

      const areaArr = toArr(req.query.areaOfStudy);
      if (areaArr.length) base.areaOfStudy = areaArr;
      else if (!isGuest && !light && userPreferences.areaOfStudy?.id) {
        base.areaOfStudy = [String(userPreferences.areaOfStudy.id)];
      }

      base.program = toArr(req.query.program);
      base.school = toArr(req.query.school);
      base.state = toArr(req.query.state);
      base.researchInterest = toArr(req.query.researchInterest);
      base.title = req.query.title || null;

      return base;
    })();

    const bsResearch = booleanSearch(filters.researchInterest);

    const whereParts = [`pf.status = 'publish'`];
    const idsParams = [];

    // Geo
    const existsForGeo =
      filters.country || filters.state.length
        ? `EXISTS (
             SELECT 1 FROM qacom_wp_apply_schools s
             WHERE s.id = pf.school_id
               ${filters.country ? `AND s.country = ?` : ``}
               ${filters.state.length ? `AND s.state IN (?)` : ``}
           )`
        : `1`;
    whereParts.push(existsForGeo);
    if (filters.country) idsParams.push(filters.country);
    if (filters.state.length) idsParams.push(filters.state);

    // Area of Study
    const existsForArea = filters.areaOfStudy.length
      ? `EXISTS (
           SELECT 1 FROM qacom_wp_apply_programs p
           WHERE p.id = pf.program_id
             AND p.category_id IN (?)
         )`
      : `1`;
    whereParts.push(existsForArea);
    if (filters.areaOfStudy.length) idsParams.push(filters.areaOfStudy);

    // Program
    if (filters.program.length) {
      whereParts.push(`pf.program_id IN (?)`);
      idsParams.push(filters.program);
    }

    // School
    if (filters.school.length === 1) {
      whereParts.push(`pf.school_id = ?`);
      idsParams.push(filters.school[0]);
    } else if (filters.school.length > 1) {
      const ph = filters.school.map(() => "?").join(",");
      whereParts.push(`pf.school_id IN (${ph})`);
      idsParams.push(...filters.school);
    }

    // Title
    if (filters.title) {
      whereParts.push(`pf.title = ?`);
      idsParams.push(filters.title);
    }

    // Research Interest
    if (bsResearch) {
      whereParts.push(`MATCH(pf.research_area) AGAINST(? IN BOOLEAN MODE)`);
      idsParams.push(bsResearch);
    }

    const baseIdsPromise = db.query(
      `
      SELECT pf.ID
      FROM qacom_wp_apply_faculty pf
      WHERE ${whereParts.join(" AND ")}
      ORDER BY pf.date ASC, pf.name ASC
      LIMIT ? OFFSET ?
      `,
      [...idsParams, limit, offset]
    );

    const totalPromise = db.query(
      `
      SELECT COUNT(*) AS total
      FROM qacom_wp_apply_faculty pf
      WHERE ${whereParts.join(" AND ")}
      `,
      idsParams
    );

    const [[baseProfessors], [totalRes]] = await Promise.all([
      baseIdsPromise,
      totalPromise,
    ]);

    const professorIds = baseProfessors.map((r) => r.ID);

    if (!professorIds.length) {
      const payload = {
        userPreferences: undefined, // برای مهمان و light
        professors: [],
        currentPage: page,
        totalPages: 0,
        totalProfessors: 0,
        researchInterests: [],
        categoryPrograms: {
          groups: { Bachelor: [], Master: [], PhD: [] },
          flat: [],
          all: [],
        },
      };
      res.setHeader("Content-Type", "application/json");
      return res.send(JSON.stringify(payload));
    }

    const detailsPromise = db.query(
      `
      SELECT DISTINCT 
        pf.ID, pf.name, pf.title, pf.email, pf.program_id, pf.school_id,
        pf.research_area, pf.link, pf.department_id, pf.google_scholar,
        pf.website, pf.linkedin, pf.image, pf.status, pf.creator_id, pf.date,
        p.name  AS program_name,
        t_cat.name     AS area_of_study_name,
        t_country.name AS country_name,
        s.name AS school_name, s.state, s.country,
        CASE
          WHEN pm.meta_value IS NOT NULL
          THEN CONCAT(?, pm.meta_value)
          ELSE NULL
        END AS image_url
      FROM qacom_wp_apply_faculty pf
      LEFT JOIN qacom_wp_apply_programs p ON pf.program_id = p.id
      LEFT JOIN qacom_wp_terms t_cat     ON p.category_id = t_cat.term_id
      LEFT JOIN qacom_wp_apply_schools s ON pf.school_id = s.id
      LEFT JOIN qacom_wp_terms t_country ON s.country   = t_country.term_id
      LEFT JOIN qacom_wp_posts imgp ON imgp.id = pf.image
      LEFT JOIN qacom_wp_postmeta pm ON pm.post_id = imgp.id AND pm.meta_key = '_wp_attached_file'
      WHERE pf.ID IN (?)
      ORDER BY pf.date ASC, pf.name ASC
      `,
      [
        BASE_UPLOADS_URL.endsWith("/")
          ? BASE_UPLOADS_URL
          : BASE_UPLOADS_URL + "/",
        professorIds,
      ]
    );

    const researchPromise = db.query(
      `
      SELECT ID, research_area
      FROM qacom_wp_apply_faculty
      WHERE ID IN (?)
        AND research_area IS NOT NULL AND research_area <> ''
        ${
          bsResearch
            ? `AND MATCH(research_area) AGAINST(? IN BOOLEAN MODE)`
            : ``
        }
      `,
      bsResearch ? [professorIds, bsResearch] : [professorIds]
    );

    const relRowsPromise = db.query(
      `
      SELECT 
        rel.school_id,
        rel.program_id,
        rel.ID AS row_id,
        rel.level,
        rel.type,
        p.name AS program_name
      FROM qacom_wp_apply_programs_relationship rel
      JOIN qacom_wp_apply_programs p ON p.id = rel.program_id
      JOIN (
        SELECT DISTINCT school_id, program_id
        FROM qacom_wp_apply_faculty
        WHERE ID IN (?)
      ) fp ON fp.school_id = rel.school_id AND fp.program_id = rel.program_id
      ORDER BY FIELD(LOWER(rel.level),'bachelor','master','phd'), p.name ASC
      `,
      [professorIds]
    );

    const [[professorsRows], [riRows], [relRows]] = await Promise.all([
      detailsPromise,
      researchPromise,
      relRowsPromise,
    ]);

    // Research interests unique
    const interests = [];
    const re = /s:\d+:"(.*?)";/g;
    for (const ri of riRows) {
      let m;
      const s = ri.research_area || "";
      while ((m = re.exec(s)) !== null) interests.push(m[1].trim());
    }
    const researchInterests = Array.from(new Set(interests)).sort();

    // category programs
    const categoryForPrograms =
      (filters.areaOfStudy.length ? filters.areaOfStudy[0] : null) ||
      (!isGuest &&
        userPreferences?.areaOfStudy &&
        userPreferences.areaOfStudy.id) ||
      null;

    let categoryProgramsAll = [];
    let categoryProgramsGrouped = { Bachelor: [], Master: [], PhD: [] };
    let categoryProgramsFlat = [];

    if (categoryForPrograms) {
      const key = `catProgs:${categoryForPrograms}:v1`;
      let cached = getCache(key);
      if (!cached) {
        const [catProgs] = await db.query(
          `
          SELECT 
            p.id, 
            p.name,
            rel.level AS program_level,
            rel.type  AS program_type
          FROM qacom_wp_apply_programs p
          LEFT JOIN (
            SELECT 
              program_id,
              SUBSTRING_INDEX(
                GROUP_CONCAT(level ORDER BY FIELD(LOWER(level),'bachelor','master','phd') SEPARATOR ','), ',', 1
              ) AS level,
              SUBSTRING_INDEX(
                GROUP_CONCAT(\`type\` ORDER BY \`type\` SEPARATOR ','), ',', 1
              ) AS \`type\`
            FROM qacom_wp_apply_programs_relationship
            GROUP BY program_id
          ) rel ON rel.program_id = p.id
          WHERE p.category_id = ?
          ORDER BY p.name ASC
          `,
          [categoryForPrograms]
        );
        cached = catProgs;
        setCache(key, cached, 10 * 60_000);
      }

      categoryProgramsAll = cached.map((r) => {
        const canon = LEVEL_CANON(r.program_level || r.name);
        return {
          id: r.id,
          name: decodeHtmlEntities(r.name),
          level: canon,
          level_label: LEVEL_LABEL[canon],
          type: r.program_type || null,
          status: "available",
        };
      });

      for (const row of categoryProgramsAll) {
        const bucket = categoryProgramsGrouped[row.level];
        if (bucket.length < 3) bucket.push(row);
      }

      categoryProgramsFlat = [
        ...categoryProgramsGrouped.Bachelor,
        ...categoryProgramsGrouped.Master,
        ...categoryProgramsGrouped.PhD,
      ];
    }

    const keyOf = (sId, pId) => `${sId}_${pId}`;
    const relMap = new Map();
    for (const r of relRows) {
      const k = keyOf(r.school_id, r.program_id);
      if (!relMap.has(k)) relMap.set(k, []);
      relMap.get(k).push({
        row_id: r.row_id,
        program_id: r.program_id,
        program_name: r.program_name,
        level: r.level,
        type: r.type,
      });
    }

    const professors = professorsRows.map((p) => {
      let imageUrl = p.image;
      if (
        typeof p.image === "string" &&
        !isNaN(p.image) &&
        String(p.image).trim() !== ""
      ) {
        imageUrl = p.image_url || null;
      } else if (!imageUrl || String(imageUrl).trim() === "") {
        imageUrl = null;
      }

      const rels = relMap.get(keyOf(p.school_id, p.program_id)) || [];
      const programs = rels
        .map((r) => {
          const canon = LEVEL_CANON(r.level || "");
          return {
            id: String(r.row_id),
            name: maybeDecode(r.program_name || ""),
            level: canon,
            level_label: LEVEL_LABEL[canon],
            type: r.type || null,
            status: "available",
          };
        })
        .sort((a, b) => {
          const byLevel = sortByLevel(a, b);
          return byLevel !== 0 ? byLevel : a.name.localeCompare(b.name);
        });

      return {
        ...p,
        image: imageUrl,
        name: maybeDecode(p.name),
        title: p.title ? maybeDecode(p.title) : null,
        program_name: p.program_name ? maybeDecode(p.program_name) : null,
        area_of_study_name: p.area_of_study_name
          ? maybeDecode(p.area_of_study_name)
          : null,
        country_name: p.country_name ? maybeDecode(p.country_name) : null,
        school_name: p.school_name ? maybeDecode(p.school_name) : null,
        programs,
      };
    });

    const totalProfessors = totalRes[0]?.total || 0;
    const totalPages = Math.ceil(totalProfessors / limit);

    const payload = {
      userPreferences: isGuest
        ? undefined
        : light
        ? undefined
        : userPreferences,
      professors,
      currentPage: page,
      totalPages,
      totalProfessors,
      researchInterests,
      categoryPrograms: {
        groups: categoryProgramsGrouped,
        flat: categoryProgramsFlat,
        all: categoryProgramsAll,
      },
    };

    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(payload));
  } catch (error) {
    console.error("Error in /find professors:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ------------------------------------------------------------------
   POST /favorites/professors  { professorId, action: 'add'|'remove' }
-------------------------------------------------------------------*/
router.post("/favorites", authenticateToken, async (req, res) => {
  try {
    const { professorId, action } = req.body || {};
    if (!professorId || !["add", "remove"].includes(action)) {
      return res.status(400).json({ error: "Invalid request parameters" });
    }

    const userId = await getUserIdByEmail(req.user?.email);
    if (!userId) return res.status(404).json({ error: "User not found" });

    // ensure professor exists
    const [pRows] = await db.query(
      `SELECT ID, name FROM qacom_wp_apply_faculty WHERE ID = ? LIMIT 1`,
      [professorId]
    );
    if (!pRows?.length)
      return res.status(404).json({ error: "Professor not found" });

    // read meta
    const [metaRows] = await db.query(
      `SELECT meta_value FROM qacom_wp_usermeta WHERE user_id = ? AND meta_key = 'my_professors_list'`,
      [userId]
    );
    let favorites = parsePhpArrayOfIds(metaRows?.[0]?.meta_value || "");

    const idStr = String(professorId);
    if (action === "add") {
      if (!favorites.includes(idStr)) favorites.push(idStr);
    } else {
      favorites = favorites.filter((x) => x !== idStr);
    }

    // write back
    const serialized = serializePhpArrayOfIds(favorites);
    const [existsRows] = await db.query(
      `SELECT umeta_id FROM qacom_wp_usermeta WHERE user_id = ? AND meta_key = 'my_professors_list'`,
      [userId]
    );
    if (existsRows?.length) {
      await db.query(
        `UPDATE qacom_wp_usermeta SET meta_value = ? WHERE user_id = ? AND meta_key = 'my_professors_list'`,
        [serialized, userId]
      );
    } else {
      await db.query(
        `INSERT INTO qacom_wp_usermeta (user_id, meta_key, meta_value) VALUES (?,?,?)`,
        [userId, "my_professors_list", serialized]
      );
    }

    return res.json({
      success: true,
      data:
        action === "add"
          ? { action: "add", count: favorites.length }
          : "remove",
      favorites,
    });
  } catch (err) {
    console.error("favorites/professors error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ------------------------------------------------------------------
   GET /favorites/professors  -> { favorites: ["12","45",...] }
-------------------------------------------------------------------*/
router.get("/favorites", authenticateToken, async (req, res) => {
  try {
    const userId = await getUserIdByEmail(req.user?.email);
    if (!userId) return res.status(404).json({ error: "User not found" });

    const [metaRows] = await db.query(
      `SELECT meta_value FROM qacom_wp_usermeta WHERE user_id = ? AND meta_key = 'my_professors_list'`,
      [userId]
    );
    let favorites = parsePhpArrayOfIds(metaRows?.[0]?.meta_value || "");
    favorites = favorites.sort((a, b) => Number(a) - Number(b));
    res.json({ favorites });
  } catch (err) {
    console.error("get favorites/professors error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ------------------------------------------------------------------
   GET /my-professors   -> full list for the page/cards
-------------------------------------------------------------------*/
router.get("/my-professors", authenticateToken, async (req, res) => {
  try {
    const { email } = req.user || {};
    const userId = await getUserIdByEmail(email);
    if (!userId) return res.status(404).json({ error: "User not found" });

    // read three metas
    const [metaRows] = await db.query(
      `
      SELECT meta_key, meta_value
      FROM qacom_wp_usermeta
      WHERE user_id = ? AND meta_key IN ('my_professors_list','apply_professor_status','apply_professor_response')
      `,
      [userId]
    );

    const meta = Object.fromEntries(
      metaRows.map((r) => [r.meta_key, r.meta_value])
    );
    const ids = parsePhpArrayOfIds(meta["my_professors_list"] || "");
    const statusMap = parsePhpMap(meta["apply_professor_status"] || "");
    const responseMap = parsePhpMap(meta["apply_professor_response"] || "");

    if (!ids.length) {
      return res.json({ professors: [] });
    }

    // details for professors (bulk)
    const [[profRows]] = await Promise.all([
      db.query(
        `
        SELECT DISTINCT 
          pf.ID, pf.name, pf.title, pf.email, pf.program_id, pf.school_id,
          pf.research_area, pf.link, pf.google_scholar, pf.website, pf.linkedin, pf.image,
          s.name AS school_name, s.image AS school_image
        FROM qacom_wp_apply_faculty pf
        LEFT JOIN qacom_wp_apply_schools s ON s.id = pf.school_id
        WHERE pf.ID IN (?)
        ORDER BY FIELD(pf.ID, ${ids.map(() => "?").join(",")})
        `,
        [ids, ...ids] // keep ordering same as ids
      ),
    ]);

    // programs for all (same trick as در /find)
    const [relRows] = await db.query(
      `
      SELECT 
        rel.school_id,
        rel.program_id,
        rel.ID AS row_id,
        rel.level,
        rel.type,
        p.name AS program_name
      FROM qacom_wp_apply_programs_relationship rel
      JOIN qacom_wp_apply_programs p ON p.id = rel.program_id
      JOIN (
        SELECT DISTINCT school_id, program_id
        FROM qacom_wp_apply_faculty
        WHERE ID IN (?)
      ) fp ON fp.school_id = rel.school_id AND fp.program_id = rel.program_id
      ORDER BY FIELD(LOWER(rel.level),'bachelor','master','phd'), p.name ASC
      `,
      [ids]
    );

    const relMap = new Map();
    const keyOf = (sId, pId) => `${sId}_${pId}`;
    for (const r of relRows) {
      const k = keyOf(r.school_id, r.program_id);
      if (!relMap.has(k)) relMap.set(k, []);
      relMap.get(k).push({
        id: String(r.row_id),
        name: maybeDecode(r.program_name || ""),
        level: LEVEL_CANON(r.level || ""),
        level_label: LEVEL_LABEL[LEVEL_CANON(r.level || "")],
        type: r.type || null,
        status: "available",
      });
    }

    // build payload
    const professors = [];
    for (const p of profRows) {
      // professor image
      let imageUrl = null;
      if (p.image != null && String(p.image).trim() !== "") {
        if (!isNaN(p.image)) {
          imageUrl = await getAttachmentUrlByPostId(p.image);
        } else {
          imageUrl = String(p.image);
        }
      }

      // school image
      let schoolImage = null;
      if (p.school_image != null && String(p.school_image).trim() !== "") {
        if (!isNaN(p.school_image)) {
          schoolImage = await getAttachmentUrlByPostId(p.school_image);
        } else {
          schoolImage = String(p.school_image);
        }
      }

      const research = parseResearchArea(p.research_area || "");
      const research_first3 = research.slice(0, 3);
      const research_rest = research.slice(3);

      const programs =
        relMap.get(keyOf(p.school_id, p.program_id))?.sort((a, b) => {
          const byLevel = sortByLevel(a, b);
          return byLevel !== 0 ? byLevel : a.name.localeCompare(b.name);
        }) || [];

      professors.push({
        ID: p.ID,
        name: maybeDecode(p.name),
        title: p.title ? maybeDecode(p.title) : null,
        email: p.email || null,
        image: imageUrl,
        links: {
          profile: p.link || null,
          scholar: p.google_scholar || null,
          website: p.website || null,
          linkedin: p.linkedin || null,
        },
        school: {
          id: p.school_id,
          name: p.school_name ? maybeDecode(p.school_name) : null,
          image: schoolImage,
        },
        program_id: p.program_id,
        research_first3,
        research_rest,
        status: statusMap[p.ID] || "Considered",
        response: responseMap[p.ID] || "",
        programs,
      });
    }

    res.json({ professors });
  } catch (err) {
    console.error("GET /my-professors error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ------------------------------------------------------------------
   POST /my-professors/save   { statuses:{id:status}, responses:{id:text} }
   - merges into existing meta maps and writes back (PHP-serialized)
-------------------------------------------------------------------*/
router.post("/my-professors/save", authenticateToken, async (req, res) => {
  try {
    const userId = await getUserIdByEmail(req.user?.email);
    if (!userId) return res.status(404).json({ error: "User not found" });

    const { statuses = {}, responses = {} } = req.body || {};

    // read current metas
    const [metaRows] = await db.query(
      `
      SELECT meta_key, meta_value
      FROM qacom_wp_usermeta
      WHERE user_id = ? AND meta_key IN ('apply_professor_status','apply_professor_response')
      `,
      [userId]
    );
    const cur = Object.fromEntries(
      metaRows.map((r) => [r.meta_key, r.meta_value])
    );
    const statusMap = parsePhpMap(cur["apply_professor_status"] || {});
    const responseMap = parsePhpMap(cur["apply_professor_response"] || {});

    // merge
    for (const [id, st] of Object.entries(statuses || {})) {
      if (st == null) continue;
      statusMap[id] = String(st);
    }
    for (const [id, tx] of Object.entries(responses || {})) {
      if (tx == null) continue;
      responseMap[id] = String(tx);
    }

    // write back
    const pairs = [
      ["apply_professor_status", serializePhpMap(statusMap)],
      ["apply_professor_response", serializePhpMap(responseMap)],
    ];

    for (const [meta_key, meta_value] of pairs) {
      const [exists] = await db.query(
        `SELECT umeta_id FROM qacom_wp_usermeta WHERE user_id = ? AND meta_key = ?`,
        [userId, meta_key]
      );
      if (exists?.length) {
        await db.query(
          `UPDATE qacom_wp_usermeta SET meta_value = ? WHERE user_id = ? AND meta_key = ?`,
          [meta_value, userId, meta_key]
        );
      } else {
        await db.query(
          `INSERT INTO qacom_wp_usermeta (user_id, meta_key, meta_value) VALUES (?,?,?)`,
          [userId, meta_key, meta_value]
        );
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error("POST /my-professors/save error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

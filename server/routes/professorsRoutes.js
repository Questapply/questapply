// import express from "express";
// import db from "../config/db.config.js";
// import { log } from "console";
// import { decodeHtmlEntities } from "../utils/helpers.js";
// import { countryMap } from "../config/constants.js";
// import { authenticateToken } from "../middleware/authMiddleware.js";
// const router = express.Router();

// REPLACE your existing "/find" handler with this one
// router.get("/find", authenticateToken, async (req, res) => {
//   try {
//     res.set({
//       "Cache-Control": "no-cache, no-store, must-revalidate",
//       Pragma: "no-cache",
//       Expires: "0",
//     });

//     // --- helpers ---
//     const decodeHtmlEntities = (s = "") =>
//       s
//         .replace(/&amp;/g, "&")
//         .replace(/&lt;/g, "<")
//         .replace(/&gt;/g, ">")
//         .replace(/&#039;/g, "'")
//         .replace(/&quot;/g, '"');

//     const booleanSearch = (q) =>
//       q
//         ? String(q)
//             .trim()
//             .split(/\s+/)
//             .slice(0, 5)
//             .map((w) => `+${w}*`)
//             .join(" ")
//         : null;

//     // نرمال‌سازی سطح
//     const LEVEL_CANON = (raw) => {
//       const t = String(raw || "").toLowerCase();
//       if (
//         /\bph\.?d\.?\b/.test(t) ||
//         t.includes("doctor of philosophy") ||
//         /\bdphil\b/.test(t)
//       )
//         return "PhD";
//       if (
//         t.includes("master") ||
//         /\bm\.?s\.?c?(\b|$)/.test(t) ||
//         /\bmeng\b/.test(t) ||
//         /\bmtech\b/.test(t) ||
//         /\bma\b/.test(t)
//       )
//         return "Master";
//       if (
//         t.includes("bachelor") ||
//         /\bb\.?s\.?c?(\b|$)/.test(t) ||
//         /\bbeng\b/.test(t) ||
//         /\bbtech\b/.test(t) ||
//         /\bba\b/.test(t)
//       )
//         return "Bachelor";
//       return "Bachelor";
//     };
//     const LEVEL_LABEL = {
//       Bachelor: "Bachelor (BSc)",
//       Master: "Master (M.S.)",
//       PhD: "Ph.D. (Doctor of Philosophy)",
//     };
//     const LEVEL_ORDER = { bachelor: 0, master: 1, phd: 2 };
//     const sortByLevel = (a, b) =>
//       (LEVEL_ORDER[String(a.level || "").toLowerCase()] ?? 99) -
//       (LEVEL_ORDER[String(b.level || "").toLowerCase()] ?? 99);

//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const offset = (page - 1) * limit;

//     // حالت سبک برای Load more: داده‌های ثابت فقط صفحهٔ اول
//     const light =
//       req.query.light === "1" || req.query.light === "true" || page > 1;

//     // ---- user ----
//     const { email } = req.user;
//     const [userData] = await db.query(
//       `SELECT ID FROM qacom_wp_users WHERE user_email = ? LIMIT 1`,
//       [email]
//     );
//     if (!userData?.length)
//       return res.status(404).json({ error: "User not found" });
//     const userId = userData[0].ID;

//     // -------- userPreferences & options (only page 1) --------
//     let userPreferences = {
//       country: null,
//       level: null,
//       program: null,
//       areaOfStudy: null, // {id,name}
//       countryDetails: null,
//       availableCountries: [],
//       availableAreasOfStudy: [],
//       availablePrograms: [],
//     };

//     if (!light) {
//       const preferredMetaKeys = [
//         "application_country",
//         "application_level",
//         "application_program",
//       ];
//       const [userMetas] = await db.query(
//         `SELECT meta_key, meta_value FROM qacom_wp_usermeta WHERE user_id = ? AND meta_key IN (?)`,
//         [userId, preferredMetaKeys]
//       );
//       for (const m of userMetas) {
//         if (m.meta_key === "application_country")
//           userPreferences.country = m.meta_value;
//         if (m.meta_key === "application_level")
//           userPreferences.level = m.meta_value;
//         if (m.meta_key === "application_program")
//           userPreferences.program = m.meta_value;
//       }

//       const programInfoPromise = (async () => {
//         if (!userPreferences.program) return null;
//         const [rows] = await db.query(
//           `
//           SELECT
//             p.id,
//             COALESCE(p.category_id, tt_rel.term_id) AS category_id,
//             COALESCE(t_cat.name, t_rel_cat.name)    AS category_name
//           FROM qacom_wp_apply_programs p
//           LEFT JOIN qacom_wp_terms t_cat ON p.category_id = t_cat.term_id
//           LEFT JOIN qacom_wp_term_relationships tr ON p.id = tr.object_id
//           LEFT JOIN qacom_wp_term_taxonomy tt_rel
//             ON tr.term_taxonomy_id = tt_rel.term_taxonomy_id
//            AND tt_rel.taxonomy = 'program_category'
//           LEFT JOIN qacom_wp_terms t_rel_cat ON tt_rel.term_id = t_rel_cat.term_id
//           WHERE p.id = ? LIMIT 1
//         `,
//           [userPreferences.program]
//         );
//         if (!rows?.length) return null;
//         return {
//           id: rows[0].category_id,
//           name: decodeHtmlEntities(rows[0].category_name),
//         };
//       })();

//       const countriesPromise = db.query(`
//         SELECT t.term_id AS country, t.name
//         FROM qacom_wp_term_taxonomy tt
//         JOIN qacom_wp_terms t ON t.term_id = tt.term_id
//         WHERE tt.taxonomy = 'place' AND tt.parent = 0
//       `);
//       const categoriesPromise = db.query(`
//         SELECT t.term_id, t.name
//         FROM qacom_wp_term_taxonomy pr
//         JOIN qacom_wp_terms t ON t.term_id = pr.term_id
//         WHERE pr.taxonomy = 'program_category'
//         ORDER BY t.name ASC
//       `);

//       const programAreaId =
//         req.query.areaOfStudy || (await programInfoPromise)?.id;
//       const programsListPromise = db.query(
//         `
//         SELECT p.id, p.name
//         FROM qacom_wp_apply_programs p
//         ${programAreaId ? `WHERE p.category_id = ?` : ``}
//         ORDER BY p.name ASC
//       `,
//         programAreaId ? [programAreaId] : []
//       );

//       const [[countriesData], [categoriesData], [programsData], programInfo] =
//         await Promise.all([
//           countriesPromise,
//           categoriesPromise,
//           programsListPromise,
//           programInfoPromise,
//         ]);

//       if (programInfo?.id)
//         userPreferences.areaOfStudy = {
//           id: programInfo.id,
//           name: programInfo.name,
//         };

//       if (userPreferences.country) {
//         const [cd] = await db.query(
//           `SELECT t.term_id, t.name FROM qacom_wp_terms t WHERE t.term_id = ? LIMIT 1`,
//           [userPreferences.country]
//         );
//         if (cd?.length)
//           userPreferences.countryDetails = {
//             id: cd[0].term_id,
//             name: cd[0].name,
//           };
//       }
//       if (countriesData?.length) {
//         userPreferences.availableCountries = countriesData.map((c) => ({
//           country: c.country,
//           name: c.name,
//         }));
//       }
//       if (categoriesData?.length) {
//         userPreferences.availableAreasOfStudy = categoriesData.map((c) => ({
//           id: c.term_id,
//           name: decodeHtmlEntities(c.name),
//         }));
//       }
//       if (programsData?.length) {
//         userPreferences.availablePrograms = programsData.map((p) => ({
//           id: p.id,
//           name: decodeHtmlEntities(p.name),
//         }));
//       }
//     }

//     // -------- filters --------
//     const filters = light
//       ? {
//           country: req.query.country || null,
//           areaOfStudy: req.query.areaOfStudy || null,
//           program: req.query.program || null,
//           researchInterest: req.query.researchInterest || null,
//           title: req.query.title || null,
//         }
//       : {
//           country: req.query.country || userPreferences.country,
//           areaOfStudy: req.query.areaOfStudy || userPreferences.areaOfStudy?.id,
//           program: req.query.program || null,
//           researchInterest: req.query.researchInterest || null,
//           title: req.query.title || null,
//         };

//     const ProfConditions = ["pf.status = 'publish'"];
//     const ProfParams = [];
//     if (filters.country) {
//       ProfConditions.push("s.country = ?");
//       ProfParams.push(filters.country);
//     }
//     if (filters.areaOfStudy) {
//       ProfConditions.push("p.category_id = ?");
//       ProfParams.push(filters.areaOfStudy);
//     }
//     if (filters.program) {
//       ProfConditions.push("pf.program_id = ?");
//       ProfParams.push(filters.program);
//     }
//     if (filters.title) {
//       ProfConditions.push("pf.title = ?");
//       ProfParams.push(filters.title);
//     }

//     // -------- page IDs (fast) --------
//     const [baseProfessors] = await db.query(
//       `
//       SELECT DISTINCT pf.ID
//       FROM qacom_wp_apply_faculty pf
//       LEFT JOIN qacom_wp_apply_programs p ON pf.program_id = p.id
//       LEFT JOIN qacom_wp_apply_schools  s ON pf.school_id  = s.id
//       WHERE ${ProfConditions.join(" AND ")}
//       ORDER BY pf.date ASC, pf.name ASC
//       LIMIT ? OFFSET ?
//     `,
//       [...ProfParams, limit, offset]
//     );
//     const professorIds = baseProfessors.map((r) => r.ID);

//     if (!professorIds.length) {
//       return res.json({
//         userPreferences: light ? undefined : userPreferences,
//         professors: [],
//         currentPage: page,
//         totalPages: 0,
//         totalProfessors: 0,
//         researchInterests: [],
//         categoryPrograms: {
//           groups: { Bachelor: [], Master: [], PhD: [] },
//           flat: [],
//           all: [],
//         },
//       });
//     }

//     // -------- details + research (parallel) --------
//     const detailsPromise = db.query(
//       `
//       SELECT DISTINCT
//         pf.ID, pf.name, pf.title, pf.email, pf.program_id, pf.school_id,
//         pf.research_area, pf.link, pf.department_id, pf.google_scholar,
//         pf.website, pf.linkedin, pf.image, pf.status, pf.creator_id, pf.date,
//         p.name  AS program_name,
//         t_cat.name     AS area_of_study_name,
//         t_country.name AS country_name,
//         s.name AS school_name, s.state, s.country
//       FROM qacom_wp_apply_faculty pf
//       LEFT JOIN qacom_wp_apply_programs p ON pf.program_id = p.id
//       LEFT JOIN qacom_wp_terms t_cat     ON p.category_id = t_cat.term_id
//       LEFT JOIN qacom_wp_apply_schools s ON pf.school_id = s.id
//       LEFT JOIN qacom_wp_terms t_country ON s.country   = t_country.term_id
//       WHERE pf.ID IN (?)
//       ORDER BY pf.date ASC, pf.name ASC
//       `,
//       [professorIds]
//     );

//     const researchPromise = db.query(
//       `
//       SELECT ID, research_area
//       FROM qacom_wp_apply_faculty
//       WHERE ID IN (?)
//         AND research_area IS NOT NULL AND research_area <> ''
//         ${
//           filters.researchInterest
//             ? `AND MATCH(research_area) AGAINST(? IN BOOLEAN MODE)`
//             : ``
//         }
//     `,
//       filters.researchInterest
//         ? [professorIds, booleanSearch(filters.researchInterest)]
//         : [professorIds]
//     );

//     // --- تمام برنامه‌های مرتبط با (school_id, program_id) همین اساتید ---
//     const relRowsPromise = db.query(
//       `
//       SELECT
//         rel.school_id,
//         rel.program_id,            -- 👈 لازم برای کلید
//         rel.ID AS row_id,          -- 👈 row_id (کلید ذخیره‌سازی)
//         rel.level,
//         rel.type,
//         p.name AS program_name
//       FROM qacom_wp_apply_programs_relationship rel
//       JOIN qacom_wp_apply_programs p ON p.id = rel.program_id
//       JOIN (
//         SELECT DISTINCT school_id, program_id
//         FROM qacom_wp_apply_faculty
//         WHERE ID IN (?)
//       ) fp ON fp.school_id = rel.school_id AND fp.program_id = rel.program_id
//        ORDER BY FIELD(LOWER(rel.level),'bachelor','master','phd'), p.name ASC
//       `,
//       [professorIds]
//     );

//     const [[professorsRows], [riRows], [relRows]] = await Promise.all([
//       detailsPromise,
//       researchPromise,
//       relRowsPromise,
//     ]);

//     // مپ‌کردن به کلید (school_id + program_id) → لیست روابط
//     const keyOf = (sId, pId) => `${sId}_${pId}`;
//     const relMap = new Map();
//     for (const r of relRows) {
//       const k = keyOf(r.school_id, r.program_id);
//       if (!relMap.has(k)) relMap.set(k, []);
//       relMap.get(k).push({
//         row_id: r.row_id,
//         program_id: r.program_id,
//         program_name: r.program_name,
//         level: r.level,
//         type: r.type,
//       });
//     }

//     // images (only numeric ids)
//     const imageIds = professorsRows
//       .map((p) =>
//         typeof p.image === "string" && !isNaN(p.image) && p.image.trim() !== ""
//           ? p.image
//           : null
//       )
//       .filter(Boolean);

//     let imageMap = new Map();
//     if (imageIds.length) {
//       const [atts] = await db.query(
//         `
//         SELECT pm.post_id, pm.meta_value
//         FROM qacom_wp_postmeta pm
//         JOIN qacom_wp_posts p ON pm.post_id = p.id
//         WHERE pm.meta_key = '_wp_attached_file' AND p.id IN (?)
//       `,
//         [imageIds]
//       );
//       for (const a of atts) {
//         imageMap.set(
//           a.post_id.toString(),
//           `https://questapply.com/wp-content/uploads/${a.meta_value}`
//         );
//       }
//     }

//     // unique research interests (for filter UI)
//     const interests = [];
//     const re = /s:\d+:"(.*?)";/g;
//     for (const ri of riRows) {
//       let m;
//       const s = ri.research_area || "";
//       while ((m = re.exec(s)) !== null) interests.push(m[1].trim());
//     }
//     const researchInterests = Array.from(new Set(interests)).sort();

//     // -------- category programs (نمایش ۳×۳ از کتگوری انتخابی) --------
//     const categoryForPrograms =
//       filters.areaOfStudy ||
//       (userPreferences?.areaOfStudy && userPreferences.areaOfStudy.id) ||
//       null;

//     let categoryProgramsAll = [];
//     let categoryProgramsGrouped = { Bachelor: [], Master: [], PhD: [] };
//     let categoryProgramsFlat = [];

//     if (categoryForPrograms) {
//       const [catProgs] = await db.query(
//         `
//         SELECT
//           p.id,
//           p.name,
//           rel.level AS program_level,
//           rel.type  AS program_type
//         FROM qacom_wp_apply_programs p
//         LEFT JOIN (
//           SELECT
//             program_id,
//             SUBSTRING_INDEX(
//               GROUP_CONCAT(level ORDER BY FIELD(LOWER(level),'bachelor','master','phd') SEPARATOR ','),
//               ',', 1
//             ) AS level,
//             SUBSTRING_INDEX(
//               GROUP_CONCAT(\`type\` ORDER BY \`type\` SEPARATOR ','),
//               ',', 1
//             ) AS \`type\`
//           FROM qacom_wp_apply_programs_relationship
//           GROUP BY program_id
//         ) rel ON rel.program_id = p.id
//         WHERE p.category_id = ?
//         ORDER BY p.name ASC
//         `,
//         [categoryForPrograms]
//       );

//       categoryProgramsAll = catProgs.map((r) => {
//         const canon = LEVEL_CANON(r.program_level || r.name);
//         return {
//           id: r.id,
//           name: decodeHtmlEntities(r.name),
//           level: canon,
//           level_label: LEVEL_LABEL[canon],
//           type: r.program_type || null,
//           status: "available",
//         };
//       });

//       for (const row of categoryProgramsAll) {
//         const bucket = categoryProgramsGrouped[row.level];
//         if (bucket.length < 3) bucket.push(row);
//       }

//       categoryProgramsFlat = [
//         ...categoryProgramsGrouped.Bachelor,
//         ...categoryProgramsGrouped.Master,
//         ...categoryProgramsGrouped.PhD,
//       ];
//     }

//     // -------- final professors --------
//     const professors = professorsRows.map((p) => {
//       let imageUrl = p.image;
//       if (
//         typeof p.image === "string" &&
//         !isNaN(imageUrl) &&
//         imageUrl.trim() !== ""
//       ) {
//         imageUrl = imageMap.get(imageUrl) || null;
//       } else if (!imageUrl || imageUrl.trim() === "") {
//         imageUrl = null;
//       }

//       // برنامه‌های مرتبط با همین استاد (school_id, program_id)
//       const rels = relMap.get(keyOf(p.school_id, p.program_id)) || [];

//       // یکتا کردن بر اساس سطح و مرتب‌سازی
//       // const seenLv = new Set();
//       // const programs = rels
//       //   .filter((r) => {
//       //     const lv = String(r.level || "").toLowerCase();
//       //     if (seenLv.has(lv)) return false;
//       //     seenLv.add(lv);
//       //     return true;
//       //   })
//       //   .sort(sortByLevel)
//       //   .map((r) => {
//       //     const canon = LEVEL_CANON(r.level || "");
//       //     return {
//       //       id: String(r.row_id), // 👈 row_id (کلید ذخیره/هایلایت)
//       //       name: decodeHtmlEntities(r.program_name || ""),
//       //       level: canon,
//       //       level_label: LEVEL_LABEL[canon],
//       //       type: r.type || null,
//       //       status: "available",
//       //     };
//       //   });
//       const programs = rels
//         .map((r) => {
//           const canon = LEVEL_CANON(r.level || "");
//           return {
//             id: String(r.row_id), // همون row_id رابطه (کلید ذخیره‌سازی)
//             name: decodeHtmlEntities(r.program_name || ""),
//             level: canon,
//             level_label: LEVEL_LABEL[canon],
//             type: r.type || null,
//             status: "available",
//           };
//         })
//         // برای نظم بهتر: اول ترتیب سطح، بعد نام
//         .sort((a, b) => {
//           const byLevel = sortByLevel(a, b);
//           return byLevel !== 0 ? byLevel : a.name.localeCompare(b.name);
//         });
//       return {
//         ...p,
//         image: imageUrl,
//         name: decodeHtmlEntities(p.name),
//         title: p.title ? decodeHtmlEntities(p.title) : null,
//         program_name: p.program_name
//           ? decodeHtmlEntities(p.program_name)
//           : null,
//         area_of_study_name: p.area_of_study_name
//           ? decodeHtmlEntities(p.area_of_study_name)
//           : null,
//         country_name: p.country_name
//           ? decodeHtmlEntities(p.country_name)
//           : null,
//         school_name: p.school_name ? decodeHtmlEntities(p.school_name) : null,
//         programs, // 👈 همه‌ی برنامه‌های مرتبط با استاد
//       };
//     });

//     // -------- total & pages --------
//     const totalParams = [...ProfParams];
//     let totalSql = `
//       SELECT COUNT(DISTINCT pf.ID) AS total
//       FROM qacom_wp_apply_faculty pf
//       LEFT JOIN qacom_wp_apply_programs p ON pf.program_id = p.id
//       LEFT JOIN qacom_wp_apply_schools  s ON pf.school_id  = s.id
//       WHERE ${ProfConditions.join(" AND ")}
//     `;
//     if (filters.researchInterest) {
//       totalSql += ` AND MATCH(pf.research_area) AGAINST(? IN BOOLEAN MODE)`;
//       totalParams.push(booleanSearch(filters.researchInterest));
//     }
//     const [totalRes] = await db.query(totalSql, totalParams);
//     const totalProfessors = totalRes[0]?.total || 0;
//     const totalPages = Math.ceil(totalProfessors / limit);

//     // -------- response --------
//     res.json({
//       userPreferences: light ? undefined : userPreferences,
//       professors,
//       currentPage: page,
//       totalPages,
//       totalProfessors,
//       researchInterests,
//       categoryPrograms: {
//         groups: categoryProgramsGrouped, // {Bachelor:[], Master:[], PhD:[]}
//         flat: categoryProgramsFlat, // حداکثر ۹ تا (۳×۳)
//         all: categoryProgramsAll, // همهٔ برنامه‌های کتگوری (برای Show More)
//       },
//     });
//   } catch (error) {
//     console.error("Error in /find professors:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

////////////////////////////////////
////////////////////////////////
// export default router;

import express from "express";
import db from "../config/db.config.js";
import { log } from "console";
import { decodeHtmlEntities as decodeHtmlEntitiesExt } from "../utils/helpers.js";
import { countryMap } from "../config/constants.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
const router = express.Router();

router.get("/find", authenticateToken, async (req, res) => {
  try {
    res.set({
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    });

    // --- helpers ---
    const decodeHtmlEntities =
      decodeHtmlEntitiesExt ||
      ((s = "") =>
        s
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&#039;/g, "'")
          .replace(/&quot;/g, '"'));

    const toArr = (v) => {
      if (v == null) return [];
      if (Array.isArray(v))
        return v.map((x) => String(x).trim()).filter(Boolean);
      return String(v)
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);
    };

    // boolean search که ورودی CSV/space را هم ساپورت کند
    const booleanSearch = (q) => {
      const raw = Array.isArray(q) ? q.join(" ") : String(q || "");
      const tokens = raw
        .split(/[,\s]+/)
        .map((w) => w.trim())
        .filter(Boolean)
        .slice(0, 5);
      return tokens.length ? tokens.map((w) => `+${w}*`).join(" ") : null;
    };

    // نرمال‌سازی سطح
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

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // حالت سبک برای Load more: داده‌های ثابت فقط صفحهٔ اول
    const light =
      req.query.light === "1" || req.query.light === "true" || page > 1;

    // ---- user ----
    const { email } = req.user;
    const [userData] = await db.query(
      `SELECT ID FROM qacom_wp_users WHERE user_email = ? LIMIT 1`,
      [email]
    );
    if (!userData?.length)
      return res.status(404).json({ error: "User not found" });
    const userId = userData[0].ID;

    // -------- userPreferences & options (only page 1) --------
    let userPreferences = {
      country: null,
      level: null,
      program: null,
      areaOfStudy: null, // {id,name}
      countryDetails: null,
      availableCountries: [],
      availableAreasOfStudy: [],
      availablePrograms: [],
    };

    if (!light) {
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

      // اگر areaOfStudy از کوئری CSV باشد، برای لیست Programs فقط اولین مورد را استفاده کن
      const areaIdsFromQuery = toArr(req.query.areaOfStudy);
      const programAreaId =
        areaIdsFromQuery[0] || (await programInfoPromise)?.id;

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
    }

    // -------- filters (چندانتخابی‌ها به آرایه) --------

    const filters = (() => {
      const base = {
        country: null,
        areaOfStudy: [],
        program: [],
        state: [],
        researchInterest: [],
        title: null,
        degreeLevel: null,
      };

      base.country =
        (light
          ? req.query.country
          : req.query.country || userPreferences.country) || null;

      // areaOfStudy: اگر از userPreferences آمد، به صورت آرایه یک‌عنصری
      const areaArr = toArr(req.query.areaOfStudy);
      if (areaArr.length) base.areaOfStudy = areaArr;
      else if (!light && userPreferences.areaOfStudy?.id)
        base.areaOfStudy = [String(userPreferences.areaOfStudy.id)];

      base.program = toArr(req.query.program);
      base.state = toArr(req.query.state);
      base.researchInterest = toArr(req.query.researchInterest);
      base.title = req.query.title || null;

      const canon = LEVEL_CANON(req.query.degreeLevel);
      base.degreeLevel = canon ? canon.toLowerCase() : null;

      return base;
    })();

    // -------- conditions --------
    const ProfConditions = ["pf.status = 'publish'"];
    const ProfParams = [];

    if (filters.country) {
      ProfConditions.push("s.country = ?");
      ProfParams.push(filters.country);
    }
    if (filters.state.length) {
      ProfConditions.push("s.state IN (?)");
      ProfParams.push(filters.state);
    }
    if (filters.areaOfStudy.length) {
      ProfConditions.push(`p.category_id IN (?)`);
      ProfParams.push(filters.areaOfStudy);
    }
    if (filters.program.length) {
      ProfConditions.push(`pf.program_id IN (?)`);
      ProfParams.push(filters.program);
    }
    if (filters.title) {
      ProfConditions.push("pf.title = ?");
      ProfParams.push(filters.title);
    }
    if (filters.researchInterest.length) {
      const bs = booleanSearch(filters.researchInterest);
      if (bs) {
        ProfConditions.push(
          `MATCH(pf.research_area) AGAINST(? IN BOOLEAN MODE)`
        );
        ProfParams.push(bs);
      }
    }
    if (filters.degreeLevel) {
      // چک وجود سطح موردنظر روی رابطه‌ی برنامه/دانشگاه
      ProfConditions.push(
        `EXISTS (
       SELECT 1
       FROM qacom_wp_apply_programs_relationship rel
       WHERE rel.school_id = pf.school_id
         AND rel.program_id = pf.program_id
         AND REPLACE(REPLACE(LOWER(rel.level), '.', ''), ' ', '') = ?
     )`
      );
      ProfParams.push(
        filters.degreeLevel.replace(/\./g, "").replace(/\s+/g, "").toLowerCase()
      );
    }

    // -------- page IDs --------
    const [baseProfessors] = await db.query(
      `
      SELECT DISTINCT pf.ID
      FROM qacom_wp_apply_faculty pf
      LEFT JOIN qacom_wp_apply_programs p ON pf.program_id = p.id
      LEFT JOIN qacom_wp_apply_schools  s ON pf.school_id  = s.id
      WHERE ${ProfConditions.join(" AND ")}
      ORDER BY pf.date ASC, pf.name ASC
      LIMIT ? OFFSET ?
    `,
      [...ProfParams, limit, offset]
    );
    const professorIds = baseProfessors.map((r) => r.ID);

    if (!professorIds.length) {
      return res.json({
        userPreferences: light ? undefined : userPreferences,
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
      });
    }

    // -------- details + research (parallel) --------
    const detailsPromise = db.query(
      `
      SELECT DISTINCT 
        pf.ID, pf.name, pf.title, pf.email, pf.program_id, pf.school_id,
        pf.research_area, pf.link, pf.department_id, pf.google_scholar,
        pf.website, pf.linkedin, pf.image, pf.status, pf.creator_id, pf.date,
        p.name  AS program_name,
        t_cat.name     AS area_of_study_name,
        t_country.name AS country_name,
        s.name AS school_name, s.state, s.country
      FROM qacom_wp_apply_faculty pf
      LEFT JOIN qacom_wp_apply_programs p ON pf.program_id = p.id
      LEFT JOIN qacom_wp_terms t_cat     ON p.category_id = t_cat.term_id
      LEFT JOIN qacom_wp_apply_schools s ON pf.school_id = s.id
      LEFT JOIN qacom_wp_terms t_country ON s.country   = t_country.term_id
      WHERE pf.ID IN (?)
      ORDER BY pf.date ASC, pf.name ASC
      `,
      [professorIds]
    );

    const researchPromise = db.query(
      `
      SELECT ID, research_area
      FROM qacom_wp_apply_faculty
      WHERE ID IN (?)
        AND research_area IS NOT NULL AND research_area <> ''
        ${
          filters.researchInterest.length
            ? `AND MATCH(research_area) AGAINST(? IN BOOLEAN MODE)`
            : ``
        }
    `,
      filters.researchInterest.length
        ? [professorIds, booleanSearch(filters.researchInterest)]
        : [professorIds]
    );

    // تمام برنامه‌های مرتبط با (school_id, program_id) همین اساتید
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

    // مپ‌کردن به کلید (school_id + program_id) → لیست روابط
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

    // images (only numeric ids)
    const imageIds = professorsRows
      .map((p) =>
        typeof p.image === "string" && !isNaN(p.image) && p.image.trim() !== ""
          ? p.image
          : null
      )
      .filter(Boolean);

    let imageMap = new Map();
    if (imageIds.length) {
      const [atts] = await db.query(
        `
        SELECT pm.post_id, pm.meta_value
        FROM qacom_wp_postmeta pm
        JOIN qacom_wp_posts p ON pm.post_id = p.id
        WHERE pm.meta_key = '_wp_attached_file' AND p.id IN (?)
      `,
        [imageIds]
      );
      for (const a of atts) {
        imageMap.set(
          a.post_id.toString(),
          `https://questapply.com/wp-content/uploads/${a.meta_value}`
        );
      }
    }

    // unique research interests (for filter UI)
    const interests = [];
    const re = /s:\d+:"(.*?)";/g;
    for (const ri of riRows) {
      let m;
      const s = ri.research_area || "";
      while ((m = re.exec(s)) !== null) interests.push(m[1].trim());
    }
    const researchInterests = Array.from(new Set(interests)).sort();

    // -------- category programs (اولین area انتخابی یا از prefernces) --------
    const categoryForPrograms =
      (filters.areaOfStudy.length ? filters.areaOfStudy[0] : null) ||
      (userPreferences?.areaOfStudy && userPreferences.areaOfStudy.id) ||
      null;

    let categoryProgramsAll = [];
    let categoryProgramsGrouped = { Bachelor: [], Master: [], PhD: [] };
    let categoryProgramsFlat = [];

    if (categoryForPrograms) {
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
              GROUP_CONCAT(level ORDER BY FIELD(LOWER(level),'bachelor','master','phd') SEPARATOR ','),
              ',', 1
            ) AS level,
            SUBSTRING_INDEX(
              GROUP_CONCAT(\`type\` ORDER BY \`type\` SEPARATOR ','),
              ',', 1
            ) AS \`type\`
          FROM qacom_wp_apply_programs_relationship
          GROUP BY program_id
        ) rel ON rel.program_id = p.id
        WHERE p.category_id = ?
        ORDER BY p.name ASC
        `,
        [categoryForPrograms]
      );

      categoryProgramsAll = catProgs.map((r) => {
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

    // -------- final professors --------
    const professors = professorsRows.map((p) => {
      let imageUrl = p.image;
      if (
        typeof p.image === "string" &&
        !isNaN(imageUrl) &&
        imageUrl.trim() !== ""
      ) {
        imageUrl = imageMap.get(imageUrl) || null;
      } else if (!imageUrl || imageUrl.trim() === "") {
        imageUrl = null;
      }

      // برنامه‌های مرتبط با همین استاد (school_id, program_id)
      const rels = relMap.get(keyOf(p.school_id, p.program_id)) || [];

      const programs = rels
        .map((r) => {
          const canon = LEVEL_CANON(r.level || "");
          return {
            id: String(r.row_id),
            name: decodeHtmlEntities(r.program_name || ""),
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
        name: decodeHtmlEntities(p.name),
        title: p.title ? decodeHtmlEntities(p.title) : null,
        program_name: p.program_name
          ? decodeHtmlEntities(p.program_name)
          : null,
        area_of_study_name: p.area_of_study_name
          ? decodeHtmlEntities(p.area_of_study_name)
          : null,
        country_name: p.country_name
          ? decodeHtmlEntities(p.country_name)
          : null,
        school_name: p.school_name ? decodeHtmlEntities(p.school_name) : null,
        programs,
      };
    });

    // -------- total & pages (همان شروط اصلی) --------
    const totalParams = [...ProfParams];
    const [totalRes] = await db.query(
      `
      SELECT COUNT(DISTINCT pf.ID) AS total
      FROM qacom_wp_apply_faculty pf
      LEFT JOIN qacom_wp_apply_programs p ON pf.program_id = p.id
      LEFT JOIN qacom_wp_apply_schools  s ON pf.school_id  = s.id
      WHERE ${ProfConditions.join(" AND ")}
    `,
      totalParams
    );
    const totalProfessors = totalRes[0]?.total || 0;
    const totalPages = Math.ceil(totalProfessors / limit);

    // -------- response --------
    res.json({
      userPreferences: light ? undefined : userPreferences,
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
    });
  } catch (error) {
    console.error("Error in /find professors:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

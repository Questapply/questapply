// routes/schoolRoutes.js
import express from "express";
import db from "../config/db.config.js";
import { decodeHtmlEntities, convertNumber } from "../utils/helpers.js"; // Import the helper function
import { countryMap, BASE_UPLOADS_URL } from "../config/constants.js";
import {
  authenticateToken,
  authenticateTokenOptional,
} from "../middleware/authMiddleware.js";
import { unserialize as phpUnserialize } from "php-serialize";
import { buildUploadsUrl } from "../config/constants.js";
import { unserialize } from "php-unserialize";
import { countryCodeToName } from "../countries.js";
const router = express.Router();

const countryNameToIdMap = Object.entries(countryMap).reduce(
  (acc, [id, name]) => {
    acc[name.toLowerCase()] = id;
    return acc;
  },
  {}
);

// API endpoint school)2
router.get("/schools", authenticateTokenOptional, async (req, res) => {
  try {
    const t0 = Date.now();
    const isGuest = String(req.query.guest || "") === "1" || !req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const email = req.user?.email || null;

    // ----- preload user + lookups -----
    let userMetas = [];

    const [countriesData, categoriesData, statesData] = await Promise.all([
      db.query(`
    SELECT t.term_id, t.name
    FROM qacom_wp_term_taxonomy tt
    JOIN qacom_wp_terms t ON tt.term_id = t.term_id
    WHERE tt.taxonomy = 'place' AND tt.parent = 0
  `),
      db.query(`
    SELECT t.term_id, t.name
    FROM qacom_wp_term_taxonomy tt
    JOIN qacom_wp_terms t ON tt.term_id = t.term_id
    WHERE tt.taxonomy = 'program_category'
    ORDER BY t.name ASC
  `),
      db.query(`
    SELECT t.term_id, t.name
    FROM qacom_wp_term_taxonomy tt
    JOIN qacom_wp_terms t ON tt.term_id = t.term_id
    WHERE tt.taxonomy = 'place' AND tt.parent != 0
  `),
    ]);

    if (!isGuest && email) {
      const [userDataRows] = await db.query(
        `
    SELECT um.meta_key, um.meta_value
    FROM qacom_wp_users u
    LEFT JOIN qacom_wp_usermeta um ON u.ID = um.user_id
    WHERE u.user_email = ?
  `,
        [email]
      );
      userMetas = userDataRows || [];
    }
    const t1 = Date.now();

    // const userMetas = userDataRows[0] || [];
    const availableCountries = countriesData[0] || [];
    const availableAreasOfStudy = categoriesData[0] || [];
    const availableStates = statesData[0] || [];

    const stateIdToNameMap = availableStates.reduce((acc, state) => {
      acc[state.term_id] = decodeHtmlEntities(state.name);
      return acc;
    }, {});

    // ----- build userPreferences (defaults from user meta) -----
    // const userMetaMap = userMetas.reduce((acc, meta) => {
    //   acc[meta.meta_key] = meta.meta_value;
    //   return acc;
    // }, {});
    const userMetaMap = (userMetas || []).reduce((acc, meta) => {
      acc[meta.meta_key] = meta.meta_value;
      return acc;
    }, {});

    const userPreferences = isGuest
      ? {
          country: null,
          level: null,
          program: null,
          areaOfStudy: null,
          englishTest: null,
          gpa: null,
          availableCountries: (countriesData[0] || []).map((c) => ({
            id: c.term_id,
            name: decodeHtmlEntities(c.name),
          })),
          availableAreasOfStudy: (categoriesData[0] || []).map((c) => ({
            id: c.term_id,
            name: decodeHtmlEntities(c.name),
          })),
          availablePrograms: [],
        }
      : {
          country: userMetaMap.application_country || null,
          level: userMetaMap.application_level || null,
          program: userMetaMap.application_program || null,
          areaOfStudy: null,
          englishTest: userMetaMap.application_english_test || null,
          gpa: userMetaMap.application_gpa || null,
          availableCountries: availableCountries.map((c) => ({
            id: c.term_id,
            name: decodeHtmlEntities(c.name),
          })),
          availableAreasOfStudy: availableAreasOfStudy.map((c) => ({
            id: c.term_id,
            name: decodeHtmlEntities(c.name),
          })),
          availablePrograms: [],
        };

    if (!isGuest && userPreferences.program) {
      const [programData] = await db.query(
        `
        SELECT p.id, p.name, p.category_id, t.name as category_name
        FROM qacom_wp_apply_programs p
        LEFT JOIN qacom_wp_terms t ON p.category_id = t.term_id
        WHERE p.id = ?
        LIMIT 1
      `,
        [userPreferences.program]
      );

      if (programData && programData.length > 0) {
        userPreferences.programDetails = {
          id: programData[0].id,
          name: decodeHtmlEntities(programData[0].name),
        };
        if (programData[0].category_id) {
          userPreferences.areaOfStudy = {
            id: programData[0].category_id,
            name: decodeHtmlEntities(programData[0].category_name),
          };
          const [programsData] = await db.query(
            `
            SELECT p.id, p.name
            FROM qacom_wp_apply_programs p
            WHERE p.category_id = ?
            ORDER BY p.name ASC
          `,
            [programData[0].category_id]
          );
          userPreferences.availablePrograms = (programsData || []).map((p) => ({
            id: p.id,
            name: decodeHtmlEntities(p.name),
          }));
        }
      }
    }

    // ----- SELECT / FROM / WHERE skeleton -----
    // فیکس 1: هزینه‌ها را همان‌جا تمیز و عددی کن تا 0 نشوند
    let selectClause = `
      s.id, s.name, s.country, s.state,
      CASE
        WHEN s.image REGEXP '^[0-9]+$' THEN
          (SELECT CONCAT('/uploads/', pm.meta_value)
           FROM qacom_wp_postmeta pm
           WHERE pm.post_id = CAST(s.image AS UNSIGNED)
             AND pm.meta_key = '_wp_attached_file')
        ELSE s.image
      END AS school_logo,

      MAX(CASE WHEN sm.meta_key = 'qs_rank' THEN sm.meta_value END) AS qs_rank,
      MAX(CASE WHEN sm.meta_key = 'us_news_rank' THEN sm.meta_value END) AS us_news_rank,
      MAX(CASE WHEN sm.meta_key = 'forbes_rank' THEN sm.meta_value END) AS forbes_rank,
      MAX(CASE WHEN sm.meta_key = 'shanghai_rank' THEN sm.meta_value END) AS shanghai_rank,
      MAX(CASE WHEN sm.meta_key = 'the_rank' THEN sm.meta_value END) AS the_rank,

      /* cost_* را به عدد تبدیل می‌کنیم: حذف ویرگول/$ و CAST */
      CAST(
     MAX(
    CASE WHEN sm.meta_key = 'cost_graduate_in_state' THEN
      NULLIF(
        REPLACE(
          /* اگر الگو مثل 1.234 یا 12.345.678 بود → نقطه‌ها هزارگان‌اند: همهٔ '.' حذف شود */
          CASE
            WHEN TRIM(sm.meta_value) REGEXP '^[0-9]{1,3}(\\.[0-9]{3})+$'
              THEN REPLACE(TRIM(sm.meta_value), '.', '')
            ELSE TRIM(sm.meta_value)  -- یک نقطه (اعشار) را نگه می‌داریم
          END
        , '$', '')  -- حذف $
      , '')
    END
  ) AS DECIMAL(18,2)
) AS cost_in_state,

      CAST(
      MAX(
    CASE WHEN sm.meta_key = 'cost_undergrade_out_of_state' THEN
      NULLIF(
        REPLACE(
          CASE
            WHEN TRIM(sm.meta_value) REGEXP '^[0-9]{1,3}(\\.[0-9]{3})+$'
              THEN REPLACE(TRIM(sm.meta_value), '.', '')
            ELSE TRIM(sm.meta_value)
          END
        , '$', '')
      , '')
    END
  ) AS DECIMAL(18,2)
) AS cost_out_state,

      MAX(CASE WHEN sm.meta_key = 'graduate_student' THEN sm.meta_value END) AS graduate_student,
      MAX(CASE WHEN sm.meta_key = 'undergrade_student' THEN sm.meta_value END) AS undergrade_student,
      MAX(CASE WHEN sm.meta_key = 'men_number_applied' THEN sm.meta_value END) AS men_applied,
      MAX(CASE WHEN sm.meta_key = 'women_number_applied' THEN sm.meta_value END) AS women_applied,
      MAX(CASE WHEN sm.meta_key = 'men_number_admitted' THEN sm.meta_value END) AS men_admitted,
      MAX(CASE WHEN sm.meta_key = 'women_number_admitted' THEN sm.meta_value END) AS women_admitted,
      MAX(CASE WHEN sm.meta_key = 'gr_6_years' THEN sm.meta_value END) AS gr_6_years,

      IFNULL(MAX(pr_tot.master_total), 0)   AS master_total,
      IFNULL(MAX(pr_tot.phd_total), 0)      AS phd_total,
      IFNULL(MAX(pr_tot.bachelor_total), 0) AS bachelor_total
    `;

    let fromClause = `
      FROM qacom_wp_apply_schools s
      LEFT JOIN qacom_wp_apply_schools_meta sm
        ON s.id = sm.school_id
       AND sm.meta_key IN (
         'qs_rank','us_news_rank','forbes_rank','shanghai_rank','the_rank',
         'cost_graduate_in_state','cost_undergrade_out_of_state',
         'graduate_student','undergrade_student',
         'men_number_applied','women_number_applied',
         'men_number_admitted','women_number_admitted',
         'men_number_admitted','women_number_admitted',
'gr_6_years'
       )
    `;

    // شمارش سطح‌ها
    fromClause += `
      LEFT JOIN (
  SELECT
    school_id,
    -- شمارش ردیف‌ها مثل /school/:id (بدون DISTINCT و بدون normalize)
    SUM(CASE WHEN level = 'Master'   THEN 1 ELSE 0 END)   AS master_total,
    SUM(CASE WHEN level = 'Ph.D.'    THEN 1 ELSE 0 END)   AS phd_total,
    SUM(CASE WHEN level = 'Bachelor' THEN 1 ELSE 0 END)   AS bachelor_total
  FROM qacom_wp_apply_programs_relationship
  WHERE status = 'publish'
  GROUP BY school_id
) pr_tot ON pr_tot.school_id = s.id
    `;

    // COUNT سبک
    let fromClauseCount = `
      FROM qacom_wp_apply_schools s
    `;

    let whereClauses = ["s.status = 'publish'"];
    const params = [];
    const ignoreDefaults =
      isGuest || String(req.query.ignoreUserDefaults || "") === "1";

    const has = (v) =>
      typeof v !== "undefined" && v !== null && String(v) !== "";
    // ----- read filters -----
    const filterCountry = has(req.query.country)
      ? req.query.country
      : ignoreDefaults
      ? null
      : userPreferences.country;
    const filterDegreeLevel = has(req.query.degreeLevel)
      ? req.query.degreeLevel
      : ignoreDefaults
      ? null
      : userPreferences.level;
    const filterSearch = (req.query.search || "").trim() || null;
    const filterOrderBy = (req.query.orderBy || "").trim() || null;

    const parseCsv = (v) =>
      typeof v === "string"
        ? v
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : Array.isArray(v)
        ? v.map(String)
        : [];

    const stateIds = parseCsv(req.query.state);
    const areaIds = parseCsv(
      req.query.areaOfStudy ||
        (userPreferences.areaOfStudy && String(userPreferences.areaOfStudy.id))
    );
    const programIds = parseCsv(req.query.program || userPreferences.program);

    const schoolIds = parseCsv(req.query.school);
    if (schoolIds.length === 1) {
      whereClauses.push("s.id = ?");
      params.push(parseInt(schoolIds[0], 10));
    } else if (schoolIds.length > 1) {
      whereClauses.push(`s.id IN (${schoolIds.map(() => "?").join(",")})`);
      params.push(...schoolIds.map((id) => parseInt(id, 10)));
    }

    let joinedPR = false;

    // Country
    if (filterCountry) {
      whereClauses.push("s.country = ?");
      params.push(filterCountry);
    }

    // State(s)
    if (stateIds.length) {
      const stateNames = stateIds
        .map((id) => stateIdToNameMap[id])
        .filter(Boolean);
      if (stateNames.length) {
        whereClauses.push(
          `s.state IN (${stateNames.map(() => "?").join(",")})`
        );
        params.push(...stateNames);
      }
    }

    // Area/Program
    if (areaIds.length) {
      fromClause += `
        LEFT JOIN qacom_wp_apply_programs_relationship pr
          ON s.id = pr.school_id AND pr.status = 'publish'
        LEFT JOIN qacom_wp_apply_programs p
          ON pr.program_id = p.id
      `;
      fromClauseCount += `
        LEFT JOIN qacom_wp_apply_programs_relationship pr
          ON s.id = pr.school_id AND pr.status = 'publish'
        LEFT JOIN qacom_wp_apply_programs p
          ON pr.program_id = p.id
      `;
      joinedPR = true;

      whereClauses.push(
        `p.category_id IN (${areaIds.map(() => "?").join(",")})`
      );
      params.push(...areaIds);

      if (programIds.length) {
        whereClauses.push(
          `pr.program_id IN (${programIds.map(() => "?").join(",")})`
        );
        params.push(...programIds);
      }
    } else if (programIds.length) {
      fromClause += `
        LEFT JOIN qacom_wp_apply_programs_relationship pr
          ON s.id = pr.school_id AND pr.status = 'publish'
      `;
      fromClauseCount += `
        LEFT JOIN qacom_wp_apply_programs_relationship pr
          ON s.id = pr.school_id AND pr.status = 'publish'
      `;
      joinedPR = true;

      whereClauses.push(
        `pr.program_id IN (${programIds.map(() => "?").join(",")})`
      );
      params.push(...programIds);
    }

    // Degree level
    if (filterDegreeLevel) {
      if (!joinedPR) {
        fromClause += `
          LEFT JOIN qacom_wp_apply_programs_relationship pr
            ON s.id = pr.school_id AND pr.status = 'publish'
        `;
        fromClauseCount += `
          LEFT JOIN qacom_wp_apply_programs_relationship pr
            ON s.id = pr.school_id AND pr.status = 'publish'
        `;
        joinedPR = true;
      }
      whereClauses.push("pr.level = ?");
      params.push(filterDegreeLevel === "PhD" ? "Ph.D." : filterDegreeLevel);
    }

    // Search
    if (filterSearch) {
      whereClauses.push("(s.name LIKE ? OR s.city LIKE ?)");
      params.push(`%${filterSearch}%`, `%${filterSearch}%`);
    }

    const whereClause = whereClauses.length
      ? ` WHERE ${whereClauses.join(" AND ")}`
      : "";
    const groupByClause = ` GROUP BY s.id, s.name, s.country, s.state, s.image`;

    // Order by (عبارت کامل تا خطای MySQL نده)
    const orderByMap = {
      qs_rank: `
        CASE
          WHEN MAX(CASE WHEN sm.meta_key = 'qs_rank' THEN sm.meta_value END) IS NULL
            OR MAX(CASE WHEN sm.meta_key = 'qs_rank' THEN sm.meta_value END) = ''
            OR NOT (MAX(CASE WHEN sm.meta_key = 'qs_rank' THEN sm.meta_value END) REGEXP '^[0-9]+$')
          THEN 999999999
          ELSE CAST(MAX(CASE WHEN sm.meta_key = 'qs_rank' THEN sm.meta_value END) AS UNSIGNED)
        END ASC
      `,
      us_news_rank: `
        CASE
          WHEN MAX(CASE WHEN sm.meta_key = 'us_news_rank' THEN sm.meta_value END) IS NULL
            OR MAX(CASE WHEN sm.meta_key = 'us_news_rank' THEN sm.meta_value END) = ''
            OR NOT (MAX(CASE WHEN sm.meta_key = 'us_news_rank' THEN sm.meta_value END) REGEXP '^[0-9]+$')
          THEN 999999999
          ELSE CAST(MAX(CASE WHEN sm.meta_key = 'us_news_rank' THEN sm.meta_value END) AS UNSIGNED)
        END ASC
      `,
      forbes_rank: `
        CASE
          WHEN MAX(CASE WHEN sm.meta_key = 'forbes_rank' THEN sm.meta_value END) IS NULL
            OR MAX(CASE WHEN sm.meta_key = 'forbes_rank' THEN sm.meta_value END) = ''
            OR NOT (MAX(CASE WHEN sm.meta_key = 'forbes_rank' THEN sm.meta_value END) REGEXP '^[0-9]+$')
          THEN 999999999
          ELSE CAST(MAX(CASE WHEN sm.meta_key = 'forbes_rank' THEN sm.meta_value END) AS UNSIGNED)
        END ASC
      `,
      shanghai_rank: `
        CASE
          WHEN MAX(CASE WHEN sm.meta_key = 'shanghai_rank' THEN sm.meta_value END) IS NULL
            OR MAX(CASE WHEN sm.meta_key = 'shanghai_rank' THEN sm.meta_value END) = ''
            OR NOT (MAX(CASE WHEN sm.meta_key = 'shanghai_rank' THEN sm.meta_value END) REGEXP '^[0-9]+$')
          THEN 999999999
          ELSE CAST(MAX(CASE WHEN sm.meta_key = 'shanghai_rank' THEN sm.meta_value END) AS UNSIGNED)
        END ASC
      `,
      the_rank: `
        CASE
          WHEN MAX(CASE WHEN sm.meta_key = 'the_rank' THEN sm.meta_value END) IS NULL
            OR MAX(CASE WHEN sm.meta_key = 'the_rank' THEN sm.meta_value END) = ''
            OR NOT (MAX(CASE WHEN sm.meta_key = 'the_rank' THEN sm.meta_value END) REGEXP '^[0-9]+$')
          THEN 999999999
          ELSE CAST(MAX(CASE WHEN sm.meta_key = 'the_rank' THEN sm.meta_value END) AS UNSIGNED)
        END ASC
      `,
      name_a_to_z: `s.name ASC`,
      name_z_to_a: `s.name DESC`,
      tuition_low_to_high: `cost_in_state ASC`,
      tuition_high_to_low: `cost_in_state DESC`,
    };

    const selectedOrderBy =
      filterOrderBy && orderByMap[filterOrderBy]
        ? `${orderByMap[filterOrderBy]}, s.name ASC`
        : `${orderByMap.qs_rank}, s.name ASC`;

    // ----- queries -----
    const finalQuery = `
      SELECT ${selectClause}
      ${fromClause}
      ${whereClause}
      ${groupByClause}
      ORDER BY ${selectedOrderBy}
      LIMIT ? OFFSET ?
    `;
    const countQuery = `
      SELECT COUNT(DISTINCT s.id) AS total
      ${fromClauseCount}
      ${whereClause}
    `;

    const [countRows] = await db.query(countQuery, params);
    const t2 = Date.now();

    const totalCount =
      countRows && countRows[0] && countRows[0].total
        ? Number(countRows[0].total)
        : 0;

    const [schoolRows] = await db.query(finalQuery, [...params, limit, offset]);
    const t3 = Date.now();

    const schools = schoolRows.map((row) => {
      const gr6 = convertNumber(row.gr_6_years);
      let graduationRate;
      if (!isNaN(gr6) && gr6 > 0) {
        graduationRate = Math.round(gr6);
      } else {
        // fallback اختیاری: نسبت grad to total (اگر خواستی می‌توانی 0 بگذاری)
        const graduateStudent = convertNumber(row.graduate_student);
        const undergradeStudent = convertNumber(row.undergrade_student);
        const totalStudents = graduateStudent + undergradeStudent;
        graduationRate =
          totalStudents > 0
            ? Math.round((graduateStudent / totalStudents) * 100)
            : 0;
      }

      const menApplied = convertNumber(row.men_applied);
      const womenApplied = convertNumber(row.women_applied);
      const menAdmitted = convertNumber(row.men_admitted);
      const womenAdmitted = convertNumber(row.women_admitted);
      const totalApplied = menApplied + womenApplied;
      const totalAdmitted = menAdmitted + womenAdmitted;
      const acceptanceRate =
        totalApplied > 0 ? Math.round((totalAdmitted / totalApplied) * 100) : 0;

      const programs = [];
      if (Number(row.phd_total) > 0)
        programs.push(`Ph.D : ${row.phd_total} Programs`);
      if (Number(row.master_total) > 0)
        programs.push(`Master : ${row.master_total} Programs`);
      if (Number(row.bachelor_total) > 0)
        programs.push(`Bachelor : ${row.bachelor_total} Programs`);

      const rawLogoUrl = row.school_logo || "";
      const finalLogoUrl = rawLogoUrl.startsWith("/")
        ? `https://questapply.com/wp-content${rawLogoUrl}`
        : rawLogoUrl;

      return {
        id: row.id,
        name: decodeHtmlEntities(row.name),
        location: `${
          countryMap[row.country]
            ? countryMap[row.country].replace(/\s*\([^)]*\)/g, "").trim()
            : "Unknown"
        }${row.state ? `, ${decodeHtmlEntities(row.state)}` : ""}`,
        logo: finalLogoUrl,
        ranking: {
          qs: row.qs_rank || "N/A",
          usNews: row.us_news_rank || "N/A",
          forbes: row.forbes_rank || "N/A",
          shanghai: row.shanghai_rank || "N/A",
          the: row.the_rank || "N/A",
        },
        programs,
        acceptance: acceptanceRate ?? "N/A",
        graduation: graduationRate ?? "N/A",
        cost: {
          inState: convertNumber(row.cost_in_state),
          outState: convertNumber(row.cost_out_state),
        },
        favorite: false,
      };
    });

    const hasMore = page * limit < totalCount;

    // فیکس 2: اگر کاربر کشور را با فیلتر عوض کرده، همان را در خروجی برگردان
    const userPreferencesOut = { ...userPreferences };
    if (req.query.country) {
      userPreferencesOut.country = String(req.query.country);
    }

    console.log(
      "[/schools] preload(ms):",
      t1 - t0,
      "count(ms):",
      t2 - t1,
      "list(ms):",
      t3 - t2,
      "total(ms):",
      Date.now() - t0
    );

    res.json({
      schools,
      count: totalCount,
      userPreferences: userPreferencesOut,
      hasMore,
    });
  } catch (error) {
    console.error("Error fetching schools:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /school/:id  (aligned 1:1 with legacy PHP logic)
router.get("/school/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.user;

    // --- Helpers (use your existing ones if already defined)
    const decodeHtmlEntities = (s = "") =>
      typeof s === "string"
        ? s.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
        : s;

    const toNum = (v) => {
      if (v === null || v === undefined) return null;
      const s = String(v).replace(/[, ]+/g, "").trim();
      if (s === "") return null;
      const n = Number(s);
      return Number.isFinite(n) ? n : null;
    };

    const convertNumber = (v) => {
      const n = toNum(v);
      return n === null ? 0 : n;
    };

    const countryMap = {
      // fill with your existing map if present; used only for display
    };

    // 1) Base school + metas (same columns as PHP requires)
    const [rows] = await db.query(
      `
      SELECT
        s.id, s.name, s.country, s.state, s.kind, s.link,
        CASE
          WHEN s.image REGEXP '^[0-9]+$' THEN
           (SELECT pm.meta_value
            FROM qacom_wp_postmeta pm
            WHERE pm.post_id = CAST(s.image AS UNSIGNED)
              AND pm.meta_key = '_wp_attached_file'
            LIMIT 1)
          ELSE s.image
        END AS image_raw,

        -- Rankings
        MAX(CASE WHEN sm.meta_key = 'qs_rank'       THEN sm.meta_value END) AS qs_rank,
        MAX(CASE WHEN sm.meta_key = 'us_news_rank'  THEN sm.meta_value END) AS us_news_rank,
        MAX(CASE WHEN sm.meta_key = 'forbes_rank'   THEN sm.meta_value END) AS forbes_rank,
        MAX(CASE WHEN sm.meta_key = 'shanghai_rank' THEN sm.meta_value END) AS shanghai_rank,
        MAX(CASE WHEN sm.meta_key = 'the_rank'      THEN sm.meta_value END) AS the_rank,

        -- Identity
        MAX(CASE WHEN sm.meta_key = 'description' THEN sm.meta_value END) AS description,
        MAX(CASE WHEN sm.meta_key = 'founded'     THEN sm.meta_value END) AS founded,
        MAX(CASE WHEN sm.meta_key = 'type'        THEN sm.meta_value END) AS type,
        MAX(CASE WHEN sm.meta_key = 'address'     THEN sm.meta_value END) AS address,
        MAX(CASE WHEN sm.meta_key = 'phone'       THEN sm.meta_value END) AS phone,

        -- Test requirements (raw values '0'/'1' or null)
        MAX(CASE WHEN sm.meta_key = 'toefl'            THEN sm.meta_value END) AS toefl,
        MAX(CASE WHEN sm.meta_key = 'ielts'            THEN sm.meta_value END) AS ielts,
        MAX(CASE WHEN sm.meta_key = 'duolingo'         THEN sm.meta_value END) AS duolingo,
        MAX(CASE WHEN sm.meta_key = 'melab'            THEN sm.meta_value END) AS melab,
        MAX(CASE WHEN sm.meta_key = 'pte'              THEN sm.meta_value END) AS pte,
        MAX(CASE WHEN sm.meta_key = 'sop'              THEN sm.meta_value END) AS sop,
        MAX(CASE WHEN sm.meta_key = 'transcript'       THEN sm.meta_value END) AS transcript,
        MAX(CASE WHEN sm.meta_key = 'resume_cs'        THEN sm.meta_value END) AS resume_cs,
        MAX(CASE WHEN sm.meta_key = 'recommendations'  THEN sm.meta_value END) AS recommendations,
        MAX(CASE WHEN sm.meta_key = 'application_form' THEN sm.meta_value END) AS application_form,
        MAX(CASE WHEN sm.meta_key = 'application_fee'  THEN sm.meta_value END) AS application_fee,

        -- Admissions (applied/admitted/enrolled by gender)
        MAX(CASE WHEN sm.meta_key = 'men_number_applied'   THEN sm.meta_value END) AS men_number_applied,
        MAX(CASE WHEN sm.meta_key = 'women_number_applied' THEN sm.meta_value END) AS women_number_applied,
        MAX(CASE WHEN sm.meta_key = 'men_number_admitted'  THEN sm.meta_value END) AS men_number_admitted,
        MAX(CASE WHEN sm.meta_key = 'women_number_admitted'THEN sm.meta_value END) AS women_number_admitted,
        MAX(CASE WHEN sm.meta_key = 'men_number_enrolled_full_time'   THEN sm.meta_value END) AS men_number_enrolled_full_time,
        MAX(CASE WHEN sm.meta_key = 'men_number_enrolled_part_time'   THEN sm.meta_value END) AS men_number_enrolled_part_time,
        MAX(CASE WHEN sm.meta_key = 'women_number_enrolled_full_time' THEN sm.meta_value END) AS women_number_enrolled_full_time,
        MAX(CASE WHEN sm.meta_key = 'women_number_enrolled_part_time' THEN sm.meta_value END) AS women_number_enrolled_part_time,

        -- Students totals (TYPE tab uses these!)
        MAX(CASE WHEN sm.meta_key = 'men_student'    THEN sm.meta_value END) AS men_student,
        MAX(CASE WHEN sm.meta_key = 'women_student'  THEN sm.meta_value END) AS women_student,
        MAX(CASE WHEN sm.meta_key = 'graduate_student'   THEN sm.meta_value END) AS graduate_student,
        MAX(CASE WHEN sm.meta_key = 'undergrade_student' THEN sm.meta_value END) AS undergrade_student,
        MAX(CASE WHEN sm.meta_key = 'full_time_student'  THEN sm.meta_value END) AS full_time_student,
        MAX(CASE WHEN sm.meta_key = 'part_time_student'  THEN sm.meta_value END) AS part_time_student,

        -- Costs breakdown
        MAX(CASE WHEN sm.meta_key = 'cost_undergrade_in_state'     THEN sm.meta_value END) AS cost_undergrade_in_state,
        MAX(CASE WHEN sm.meta_key = 'cost_undergrade_out_of_state' THEN sm.meta_value END) AS cost_undergrade_out_of_state,
        MAX(CASE WHEN sm.meta_key = 'cost_graduate_in_state'       THEN sm.meta_value END) AS cost_graduate_in_state,
        MAX(CASE WHEN sm.meta_key = 'cost_graduate_out_of_state'   THEN sm.meta_value END) AS cost_graduate_out_of_state,
        MAX(CASE WHEN sm.meta_key = 'cost_room_and_board'          THEN sm.meta_value END) AS cost_room_and_board,
        MAX(CASE WHEN sm.meta_key = 'cost_books_and_supplies'      THEN sm.meta_value END) AS cost_books_and_supplies,
        MAX(CASE WHEN sm.meta_key = 'cost_other_expenses'          THEN sm.meta_value END) AS cost_other_expenses,

        -- Race & Ethnicity
        MAX(CASE WHEN sm.meta_key = 'race_asian_and_pacific_islander' THEN sm.meta_value END) AS race_asian_and_pacific_islander,
        MAX(CASE WHEN sm.meta_key = 'race_black'   THEN sm.meta_value END) AS race_black,
        MAX(CASE WHEN sm.meta_key = 'race_hispanic'THEN sm.meta_value END) AS race_hispanic,
        MAX(CASE WHEN sm.meta_key = 'race_native_american' THEN sm.meta_value END) AS race_native_american,
        MAX(CASE WHEN sm.meta_key = 'race_white'   THEN sm.meta_value END) AS race_white,
        MAX(CASE WHEN sm.meta_key = 'race_other'   THEN sm.meta_value END) AS race_other,

        -- Optional: graduation meta (6-year)
        MAX(CASE WHEN sm.meta_key = 'gr_6_years' THEN sm.meta_value END) AS gr_6_years,
        MAX(CASE WHEN sm.meta_key = 'content' THEN sm.meta_value END) AS content

      FROM qacom_wp_apply_schools s
      LEFT JOIN qacom_wp_apply_schools_meta sm ON s.id = sm.school_id
      WHERE s.id = ?
      GROUP BY s.id, s.name, s.country, s.state, s.kind, s.link, s.image
      `,
      [id]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "School not found" });
    }
    const school = rows[0];

    // 2) program counts (for the little summary)
    const [programRows] = await db.query(
      `
      SELECT
        SUM(CASE WHEN level = 'Master' THEN 1 ELSE 0 END)   AS master_count,
        SUM(CASE WHEN level = 'Ph.D.' THEN 1 ELSE 0 END)    AS phd_count,
        SUM(CASE WHEN level = 'Bachelor' THEN 1 ELSE 0 END) AS bachelor_count
      FROM qacom_wp_apply_programs_relationship
      WHERE school_id = ? AND status = 'publish'
      `,
      [school.id]
    );

    // ---------- Build calculated fields (match PHP) ----------

    // Rankings -> numbers
    const ranking = {
      qs: convertNumber(school.qs_rank),
      usNews: convertNumber(school.us_news_rank),
      forbes: convertNumber(school.forbes_rank),
      shanghai: convertNumber(school.shanghai_rank),
      the: convertNumber(school.the_rank),
    };

    // Location, logo
    const countryName =
      countryMap[school.country] || `Unknown (${school.country})`;
    const cleanCountryName = countryName.replace(/\s*\([^)]*\)/g, "").trim();
    const finalLogoUrl = buildUploadsUrl(school.image_raw);

    // Costs (pure meta sums like PHP chart)
    const undergradInState = convertNumber(school.cost_undergrade_in_state);
    const undergradOutState = convertNumber(
      school.cost_undergrade_out_of_state
    );
    const gradInState = convertNumber(school.cost_graduate_in_state);
    const gradOutState = convertNumber(school.cost_graduate_out_of_state);
    const roomAndBoard = convertNumber(school.cost_room_and_board);
    const booksAndSupplies = convertNumber(school.cost_books_and_supplies);
    const otherExpenses = convertNumber(school.cost_other_expenses);
    const otherCommon =
      (roomAndBoard || 0) + (booksAndSupplies || 0) + (otherExpenses || 0);

    // Front-end “summary” fields (kept same shape)
    const totalInState =
      (undergradInState || 0) + (gradInState || 0) + otherCommon;
    const totalOutState =
      (undergradOutState || 0) + (gradOutState || 0) + otherCommon;

    // Students tab (exact metas like PHP Students section)
    const menStudent = convertNumber(school.men_student);
    const womenStudent = convertNumber(school.women_student);
    const undergradeStudent = convertNumber(school.undergrade_student);
    const graduateStudent = convertNumber(school.graduate_student);
    const fullTimeStudent = convertNumber(school.full_time_student); // ← NEW: use dedicated meta
    const partTimeStudent = convertNumber(school.part_time_student); // ← NEW: use dedicated meta

    // Admissions tab (exact formulas like PHP Admissions)
    const appliedMen = toNum(school.men_number_applied);
    const appliedWomen = toNum(school.women_number_applied);
    const admittedMen = toNum(school.men_number_admitted);
    const admittedWomen = toNum(school.women_number_admitted);

    // Enrolled by gender (from gender-based metas, not the Students tab totals)
    const menFT = convertNumber(school.men_number_enrolled_full_time);
    const menPT = convertNumber(school.men_number_enrolled_part_time);
    const womenFT = convertNumber(school.women_number_enrolled_full_time);
    const womenPT = convertNumber(school.women_number_enrolled_part_time);

    const menEnrolled = menFT + menPT;
    const womenEnrolled = womenFT + womenPT;
    const totalEnrolled = menEnrolled + womenEnrolled;

    // Acceptance Rate (like PHP: empty if any invalid)
    let acceptanceRate = "";
    if (
      Number.isFinite(appliedMen) &&
      Number.isFinite(appliedWomen) &&
      Number.isFinite(admittedMen) &&
      Number.isFinite(admittedWomen) &&
      appliedMen + appliedWomen > 0
    ) {
      acceptanceRate = Math.round(
        ((admittedMen + admittedWomen) / (appliedMen + appliedWomen)) * 100
      );
    }

    // Acceptance Rate by gender
    let menAcceptanceRate = "";
    if (
      Number.isFinite(appliedMen) &&
      Number.isFinite(admittedMen) &&
      appliedMen > 0
    ) {
      menAcceptanceRate = Math.round((admittedMen / appliedMen) * 100);
    }
    let womenAcceptanceRate = "";
    if (
      Number.isFinite(appliedWomen) &&
      Number.isFinite(admittedWomen) &&
      appliedWomen > 0
    ) {
      womenAcceptanceRate = Math.round((admittedWomen / appliedWomen) * 100);
    }

    // Enrolled Rate (Yield) — like PHP (empty string if invalid)
    let totalYield = "";
    if (
      totalEnrolled > 0 &&
      Number.isFinite(admittedMen) &&
      Number.isFinite(admittedWomen) &&
      admittedMen + admittedWomen > 0
    ) {
      totalYield = Math.round(
        (totalEnrolled / (admittedMen + admittedWomen)) * 100
      );
    }
    let menYield = "";
    if (menEnrolled > 0 && Number.isFinite(admittedMen) && admittedMen > 0) {
      menYield = Math.round((menEnrolled / admittedMen) * 100);
    }
    let womenYield = "";
    if (
      womenEnrolled > 0 &&
      Number.isFinite(admittedWomen) &&
      admittedWomen > 0
    ) {
      womenYield = Math.round((womenEnrolled / admittedWomen) * 100);
    }

    // Graduation rate: PHP snippet you gave uses either gr_6_years or a fallback.
    // We'll follow your previous behavior, but keep it simple: prefer gr_6_years if numeric; otherwise leave empty string.
    let graduationRate = "";
    const gr6 = toNum(school.gr_6_years);
    if (Number.isFinite(gr6)) {
      graduationRate = Math.round(gr6);
    }

    // Requirements defaults exactly like PHP:
    // - if meta missing (=== false in PHP sense): default 0 for {duolingo, melab, pte}, default 1 for others
    const rawReq = {
      toefl: school.toefl,
      ielts: school.ielts,
      duolingo: school.duolingo,
      melab: school.melab,
      pte: school.pte,
      sop: school.sop,
      transcript: school.transcript,
      resume_cs: school.resume_cs,
      recommendations: school.recommendations,
      application_form: school.application_form,
      application_fee: school.application_fee,
    };

    const defaultIfMissing = (key, val) => {
      if (val === null || val === undefined) {
        // missing -> defaults
        if (key === "duolingo" || key === "melab" || key === "pte") return "0"; // not required
        return "1"; // required
      }
      return String(val);
    };

    const reqFlags = {};
    Object.keys(rawReq).forEach((k) => {
      const v = defaultIfMissing(k, rawReq[k]);
      // Convert to boolean like UI expects
      reqFlags[k] = v === "1";
    });

    // Program summary strings (unchanged)
    const programs = [];
    const masterCount = convertNumber(programRows[0]?.master_count) || 0;
    const phdCount = convertNumber(programRows[0]?.phd_count) || 0;
    const bachelorCount = convertNumber(programRows[0]?.bachelor_count) || 0;
    if (masterCount > 0) programs.push(`Master: ${masterCount} Programs`);
    if (phdCount > 0) programs.push(`Ph.D: ${phdCount} Programs`);
    if (bachelorCount > 0) programs.push(`Bachelor: ${bachelorCount} Programs`);

    // Build response (keep field names your React uses)
    const response = {
      id: school.id,
      name: decodeHtmlEntities(school.name),
      location: `${cleanCountryName}${
        school.state ? `, ${decodeHtmlEntities(school.state)}` : ""
      }`,
      content: school.content ? decodeHtmlEntities(school.content) : "",

      logo: finalLogoUrl,

      ranking,

      programs,

      // keep same summary numbers (your UI already reads these)
      acceptance: typeof acceptanceRate === "number" ? acceptanceRate : "",
      graduation: typeof graduationRate === "number" ? graduationRate : "",

      // cost block: keep detailed and summary (unchanged keys)
      cost: {
        inState: totalInState || gradInState || undergradInState || 0,
        outState: totalOutState || gradOutState || undergradOutState || 0,
        undergradInState,
        undergradOutState,
        gradInState,
        gradOutState,
        roomAndBoard,
        booksAndSupplies,
        otherExpenses,
        totalInState,
        totalOutState,
      },

      description: school.description
        ? decodeHtmlEntities(school.description)
        : "",
      founded: toNum(school.founded) ?? undefined,
      type: school.type ? decodeHtmlEntities(school.type) : "",
      address: school.address ? decodeHtmlEntities(school.address) : "",
      phone: school.phone || "",

      // EXACT legacy requirement semantics
      testRequirements: {
        toefl: reqFlags.toefl,
        ielts: reqFlags.ielts,
        duolingo: reqFlags.duolingo,
        melab: reqFlags.melab,
        pte: reqFlags.pte,
        sop: reqFlags.sop,
        transcript: reqFlags.transcript,
        resumeCV: reqFlags.resume_cs,
        recommendations: reqFlags.recommendations,
        applicationForm: reqFlags.application_form,
        applicationFee: reqFlags.application_fee,
      },

      // Admissions block (with both raw counts and computed rates like PHP)
      admissions: {
        men: {
          numberApplied: convertNumber(school.men_number_applied),
          numberAdmitted: convertNumber(school.men_number_admitted),
          enrolledFullTime: menFT,
          enrolledPartTime: menPT,
        },
        women: {
          numberApplied: convertNumber(school.women_number_applied),
          numberAdmitted: convertNumber(school.women_number_admitted),
          enrolledFullTime: womenFT,
          enrolledPartTime: womenPT,
        },
        numberEnrolled: totalEnrolled,
        acceptanceRate: acceptanceRate === "" ? "" : acceptanceRate, // '' if invalid
        enrolledRate: totalYield === "" ? "" : totalYield, // '' if invalid
        menAcceptanceRate: menAcceptanceRate === "" ? "" : menAcceptanceRate,
        womenAcceptanceRate:
          womenAcceptanceRate === "" ? "" : womenAcceptanceRate,
        menEnrolledRate: menYield === "" ? "" : menYield,
        womenEnrolledRate: womenYield === "" ? "" : womenYield,
      },

      // Students tab numbers (from dedicated metas, not gender-enrolled sums)
      students: {
        men: menStudent,
        women: womenStudent,
        fullTime: fullTimeStudent,
        partTime: partTimeStudent,
        undergrad: undergradeStudent,
        graduate: graduateStudent,
        total: menStudent + womenStudent,
      },

      // Race & Ethnicity (pass through)
      race_asian_and_pacific_islander:
        school.race_asian_and_pacific_islander || null,
      race_black: school.race_black || null,
      race_hispanic: school.race_hispanic || null,
      race_native_american: school.race_native_american || null,
      race_white: school.race_white || null,
      race_other: school.race_other || null,

      favorite: false, // set below
    };

    // 3) favorite flag (unchanged)
    const [userData] = await db.query(
      `SELECT ID FROM qacom_wp_users WHERE user_email = ?`,
      [email]
    );
    if (userData && userData.length > 0) {
      const userId = userData[0].ID;
      const [favoritesData] = await db.query(
        `
        SELECT meta_value
        FROM qacom_wp_usermeta
        WHERE user_id = ? AND meta_key = 'my_professors_list'
        `,
        [userId]
      );
      if (
        favoritesData &&
        favoritesData.length > 0 &&
        favoritesData[0].meta_value
      ) {
        const serializedData = favoritesData[0].meta_value;
        const arrayPattern = /a:(\\d+):{(.*?)}/s;
        const match = serializedData.match(arrayPattern);
        if (match) {
          const favoriteIds = new Set();
          const itemPattern = /i:(\\d+);s:(\\d+):"(\\d+)";/g;
          let m;
          while ((m = itemPattern.exec(match[2])) !== null) {
            favoriteIds.add(m[3]);
          }
          response.favorite = favoriteIds.has(String(school.id));
        }
      }
    }

    return res.json(response);
  } catch (error) {
    console.error("Error fetching school:", error);
    return res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

// API endpoint to toggle school favorites
router.post("/favorites/schools", authenticateToken, async (req, res) => {
  try {
    const { schoolId, action } = req.body; // action: 'add' or 'remove'
    const { email } = req.user;

    if (!schoolId || !action || (action !== "add" && action !== "remove")) {
      return res.status(400).json({ error: "Invalid request parameters" });
    }

    // Get user ID from email
    const [userData] = await db.query(
      `
      SELECT ID
      FROM qacom_wp_users
      WHERE user_email = ?
    `,
      [email]
    );

    if (!userData || userData.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = userData[0].ID;

    // Check if the school exists
    const [schoolData] = await db.query(
      `
      SELECT id, name
      FROM qacom_wp_apply_schools
      WHERE id = ?
    `,
      [schoolId]
    );

    if (!schoolData || schoolData.length === 0) {
      return res.status(404).json({ error: "School not found" });
    }

    const schoolName = schoolData[0].name;

    // Get current favorites list
    const [favoritesData] = await db.query(
      `
      SELECT meta_value
      FROM qacom_wp_usermeta
      WHERE user_id = ? AND meta_key = 'my_professors_list'
    `,
      [userId]
    );

    let favorites = [];

    if (
      favoritesData &&
      favoritesData.length > 0 &&
      favoritesData[0].meta_value
    ) {
      // Parse the serialized PHP array format
      const serializedData = favoritesData[0].meta_value;
      const arrayPattern = /a:(\d+):{(.*?)}/s;
      const match = serializedData.match(arrayPattern);

      if (match) {
        // Extract values using regex
        const itemPattern = /i:(\d+);s:(\d+):"(\d+)";/g;
        let itemMatch;

        while ((itemMatch = itemPattern.exec(match[2])) !== null) {
          favorites.push(itemMatch[3]); // The school ID
        }
      }
    }

    // Add or remove the school ID
    const schoolIdStr = String(schoolId);
    if (action === "add") {
      if (!favorites.includes(schoolIdStr)) {
        favorites.push(schoolIdStr);
      }
    } else {
      favorites = favorites.filter((id) => id !== schoolIdStr);
    }

    // Serialize back to PHP array format
    let serializedFavorites = `a:${favorites.length}:{`;
    favorites.forEach((id, index) => {
      serializedFavorites += `i:${index};s:${id.length}:"${id}";`;
    });
    serializedFavorites += "}";

    // Update or insert the meta
    const [existingMeta] = await db.query(
      `
      SELECT umeta_id
      FROM qacom_wp_usermeta
      WHERE user_id = ? AND meta_key = 'my_professors_list'
    `,
      [userId]
    );

    if (existingMeta && existingMeta.length > 0) {
      // Update existing meta
      await db.query(
        `
        UPDATE qacom_wp_usermeta
        SET meta_value = ?
        WHERE user_id = ? AND meta_key = 'my_professors_list'
      `,
        [serializedFavorites, userId]
      );
    } else {
      // Insert new meta
      await db.query(
        `
        INSERT INTO qacom_wp_usermeta (user_id, meta_key, meta_value)
        VALUES (?, 'my_professors_list', ?)
      `,
        [userId, serializedFavorites]
      );
    }

    res.json({
      success: true,
      message:
        action === "add"
          ? `Added ${schoolName} to favorites`
          : `Removed ${schoolName} from favorites`,
      favorites,
    });
  } catch (error) {
    console.error("Error managing favorites:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

// API endpoint to get user's favorite schools
router.get("/favorites/schools", authenticateToken, async (req, res) => {
  try {
    const { email } = req.user;

    // Get user ID from email
    const [userData] = await db.query(
      `
      SELECT ID
      FROM qacom_wp_users
      WHERE user_email = ?
    `,
      [email]
    );

    if (!userData || userData.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = userData[0].ID;

    // Get current favorites list
    const [favoritesData] = await db.query(
      `
      SELECT meta_value
      FROM qacom_wp_usermeta
      WHERE user_id = ? AND meta_key = 'my_professors_list'
    `,
      [userId]
    );

    let favorites = [];

    if (
      favoritesData &&
      favoritesData.length > 0 &&
      favoritesData[0].meta_value
    ) {
      // Parse the serialized PHP array format
      const serializedData = favoritesData[0].meta_value;
      const arrayPattern = /a:(\d+):{(.*?)}/s;
      const match = serializedData.match(arrayPattern);

      if (match) {
        // Extract values using regex
        const itemPattern = /i:(\d+);s:(\d+):"(\d+)";/g;
        let itemMatch;

        while ((itemMatch = itemPattern.exec(match[2])) !== null) {
          favorites.push(itemMatch[3]); // The school ID
        }
        favorites.sort((a, b) => Number(a) - Number(b));
      }
    }

    res.json({ favorites });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

//API endpoint compare schools
router.get("/compare-schools/:ids", authenticateToken, async (req, res) => {
  try {
    const { ids } = req.params;
    const schoolIds = ids.split(",").map((id) => parseInt(id.trim(), 10));
    const { email } = req.user;

    if (!schoolIds.length) {
      return res.status(400).json({ error: "No school IDs provided" });
    }

    // --- Phase 1: concurrent queries ---
    const [
      mainSchoolsQueryResult,
      programCountsQueryResult,
      programsMatrixQueryResult,
      imageMetasQueryResult,
      favoritesDataQueryResult,
      userDataQueryResult,
      // NEW: programs matrix (discipline-level)
    ] = await Promise.all([
      db.query(
        `
        SELECT
          s.id,
          MAX(s.name)  AS name,
          MAX(s.country) AS country,
          MAX(s.state)   AS state,
          MAX(s.kind)    AS kind,
          MAX(s.link)    AS link,
          MAX(s.image)   AS image,

          -- Rankings
          MAX(CASE WHEN sm.meta_key = 'qs_rank'       THEN sm.meta_value END) AS qs_rank,
          MAX(CASE WHEN sm.meta_key = 'us_news_rank'  THEN sm.meta_value END) AS us_news_rank,
          MAX(CASE WHEN sm.meta_key = 'forbes_rank'   THEN sm.meta_value END) AS forbes_rank,
          MAX(CASE WHEN sm.meta_key = 'shanghai_rank' THEN sm.meta_value END) AS shanghai_rank,
          MAX(CASE WHEN sm.meta_key = 'the_rank'      THEN sm.meta_value END) AS the_rank,

          -- Identity
          MAX(CASE WHEN sm.meta_key = 'description' THEN sm.meta_value END) AS description,
          MAX(CASE WHEN sm.meta_key = 'founded'     THEN sm.meta_value END) AS founded,
          MAX(CASE WHEN sm.meta_key = 'type'        THEN sm.meta_value END) AS type,
          MAX(CASE WHEN sm.meta_key = 'address'     THEN sm.meta_value END) AS address,
          MAX(CASE WHEN sm.meta_key = 'phone'       THEN sm.meta_value END) AS phone,

          -- Tests
          MAX(CASE WHEN sm.meta_key = 'toefl'          THEN sm.meta_value END) AS toefl,
          MAX(CASE WHEN sm.meta_key = 'ielts'          THEN sm.meta_value END) AS ielts,
          MAX(CASE WHEN sm.meta_key = 'duolingo'       THEN sm.meta_value END) AS duolingo,
          MAX(CASE WHEN sm.meta_key = 'melab'          THEN sm.meta_value END) AS melab,
          MAX(CASE WHEN sm.meta_key = 'pte'            THEN sm.meta_value END) AS pte,
          MAX(CASE WHEN sm.meta_key = 'sop'            THEN sm.meta_value END) AS sop,
          MAX(CASE WHEN sm.meta_key = 'transcript'     THEN sm.meta_value END) AS transcript,
          MAX(CASE WHEN sm.meta_key = 'resume_cs'      THEN sm.meta_value END) AS resume_cs,
          MAX(CASE WHEN sm.meta_key = 'recommendations'THEN sm.meta_value END) AS recommendations,
          MAX(CASE WHEN sm.meta_key = 'application_form' THEN sm.meta_value END) AS application_form,
          MAX(CASE WHEN sm.meta_key = 'application_fee'  THEN sm.meta_value END) AS application_fee,

          -- Admissions (applied/admitted/enrolled by gender)
          MAX(CASE WHEN sm.meta_key = 'men_number_applied'   THEN sm.meta_value END) AS men_number_applied,
          MAX(CASE WHEN sm.meta_key = 'women_number_applied' THEN sm.meta_value END) AS women_number_applied,
          MAX(CASE WHEN sm.meta_key = 'men_number_admitted'  THEN sm.meta_value END) AS men_number_admitted,
          MAX(CASE WHEN sm.meta_key = 'women_number_admitted'THEN sm.meta_value END) AS women_number_admitted,
          MAX(CASE WHEN sm.meta_key = 'men_number_enrolled_full_time'   THEN sm.meta_value END) AS men_number_enrolled_full_time,
          MAX(CASE WHEN sm.meta_key = 'men_number_enrolled_part_time'   THEN sm.meta_value END) AS men_number_enrolled_part_time,
          MAX(CASE WHEN sm.meta_key = 'women_number_enrolled_full_time' THEN sm.meta_value END) AS women_number_enrolled_full_time,
          MAX(CASE WHEN sm.meta_key = 'women_number_enrolled_part_time' THEN sm.meta_value END) AS women_number_enrolled_part_time,

          -- Students (totals)
          MAX(CASE WHEN sm.meta_key = 'men_student'    THEN sm.meta_value END) AS men_student,
          MAX(CASE WHEN sm.meta_key = 'women_student'  THEN sm.meta_value END) AS women_student,
          MAX(CASE WHEN sm.meta_key = 'graduate_student'   THEN sm.meta_value END) AS graduate_student,
          MAX(CASE WHEN sm.meta_key = 'undergrade_student' THEN sm.meta_value END) AS undergrade_student,

          -- Costs (full breakdown)
          MAX(CASE WHEN sm.meta_key = 'cost_undergrade_in_state'  THEN sm.meta_value END) AS cost_undergrade_in_state,
          MAX(CASE WHEN sm.meta_key = 'cost_undergrade_out_of_state' THEN sm.meta_value END) AS cost_undergrade_out_of_state,
          MAX(CASE WHEN sm.meta_key = 'cost_graduate_in_state'    THEN sm.meta_value END) AS cost_graduate_in_state,
          MAX(CASE WHEN sm.meta_key = 'cost_graduate_out_of_state'THEN sm.meta_value END) AS cost_graduate_out_of_state,
          MAX(CASE WHEN sm.meta_key = 'cost_room_and_board'       THEN sm.meta_value END) AS cost_room_and_board,
          MAX(CASE WHEN sm.meta_key = 'cost_books_and_supplies'   THEN sm.meta_value END) AS cost_books_and_supplies,
          MAX(CASE WHEN sm.meta_key = 'cost_other_expenses'       THEN sm.meta_value END) AS cost_other_expenses,

          -- Race & Ethnicity
          MAX(CASE WHEN sm.meta_key = 'race_asian_and_pacific_islander' THEN sm.meta_value END) AS race_asian_and_pacific_islander,
          MAX(CASE WHEN sm.meta_key = 'race_black'   THEN sm.meta_value END) AS race_black,
          MAX(CASE WHEN sm.meta_key = 'race_hispanic'THEN sm.meta_value END) AS race_hispanic,
          MAX(CASE WHEN sm.meta_key = 'race_native_american' THEN sm.meta_value END) AS race_native_american,
          MAX(CASE WHEN sm.meta_key = 'race_white'   THEN sm.meta_value END) AS race_white,
          MAX(CASE WHEN sm.meta_key = 'race_other'   THEN sm.meta_value END) AS race_other,

          -- Graduation rate (old UI)
          MAX(CASE WHEN sm.meta_key = 'gr_6_years' THEN sm.meta_value END) AS gr_6_years

        FROM qacom_wp_apply_schools s
        LEFT JOIN qacom_wp_apply_schools_meta sm ON s.id = sm.school_id
        WHERE s.id IN (?)
        GROUP BY s.id
      `,
        [schoolIds]
      ),
      // 2) counts
      db.query(
        `
    SELECT
      school_id,
      SUM(CASE WHEN level = 'Bachelor' THEN 1 ELSE 0 END) AS bachelor_count,
      SUM(CASE WHEN level = 'Master'   THEN 1 ELSE 0 END) AS master_count,
      SUM(CASE WHEN level = 'Ph.D.'    THEN 1 ELSE 0 END) AS phd_count
    FROM qacom_wp_apply_programs_relationship
    WHERE school_id IN (?) AND status = 'publish'
    GROUP BY school_id
  `,
        [schoolIds]
      ),

      // Programs matrix from relationship table (no join needed)
      db.query(
        `
  SELECT
    pr.id         AS rel_id,
    pr.school_id,
    pr.title      AS discipline,
    pr.level,
    pr.type,
    pr.sub_program,
    pr.title_link,
    pr.program_id
  FROM qacom_wp_apply_programs_relationship AS pr
  WHERE pr.school_id IN (?) AND pr.status = 'publish'
  `,
        [schoolIds]
      ),

      // image meta (same as before)
      (async () => {
        const [tempMainSchools] = await db.query(
          `SELECT id, image FROM qacom_wp_apply_schools WHERE id IN (?)`,
          [schoolIds]
        );
        const imagePostMetaIds = tempMainSchools
          .filter((s) => /^[0-9]+$/.test(s.image))
          .map((s) => parseInt(s.image));
        if (imagePostMetaIds.length > 0) {
          return db.query(
            `SELECT post_id, meta_value FROM qacom_wp_postmeta WHERE post_id IN (?) AND meta_key = '_wp_attached_file'`,
            [imagePostMetaIds]
          );
        }
        return [[]];
      })(),

      // favorites
      db.query(
        `
        SELECT ID, um.meta_key, um.meta_value
        FROM qacom_wp_users u
        LEFT JOIN qacom_wp_usermeta um ON u.ID = um.user_id
        WHERE u.user_email = ? AND um.meta_key = 'my_professors_list'
      `,
        [email]
      ),

      // user id
      email
        ? db.query(`SELECT ID FROM qacom_wp_users WHERE user_email = ?`, [
            email,
          ])
        : [[]],

      // NEW: programs matrix (discipline + level)
    ]);

    // Extract rows
    const mainSchools = mainSchoolsQueryResult[0];
    const programCounts = programCountsQueryResult[0];
    const programsMatrixRows = programsMatrixQueryResult[0];
    const imageMetas = imageMetasQueryResult[0];
    const favoritesData = favoritesDataQueryResult[0];
    const userDataForId = Array.isArray(userDataQueryResult)
      ? userDataQueryResult[0]
      : [];

    if (!mainSchools || mainSchools.length === 0) {
      return res.status(404).json({ error: "No schools found for comparison" });
    }
    const BASE_SITE_URL = "https://questapply.com";

    const normalizeLevel = (lvRaw = "") => {
      const lv = String(lvRaw).toLowerCase();
      if (lv.includes("ph")) return "Ph.D.";
      if (lv.includes("master")) return "Master";
      if (lv.includes("bachelor")) return "Bachelor";
      return lvRaw || "Master";
    };

    const slugify = (s = "") =>
      String(s)
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    const buildProgramUrl = (levelRaw, programId, schoolId, discipline) => {
      const level = normalizeLevel(levelRaw);
      const programParam = programId ? String(programId) : slugify(discipline);
      return `${BASE_SITE_URL}/find-program/?level=${encodeURIComponent(
        level
      )}&program=${encodeURIComponent(
        programParam
      )}&school=${encodeURIComponent(schoolId)}`;
    };

    // --- Build programsMatrix by school (degree-specific URLs)
    const programsMatrixBySchool = new Map();

    programsMatrixRows.forEach((row) => {
      const sid = row.school_id;

      const labelRaw = (row.discipline && String(row.discipline).trim()) || "";
      if (!labelRaw) return;

      const labelKey = labelRaw.toLowerCase();
      const label = labelRaw;

      if (!programsMatrixBySchool.has(sid))
        programsMatrixBySchool.set(sid, new Map());
      const dMap = programsMatrixBySchool.get(sid);

      if (!dMap.has(labelKey)) {
        dMap.set(labelKey, {
          discipline: label,
          bachelor: false,
          master: false,
          phd: false,
          bachelorId: null,
          masterId: null,
          phdId: null,
          bachelorRelId: null,
          masterRelId: null,
          phdRelId: null,
          bachelorUrl: null,
          masterUrl: null,
          phdUrl: null,
          degreeType: row.type || null,
          subProgram: row.sub_program || null,
        });
      }
      const rec = dMap.get(labelKey);
      const relId = Number(row.rel_id ?? row.id) || null;
      const norm = normalizeLevel(row.level);
      const pid = row.program_id ? Number(row.program_id) : null;
      const url = buildProgramUrl(norm, row.program_id, sid, label);

      if (norm === "Bachelor") {
        rec.bachelor = true;
        rec.bachelorId = pid;
        rec.bachelorRelId = relId;
        rec.bachelorUrl = url;
      } else if (norm === "Master") {
        rec.master = true;
        rec.masterId = pid;
        rec.masterRelId = relId;
        rec.masterUrl = url;
      } else if (norm === "Ph.D.") {
        rec.phd = true;
        rec.phdId = pid;
        rec.phdRelId = relId;
        rec.phdUrl = url;
      }

      dMap.set(label, rec);
    });

    // Image meta map
    const imageMetaMap = new Map();
    imageMetas.forEach((imgMeta) =>
      imageMetaMap.set(imgMeta.post_id, imgMeta.meta_value)
    );

    // Build final
    const schoolsMap = new Map();

    mainSchools.forEach((school) => {
      // location
      const countryName =
        countryMap[school.country] || `Unknown (${school.country})`;
      const cleanCountryName = countryName.replace(/\s*\([^)]*\)/g, "").trim();
      const location = `${cleanCountryName}${
        school.state ? `, ${decodeHtmlEntities(school.state)}` : ""
      }`;

      // tests
      const testRequirements = {
        toefl: school.toefl === "1",
        ielts: school.ielts === "1",
        duolingo: school.duolingo === "1",
        melab: school.melab === "1",
        pte: school.pte === "1",
        sop: school.sop === "1",
        transcript: school.transcript === "1",
        resumeCV: school.resume_cs === "1",
        recommendations: school.recommendations === "1",
        applicationForm: school.application_form === "1",
        applicationFee: school.application_fee === "1",
      };

      // admissions & rates
      const menApplied = convertNumber(school.men_number_applied);
      const womenApplied = convertNumber(school.women_number_applied);
      const menAdmitted = convertNumber(school.men_number_admitted);
      const womenAdmitted = convertNumber(school.women_number_admitted);

      const men = convertNumber(school.men_student) || 0;
      const women = convertNumber(school.women_student) || 0;
      const menFT = convertNumber(school.men_number_enrolled_full_time) || 0;
      const menPT = convertNumber(school.men_number_enrolled_part_time) || 0;
      const womenFT =
        convertNumber(school.women_number_enrolled_full_time) || 0;
      const womenPT =
        convertNumber(school.women_number_enrolled_part_time) || 0;

      const totalApplied = menApplied + womenApplied;
      const totalAdmitted = menAdmitted + womenAdmitted;
      const numberEnrolled = menFT + menPT + womenFT + womenPT;

      const acceptanceRate =
        totalApplied > 0
          ? Math.round((totalAdmitted / totalApplied) * 100)
          : null;
      const enrolledRate =
        totalAdmitted > 0
          ? Math.round((numberEnrolled / totalAdmitted) * 100)
          : null;

      // students breakdown (old UI)
      const students = {
        men: convertNumber(school.men_student),
        women: convertNumber(school.women_student),
        fullTime: menFT + womenFT,
        partTime: menPT + womenPT,
        undergrad: convertNumber(school.undergrade_student),
        graduate: convertNumber(school.graduate_student),
        total:
          convertNumber(school.men_student) +
          convertNumber(school.women_student),
      };

      // costs breakdown
      const undergradInState = convertNumber(school.cost_undergrade_in_state);
      const undergradOutState = convertNumber(
        school.cost_undergrade_out_of_state
      );
      const gradInState = convertNumber(school.cost_graduate_in_state);
      const gradOutState = convertNumber(school.cost_graduate_out_of_state);
      const roomAndBoard = convertNumber(school.cost_room_and_board);
      const booksAndSupplies = convertNumber(school.cost_books_and_supplies);
      const otherExpenses = convertNumber(school.cost_other_expenses);

      const costDetails = {
        undergradInState,
        undergradOutState,
        gradInState,
        gradOutState,
        booksAndSupplies,
        roomAndBoard,
        otherExpenses,
        totalInState:
          (undergradInState || 0) +
          (gradInState || 0) +
          (roomAndBoard || 0) +
          (booksAndSupplies || 0) +
          (otherExpenses || 0),
        totalOutState:
          (undergradOutState || 0) +
          (gradOutState || 0) +
          (roomAndBoard || 0) +
          (booksAndSupplies || 0) +
          (otherExpenses || 0),
      };

      // programs counts + matrix
      const pc = programCounts.find((x) => x.school_id === school.id) || {};
      const programCountsObj = {
        bachelor: convertNumber(pc.bachelor_count),
        master: convertNumber(pc.master_count),
        phd: convertNumber(pc.phd_count),
      };
      const matrixMap = programsMatrixBySchool.get(school.id);
      const programsMatrix = matrixMap ? Array.from(matrixMap.values()) : [];

      // graduation rate from meta if available (old UI shows Enrolled Rate; keep both)
      const graduationRate = school.gr_6_years
        ? convertNumber(school.gr_6_years)
        : null;

      const schoolObj = {
        id: school.id,
        name: decodeHtmlEntities(school.name),
        location,
        logo: school.image || "", // will resolve below if numeric
        ranking: {
          qs: convertNumber(school.qs_rank),
          usNews: convertNumber(school.us_news_rank),
          forbes: convertNumber(school.forbes_rank),
          shanghai: convertNumber(school.shanghai_rank),
          the: convertNumber(school.the_rank),
        },

        // Keep old 'programs' array of strings for compatibility, AND provide structured versions
        programs: [], // (kept but you can ignore on FE)
        programCounts: programCountsObj, // ✅ counts
        programsMatrix, // ✅ matrix [{discipline,bachelor,master,phd}]

        // legacy quick fields (kept as-is)
        acceptance: acceptanceRate ?? 0,
        graduation: graduationRate ?? 0,

        // NEW: cost details (for old-UI Cost section)
        cost: {
          // keep legacy simple fields (unchanged)
          inState: convertNumber(school.cost_graduate_in_state), // legacy
          outState: convertNumber(school.cost_undergrade_out_of_state), // legacy
          // detailed breakdown:
          ...costDetails,
        },

        description: school.description || "",
        founded: convertNumber(school.founded) || undefined,
        type: school.type || "",
        address: school.address || "",
        phone: school.phone || "",

        testRequirements,

        race_asian_and_pacific_islander:
          school.race_asian_and_pacific_islander || null,
        race_black: school.race_black || null,
        race_hispanic: school.race_hispanic || null,
        race_native_american: school.race_native_american || null,
        race_white: school.race_white || null,
        race_other: school.race_other || null,

        // admissions with enrolledRate & numberEnrolled (for old-UI "Enrolled Rate")
        admissions: {
          men: {
            numberApplied: menApplied,
            numberAdmitted: menAdmitted,
            enrolledFullTime: menFT,
            enrolledPartTime: menPT,
          },
          women: {
            numberApplied: womenApplied,
            numberAdmitted: womenAdmitted,
            enrolledFullTime: womenFT,
            enrolledPartTime: womenPT,
          },
          numberEnrolled, // ✅ new
          acceptanceRate, // %
          enrolledRate, // %  (NumberEnrolled / NumberAdmitted)
          graduationRate, // %  (if available)
        },

        // old-UI Students block
        students,

        // will fill favorite later
        favorite: false,
      };

      schoolsMap.set(school.id, schoolObj);
    });

    // Resolve logo URLs
    schoolsMap.forEach((school) => {
      const raw = String(school.logo || "");

      if (/^\d+$/.test(raw)) {
        const postId = parseInt(raw, 10);
        const meta = imageMetaMap.get(postId);
        school.logo = buildUploadsUrl(meta || "");
      } else {
        school.logo = buildUploadsUrl(raw);
      }
    });

    // Mark favorite schools (ESM-safe + graceful fallback)
    if (userDataForId && userDataForId.length > 0) {
      const favoriteSchoolIds = new Set();

      try {
        const rawVal = favoritesData?.[0]?.meta_value;
        if (rawVal) {
          let parsed = null;

          try {
            parsed = phpUnserialize(rawVal);
          } catch (_) {
            try {
              parsed = JSON.parse(rawVal);
            } catch (_) {}
          }

          if (Array.isArray(parsed)) {
            parsed.forEach((id) => favoriteSchoolIds.add(String(id)));
          } else if (parsed && typeof parsed === "object") {
            Object.values(parsed).forEach((id) =>
              favoriteSchoolIds.add(String(id))
            );
          }
        }
      } catch (e) {
        console.error("favorites parse error:", e);
      }

      schoolsMap.forEach((school) => {
        school.favorite = favoriteSchoolIds.has(String(school.id));
      });
    }

    const finalSchools = Array.from(schoolsMap.values());
    res.json(finalSchools);
  } catch (error) {
    console.error("Error comparing schools:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

// API endpoint resolve for program
router.get("/program-data/resolve", authenticateToken, async (req, res) => {
  try {
    const { program, school, level } = req.query;
    if (!program) return res.status(400).json({ error: "program is required" });

    if (/^\d+$/.test(String(program))) {
      return res.json({ id: Number(program) });
    }

    const normalizeLevel = (lvRaw = "") => {
      const lv = String(lvRaw).toLowerCase();
      if (lv.startsWith("ph")) return "Ph.D.";
      if (lv.startsWith("mast")) return "Master";
      if (lv.startsWith("bach")) return "Bachelor";
      return lvRaw || null;
    };
    const normLevel = normalizeLevel(level || "");

    const slugify = (s = "") =>
      String(s)
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    const params = [];
    let sql = `
      SELECT program_id, school_id, title, level, title_link, sub_program
      FROM qacom_wp_apply_programs_relationship
      WHERE status = 'publish'
    `;
    if (school) {
      sql += ` AND school_id = ?`;
      params.push(Number(school));
    }
    if (normLevel) {
      sql += ` AND LOWER(level) LIKE ?`;
      params.push(normLevel.toLowerCase().slice(0, 3) + "%");
    }

    const [rows] = await db.query(sql, params);
    const target = slugify(String(program));

    const match = rows.find((r) => {
      const candidates = [r.title, r.title_link, r.sub_program]
        .filter(Boolean)
        .map(slugify);
      return candidates.includes(target);
    });

    if (!match) {
      return res.status(404).json({ error: "Program not found" });
    }

    return res.json({ id: match.program_id });
  } catch (err) {
    console.error("resolve program error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// API endpoint to search schools
router.get("/schools/search", authenticateToken, async (req, res) => {
  try {
    const query = req.query.q?.toLowerCase() || "";

    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    // Query the database for schools matching the search term - only search by name
    const [rows] = await db.query(
      `SELECT id, name
       FROM qacom_wp_apply_schools
       WHERE LOWER(name) LIKE ?
       LIMIT 20`,
      [`%${query}%`]
    );

    // Return only id and name for selection
    const schools = rows.map((school) => ({
      id: school.id,
      name: decodeHtmlEntities(school.name),
    }));

    res.json(schools);
  } catch (error) {
    console.error("Error searching schools:", error);
    res.status(500).json({ error: "Failed to search schools" });
  }
});

export default router;

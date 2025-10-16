import express from "express";
import db from "../config/db.config.js";
import { countryMap } from "../config/constants.js";
import { countryCodeToName } from "../countries.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { decodeHtmlEntities } from "../utils/helpers.js";
const router = express.Router();
// API endpoint for user profile
router.get("/profile", authenticateToken, async (req, res) => {
  const { email } = req.user;

  try {
    const [users] = await db.query(
      `
      SELECT 
        u.user_nicename,
        u.user_login,
        u.user_email,
        um1.meta_value as user_plan,
        um2.meta_value as account_type
      FROM qacom_wp_users u
      LEFT JOIN qacom_wp_usermeta um1 ON u.ID = um1.user_id AND um1.meta_key = 'user_plan_set'
      LEFT JOIN qacom_wp_usermeta um2 ON u.ID = um2.user_id AND um2.meta_key = 'application_apply_yourself_type'
      WHERE u.user_email = ?`,
      [email]
    );

    if (!users || users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = users[0];

    const planMap = {
      0: "Free",
      1: "Basic",
      2: "Premium",
      3: "Concierge",
    };

    const accountType = user.account_type === "pro" ? "Pro" : "Free";
    const userPlan = parseInt(user.user_plan, 10);

    const formattedUser = {
      name: user.user_nicename || user.user_login,
      email: user.user_email,
      plan: accountType === "Free" ? "Free" : planMap[userPlan] || "Basic",
      accountType: accountType,
    };

    res.json(formattedUser);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

// Get All user meta
router.get("/all-meta", authenticateToken, async (req, res) => {
  const { email } = req.user;

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

  if (!userId) {
    return res.status(400).json({ error: "User ID not available in token." });
  }

  const excludedMetaKeys = [
    "admin_color",
    "closedpostboxes_dashboard",
    "closedpostboxes_documents",
    "closedpostboxes_post",
    "closedpostboxes_submitted_form",
    "closedpostboxes_ticket",
    "closedpostboxes_wpsc_cart_orders",
    "comment_shortcuts",
    "community-events-location",
    "default_password_nag",
    "dismissed_wp_pointers",
    "edit_wpsc_cart_orders_per_page",
    "itsec-password-strength",
    "itsec_last_password_change",
    "itsec_logs_page_screen_options",
    "itsec_user_activity_last_seen",
    "manageedit-documentscolumnshidden",
    "manageedit-documentscolumnshidden_default",
    "manageedit-pagecolumnshidden",
    "manageedit-pagecolumnshidden_default",
    "manageedit-postcolumnshidden",
    "manageedit-postcolumnshidden_default",
    "manageedit-ticketcolumnshidden",
    "manageedit-ticketcolumnshidden_default",
    "manageedit-wpsc_cart_orderscolumnshidden",
    "manageedit-wpsc_cart_orderscolumnshidden_default",
    "managenav-menuscolumnshidden",
    "managetoplevel_page_wpcodecolumnshidden",
    "meta-box-order_page",
    "meta-box-order_post",
    "meta-box-order_wpsc_cart_orders",
    "metaboxhidden_dashboard",
    "metaboxhidden_documents",
    "metaboxhidden_nav-menus",
    "metaboxhidden_post",
    "metaboxhidden_submitted_form",
    "metaboxhidden_ticket",
    "metaboxhidden_wpsc_cart_orders",
    "nav_menu_recently_edited",
    "nsl_user_avatar_md5",
    "qacom_wp_dashboard_quick_press_last_post_id",
    "qacom_wp_media_library_mode",
    "qacom_wp_persisted_preferences",
    "qacom_wp_user-settings",
    "qacom_wp_user-settings-time",
    "rank_math_primary_place",
    "rich_editing",
    "rocketcdn_dismiss_notice",
    "session_tokens",
    "show_admin_bar_front",
    "syntax_highlighting",
    "use_ssl",
    "_itsec_email_confirmed",
    "_itsec_has_logged_in",
    "_itsec_password_requirements",
    "_itsec_primary_dashboard",
  ];

  try {
    const placeholders = Array(excludedMetaKeys.length).fill("?").join(",");

    const [userMetaRows] = await db.query(
      `
      SELECT
        meta_key,
        meta_value
      FROM qacom_wp_usermeta
      WHERE user_id = ? AND meta_key NOT IN (${placeholders})`,
      [userId, ...excludedMetaKeys] // Pass userId first, then spread the excluded keys
    );

    if (!userMetaRows || userMetaRows.length === 0) {
      return res.json({});
    }

    const allUserMeta = userMetaRows.reduce((acc, row) => {
      acc[row.meta_key] = row.meta_value;
      return acc;
    }, {});

    res.json(allUserMeta);
  } catch (error) {
    console.error("Error fetching all user meta:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

router.get("/profile-form", authenticateToken, async (req, res) => {
  const { email } = req.user;

  try {
    // ----- User -----
    const [users] = await db.query(
      `SELECT u.ID, u.user_nicename, u.user_login, u.user_email
       FROM qacom_wp_users u
       WHERE u.user_email = ?`,
      [email]
    );
    if (!users || users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const userId = users[0].ID;

    // ----- Usermeta keys we need -----
    const keys = [
      "citizen",
      "country",
      "profile_education",
      "profile_education_json", // ← جدید (JSON Array of blocks)
      "application_country",
      "application_level",
      "application_program",
      "application_english_test",
      "application_english_score",

      // GRE
      "application_gre_total",
      "application_gre_verbal",
      "application_gre_quantitative",
      "application_gre_writing",

      // GMAT
      "application_gmat_total",
      "application_gmat_verbal",
      "application_gmat_quantitative",
      "application_gmat_writing",

      // LSAT
      "application_lsat_total",

      // SAT
      "application_sat_total",
      "application_sat_reading_writing",
      "application_sat_math",

      // ACT
      "application_act_total",
    ];

    const [userMetas] = await db.query(
      `
      SELECT meta_key, meta_value
      FROM qacom_wp_usermeta
      WHERE user_id = ? AND meta_key IN (${keys.map(() => "?").join(",")})
      `,
      [userId, ...keys]
    );

    const metaData = {};
    for (const row of userMetas) metaData[row.meta_key] = row.meta_value;

    // ----- Profile completeness (مثل قبل) -----
    const requiredProfileFields = [
      "profile_education",
      "application_country",
      "application_level",
      "application_english_test",
    ];
    let isProfileComplete = true;
    for (const field of requiredProfileFields) {
      const v = metaData[field];
      if (!v || String(v).trim() === "" || String(v).trim() === "a:0:{}") {
        isProfileComplete = false;
        break;
      }
    }

    // ----- Citizenship -----
    const citizenshipCode = metaData.citizen || "";
    const residenceCode = metaData.country || "";

    // ----- Education (اولویت با JSON جدید) -----
    const eduJsonRaw = metaData.profile_education_json;
    let educationData;

    if (eduJsonRaw) {
      try {
        const arr = JSON.parse(eduJsonRaw);
        educationData = {
          items: Array.isArray(arr)
            ? arr.map((b) => ({
                degree: b.degree || "",
                university: b.university || "",
                major: b.major || "",
                gpa: b.gpa || "",
                start: b.start || "",
                end: b.end || "",
              }))
            : [
                {
                  degree: "",
                  university: "",
                  major: "",
                  gpa: "",
                  start: "",
                  end: "",
                },
              ],
        };
      } catch {
        educationData = {
          items: [
            {
              degree: "",
              university: "",
              major: "",
              gpa: "",
              start: "",
              end: "",
            },
          ],
        };
      }
    } else {
      // ← فالبک به متای قدیمی (همان منطق قبلی + تلاش برای استخراج start/end)
      const single = {
        degree: "",
        university: "",
        major: "",
        gpa: "",
        start: "",
        end: "",
      };
      if (metaData.profile_education) {
        try {
          const raw = metaData.profile_education.replace(
            /^s:\d+:"(.*)"$/,
            "$1"
          );
          const pick = (regex) => {
            const m = raw.match(regex);
            if (!m) return "";
            const m2 = m[0].match(/i:0;s:\d+:"([^"]*)"/);
            return (m2 && m2[1]) || "";
          };

          // degree
          const levelMatch = raw.match(
            /s:5:"level";a:\d+:{(?:[^{}]|{[^{}]*})*}/
          );
          if (levelMatch) {
            const m = levelMatch[0].match(/i:0;s:\d+:"([^"]*)"/);
            if (m && m[1]) {
              let degree = m[1];
              if (degree === "Master") degree = "Master's Degree";
              else if (degree === "Bachelor") degree = "Bachelor's Degree";
              else if (degree === "PhD" || degree === "Ph.D.")
                degree = "Doctoral Degree";
              single.degree = degree;
            }
          }

          single.university = pick(
            /s:10:"university";a:\d+:{(?:[^{}]|{[^{}]*})*}/
          );
          single.major = pick(/s:7:"program";a:\d+:{(?:[^{}]|{[^{}]*})*}/);
          single.gpa = pick(/s:3:"gpa";a:\d+:{(?:[^{}]|{[^{}]*})*}/);

          // start/end (اگر وجود داشت)
          const startRaw = raw.match(
            /s:10:"start_date";a:\d+:{(?:[^{}]|{[^{}]*})*}/
          );
          if (startRaw) {
            const m = startRaw[0].match(/i:0;s:\d+:"([^"]*)"/);
            if (m && m[1]) {
              const y = (m[1] || "").slice(0, 4); // ← فقط سال
              single.start = /^\d{4}$/.test(y) ? y : "";
            }
          }

          const endRaw = raw.match(
            /s:8:"end_date";a:\d+:{(?:[^{}]|{[^{}]*})*}/
          );
          if (endRaw) {
            const m = endRaw[0].match(/i:0;s:\d+:"([^"]*)"/);
            if (m && m[1]) {
              const y = (m[1] || "").slice(0, 4); // ← فقط سال
              single.end = /^\d{4}$/.test(y) ? y : "";
            }
          }
        } catch (e) {
          console.error("Error parsing education data:", e);
        }
      }
      educationData = { items: [single] };
    }

    // ----- Goals / Destination -----
    const destinationData = {
      country: "",
      level: "",
      field: "",
      availableFields: [],
    };

    if (metaData.application_country) {
      const countryId = metaData.application_country;
      destinationData.country = {
        id: countryId,
        name: countryMap[countryId] || `Unknown (${countryId})`,
      };
    }

    if (metaData.application_level) {
      let level = metaData.application_level;
      if (level === "Ph.D." || level === "PHD") level = "PhD";
      else if (level === "Master") level = "Master's Degree";
      else if (level === "Bachelor") level = "Bachelor's Degree";
      destinationData.level = level;
    }

    if (metaData.application_program) {
      const programId = metaData.application_program;
      try {
        const [programRows] = await db.query(
          `SELECT id, name FROM qacom_wp_apply_programs WHERE id = ?`,
          [programId]
        );
        if (programRows && programRows.length > 0) {
          destinationData.field = { id: programId, name: programRows[0].name };
        } else {
          destinationData.field = { id: programId, name: "Selected Program" };
        }
      } catch (e) {
        console.error("Error fetching program name:", e);
        destinationData.field = { id: programId, name: "Selected Program" };
      }
    }

    // تمام برنامه‌ها برای availableFields
    try {
      const [allPrograms] = await db.query(
        `SELECT id, name FROM qacom_wp_apply_programs WHERE status = 'publish' ORDER BY name ASC`
      );
      const seen = new Set();
      const unique = [];
      for (const p of allPrograms) {
        if (!seen.has(p.id)) {
          unique.push({ id: String(p.id), name: p.name });
          seen.add(p.id);
        }
      }
      destinationData.availableFields = unique;

      if (metaData.application_program && destinationData.field) {
        const selId = String(destinationData.field.id);
        const exists = destinationData.availableFields.some(
          (f) => f.id === selId
        );
        if (!exists) {
          destinationData.availableFields.unshift({
            id: selId,
            name: destinationData.field.name || "Selected Program",
          });
        }
      }
    } catch (e) {
      console.error("Error fetching all programs:", e);
      destinationData.availableFields =
        destinationData.field && destinationData.field.id
          ? [
              {
                id: String(destinationData.field.id),
                name: destinationData.field.name || "Selected Program",
              },
            ]
          : [];
    }

    // ----- Language -----
    const languageData = { test: "", score: "" };
    if (metaData.application_english_test) {
      languageData.test = metaData.application_english_test;
      if (
        languageData.test !== "I don't have this" &&
        languageData.test !== "Not yet, but I will in the future" &&
        metaData.application_english_score
      ) {
        languageData.score = metaData.application_english_score;
      }
    }

    // ----- Tests (nested scores) -----
    const testsData = { type: "", scores: {} };
    const buildScores = (fieldToMetaKey) => {
      const out = {};
      for (const [field, key] of Object.entries(fieldToMetaKey)) {
        const v = metaData[key];
        if (v != null && String(v).trim() !== "") out[field] = v;
      }
      return out;
    };

    const GRE = buildScores({
      total: "application_gre_total",
      verbal: "application_gre_verbal",
      quantitative: "application_gre_quantitative",
      writing: "application_gre_writing",
    });
    if (Object.keys(GRE).length) {
      testsData.scores.gre = { scores: GRE };
      if (!testsData.type) testsData.type = "gre";
    }

    const GMAT = buildScores({
      total: "application_gmat_total",
      verbal: "application_gmat_verbal",
      quantitative: "application_gmat_quantitative",
      writing: "application_gmat_writing",
    });
    if (Object.keys(GMAT).length) {
      testsData.scores.gmat = { scores: GMAT };
      if (!testsData.type) testsData.type = "gmat";
    }

    const LSAT = buildScores({ total: "application_lsat_total" });
    if (Object.keys(LSAT).length) {
      testsData.scores.lsat = { scores: LSAT };
      if (!testsData.type) testsData.type = "lsat";
    }

    const SAT = buildScores({
      total: "application_sat_total",
      reading_writing: "application_sat_reading_writing",
      math: "application_sat_math",
    });
    if (Object.keys(SAT).length) {
      testsData.scores.sat = { scores: SAT };
      if (!testsData.type) testsData.type = "sat";
    }

    const ACT = buildScores({ total: "application_act_total" });
    if (Object.keys(ACT).length) {
      testsData.scores.act = { scores: ACT };
      if (!testsData.type) testsData.type = "act";
    }

    // ----- Final payload -----
    const formData = {
      citizenship: {
        country: citizenshipCode
          ? {
              code: citizenshipCode,
              name: countryCodeToName[citizenshipCode] || "",
            }
          : "",
        residence: residenceCode
          ? {
              code: residenceCode,
              name: countryCodeToName[residenceCode] || "",
            }
          : "",
      },
      education: educationData, // ← حالا همیشه items دارد
      goals: destinationData,
      language: languageData,
      tests: testsData,
      isProfileComplete,
    };

    return res.json(formData);
  } catch (error) {
    console.error("Error fetching user profile form data:", error);
    return res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

// API endpoint For Profile Form Update Post
router.post("/profile-form", authenticateToken, async (req, res) => {
  const { email } = req.user;
  const { citizenship, education, goals, language, tests } = req.body;

  try {
    // --- Find user ID ---
    const [users] = await db.query(
      `SELECT ID FROM qacom_wp_users WHERE user_email = ?`,
      [email]
    );
    if (!users || users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const userId = users[0].ID;

    // --- Small helper ---
    const upsertMeta = async (key, value) => {
      const [rows] = await db.query(
        `SELECT umeta_id FROM qacom_wp_usermeta WHERE user_id = ? AND meta_key = ?`,
        [userId, key]
      );

      const isEmpty =
        value === undefined ||
        value === null ||
        (typeof value === "string" && value.trim() === "");

      if (isEmpty) {
        if (rows && rows.length > 0) {
          await db.query(
            `DELETE FROM qacom_wp_usermeta WHERE user_id = ? AND meta_key = ?`,
            [userId, key]
          );
        }
        return;
      }

      if (rows && rows.length > 0) {
        await db.query(
          `UPDATE qacom_wp_usermeta SET meta_value = ? WHERE user_id = ? AND meta_key = ?`,
          [value, userId, key]
        );
      } else {
        await db.query(
          `INSERT INTO qacom_wp_usermeta (user_id, meta_key, meta_value) VALUES (?, ?, ?)`,
          [userId, key, value]
        );
      }
    };

    // -----------------------------
    // Citizenship & Residence
    // -----------------------------
    if (citizenship?.country?.code) {
      await upsertMeta("citizen", citizenship.country.code);
    }
    if (citizenship?.residence?.code) {
      await upsertMeta("country", citizenship.residence.code);
    }

    // -----------------------------
    // Education (JSON + legacy serialize for first block)
    // -----------------------------
    if (education) {
      // 1) JSON جدید
      if (Array.isArray(education.items)) {
        const cleanItems = education.items.map((b) => ({
          degree: b.degree || "",
          university: b.university || "",
          major: b.major || "",
          gpa: b.gpa || "",
          start: b.start ?? b.startYear ?? "",
          end: b.end ?? b.endYear ?? "",
        }));
        await upsertMeta("profile_education_json", JSON.stringify(cleanItems));
      }

      // 2) legacy: با اولین بلاک
      const first =
        Array.isArray(education.items) && education.items.length
          ? education.items[0]
          : education;

      const normalizeDegree = (deg) => {
        if (deg === "Master's Degree") return "Master";
        if (deg === "Bachelor's Degree") return "Bachelor";
        if (deg === "Doctoral Degree" || deg === "PhD" || deg === "Ph.D.")
          return "Ph.D.";
        return deg || "";
      };

      const degree = normalizeDegree(first.degree || education.degree);
      const university = first.university || education.university || "";
      const major = first.major || education.major || "";
      const gpa = first.gpa || education.gpa || "";

      // سال ورودی → "YYYY-01" برای متای قدیمی
      const startYear = String(
        first.start ??
          first.startYear ??
          education.start ??
          education.startYear ??
          ""
      ).slice(0, 4);
      const endYear = String(
        first.end ?? first.endYear ?? education.end ?? education.endYear ?? ""
      ).slice(0, 4);
      const start = /^\d{4}$/.test(startYear) ? `${startYear}-01` : "";
      const end = /^\d{4}$/.test(endYear) ? `${endYear}-01` : "";
      const [existingEducationMeta] = await db.query(
        `SELECT meta_value FROM qacom_wp_usermeta WHERE user_id = ? AND meta_key = 'profile_education'`,
        [userId]
      );

      let updatedEducationData = null;

      if (
        existingEducationMeta &&
        existingEducationMeta.length > 0 &&
        existingEducationMeta[0].meta_value
      ) {
        try {
          const raw = existingEducationMeta[0].meta_value.replace(
            /^s:\d+:"(.*)"$/,
            "$1"
          );

          let updated = raw
            .replace(
              /s:5:"level";a:\d+:{i:0;s:\d+:"[^"]*"/,
              `s:5:"level";a:1:{i:0;s:${degree.length}:"${degree}"`
            )
            .replace(
              /s:10:"university";a:\d+:{i:0;s:\d+:"[^"]*"/,
              `s:10:"university";a:1:{i:0;s:${university.length}:"${university}"`
            )
            .replace(
              /s:7:"program";a:\d+:{i:0;s:\d+:"[^"]*"/,
              `s:7:"program";a:1:{i:0;s:${major.length}:"${major}"`
            )
            .replace(
              /s:3:"gpa";a:\d+:{i:0;s:\d+:"[^"]*"/,
              `s:3:"gpa";a:1:{i:0;s:${gpa.length}:"${gpa}"`
            );

          // start_date
          if (updated.includes('s:10:"start_date"')) {
            updated = updated.replace(
              /s:10:"start_date";a:\d+:{i:0;s:\d+:"[^"]*"}/,
              `s:10:"start_date";a:1:{i:0;s:${start.length}:"${start}"}`
            );
          } else {
            updated = updated.replace(
              /}$/,
              `s:10:"start_date";a:1:{i:0;s:${start.length}:"${start}";}}`
            );
          }

          // end_date
          if (updated.includes('s:8:"end_date"')) {
            updated = updated.replace(
              /s:8:"end_date";a:\d+:{i:0;s:\d+:"[^"]*"}/,
              `s:8:"end_date";a:1:{i:0;s:${end.length}:"${end}"}`
            );
          } else {
            updated = updated.replace(
              /}$/,
              `s:8:"end_date";a:1:{i:0;s:${end.length}:"${end}";}}`
            );
          }

          updatedEducationData = `s:${updated.length}:"${updated}";`;
        } catch (e) {
          console.error("Error updating existing education data:", e);
          updatedEducationData = existingEducationMeta[0].meta_value;
        }
      } else {
        // ساخت دادهٔ جدید legacy
        const serializedData =
          `a:7:{` +
          `s:7:"country";a:1:{i:0;s:2:"US";}` + // اگر نمی‌خوایش حذفش کن
          `s:10:"university";a:1:{i:0;s:${university.length}:"${university}";}` +
          `s:5:"level";a:1:{i:0;s:${degree.length}:"${degree}";}` +
          `s:7:"program";a:1:{i:0;s:${major.length}:"${major}";}` +
          `s:3:"gpa";a:1:{i:0;s:${gpa.length}:"${gpa}";}` +
          `s:10:"start_date";a:1:{i:0;s:${start.length}:"${start}";}` +
          `s:8:"end_date";a:1:{i:0;s:${end.length}:"${end}";}` +
          `}`;

        updatedEducationData = `s:${serializedData.length}:"${serializedData}";`;
      }

      await upsertMeta("profile_education", updatedEducationData);
    }

    // -----------------------------
    // Goals / Destination
    // -----------------------------
    if (goals) {
      if (goals.country?.id) {
        await upsertMeta("application_country", goals.country.id);
      }

      if (goals.level) {
        let dbLevel = goals.level;
        if (dbLevel === "PhD") dbLevel = "Ph.D.";
        else if (dbLevel === "Master's Degree") dbLevel = "Master";
        else if (dbLevel === "Bachelor's Degree") dbLevel = "Bachelor";
        await upsertMeta("application_level", dbLevel);
      }

      if (goals.field?.id) {
        await upsertMeta("application_program", goals.field.id);
      }
    }

    // -----------------------------
    // Language
    // -----------------------------
    if (language) {
      if (language.test) {
        await upsertMeta("application_english_test", language.test);

        const requiresScore =
          language.test !== "I don't have this" &&
          language.test !== "Not yet, but I will in the future" &&
          language.score &&
          language.score !== "N/A";

        if (requiresScore) {
          await upsertMeta("application_english_score", language.score);
        } else {
          await upsertMeta("application_english_score", "");
        }
      }
    }

    // -----------------------------
    // Standardized tests
    // -----------------------------
    if (tests && typeof tests === "object") {
      const TEST_META_MAP = {
        gre: {
          total: "application_gre_total",
          verbal: "application_gre_verbal",
          quantitative: "application_gre_quantitative",
          writing: "application_gre_writing",
        },
        gmat: {
          total: "application_gmat_total",
          verbal: "application_gmat_verbal",
          quantitative: "application_gmat_quantitative",
          writing: "application_gmat_writing",
        },
        lsat: { total: "application_lsat_total" },
        sat: {
          total: "application_sat_total",
          reading_writing: "application_sat_reading_writing",
          math: "application_sat_math",
        },
        act: { total: "application_act_total" },
      };

      const scoresRoot = tests.scores ?? tests;
      const payloadTestIds = Object.keys(scoresRoot).filter(
        (id) => TEST_META_MAP[id]
      );

      for (const testId of payloadTestIds) {
        const fieldMap = TEST_META_MAP[testId];
        const src = scoresRoot?.[testId]?.scores ?? scoresRoot?.[testId] ?? {};

        for (const fieldId of Object.keys(fieldMap)) {
          const metaKey = fieldMap[fieldId];
          const raw = src[fieldId];
          const val =
            raw === undefined || raw === null || String(raw).trim() === ""
              ? ""
              : String(raw);
          await upsertMeta(metaKey, val);
        }
      }
    }

    // -----------------------------
    // Profile completeness
    // -----------------------------
    const [userMetas] = await db.query(
      `SELECT meta_key, meta_value
       FROM qacom_wp_usermeta
       WHERE user_id = ?
         AND meta_key IN ('profile_education','application_country','application_level','application_english_test')`,
      [userId]
    );

    const metaMap = {};
    userMetas.forEach((m) => (metaMap[m.meta_key] = m.meta_value));

    const requiredMetaKeys = [
      "profile_education",
      "application_country",
      "application_level",
      "application_english_test",
    ];
    const isProfileComplete = requiredMetaKeys.every(
      (k) => metaMap[k] && metaMap[k] !== ""
    );

    return res.json({
      success: true,
      message: "Profile data updated successfully",
      isProfileComplete,
    });
  } catch (error) {
    console.error("Error updating user profile form data:", error);
    return res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

export default router;

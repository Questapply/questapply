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

// API endpoint For Profile Form Get
// router.get("/profile-form", authenticateToken, async (req, res) => {
//   const { email } = req.user;

//   try {
//     // دریافت اطلاعات پایه کاربر
//     const [users] = await db.query(
//       `
//       SELECT
//         u.ID,
//         u.user_nicename,
//         u.user_login,
//         u.user_email
//       FROM qacom_wp_users u
//       WHERE u.user_email = ?`,
//       [email]
//     );

//     if (!users || users.length === 0) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     const userId = users[0].ID;

//     // دریافت متاهای کاربر - فقط متاهای مربوط به کشور و آموزش
//     const [userMetas] = await db.query(
//       `
//       SELECT meta_key, meta_value
//       FROM qacom_wp_usermeta
//       WHERE user_id = ? AND meta_key IN ('citizen', 'country', 'profile_education', 'application_country',
//                                         'application_level', 'application_program', 'application_english_test',
//                                         'application_english_score', 'application_gre_total', 'application_gre_verbal',
//                                         'application_gre_quantitative', 'application_gre_writing', 'application_gmat_total',
//                                         'application_gmat_verbal', 'application_gmat_quantitative', 'application_gmat_writing',
//                                         'application_lsat_total')`,
//       [userId]
//     );

//     // تبدیل متاها به آبجکت
//     const metaData = {};
//     userMetas.forEach((meta) => {
//       metaData[meta.meta_key] = meta.meta_value;
//     });
//     const requiredProfileFields = [
//       "profile_education",
//       "application_country",
//       "application_level",
//       "application_english_test",
//     ];
//     let isProfileComplete = true;
//     for (const field of requiredProfileFields) {
//       if (
//         !metaData[field] ||
//         String(metaData[field]).trim() === "" ||
//         String(metaData[field]).trim() === "a:0:{}"
//       ) {
//         // a:0:{} برای آرایه های خالی PHP serialization
//         isProfileComplete = false;
//         break;
//       }
//     }
//     // تبدیل کد کشور به نام کامل کشور
//     const citizenship = metaData.citizen || "";
//     const currentCountry = metaData.country || "";

//     // پردازش داده‌های آموزشی
//     let educationData = {
//       degree: "",
//       university: "",
//       major: "",
//       gpa: "",
//     };

//     if (metaData.profile_education) {
//       try {
//         // متا profile_education به صورت سریالایز شده PHP ذخیره شده
//         // ابتدا تبدیل به رشته‌ای بدون s:xxx در ابتدا
//         const rawEducationData = metaData.profile_education.replace(
//           /^s:\d+:"(.*)"$/,
//           "$1"
//         );

//         // تبدیل به ساختار JSON
//         // می‌دانیم که داده به صورت a:7:{...} است که باید آن را پارس کنیم

//         // الگو برای تشخیص مقادیر level
//         const levelPattern = /s:5:"level";a:\d+:{(?:[^{}]|{[^{}]*})*}/;
//         const levelMatch = rawEducationData.match(levelPattern);

//         if (levelMatch) {
//           const levelData = levelMatch[0];
//           // استخراج اولین مقدار برای level
//           const levelValuePattern = /i:0;s:\d+:"([^"]*)"/;
//           const levelValueMatch = levelData.match(levelValuePattern);

//           if (levelValueMatch && levelValueMatch[1]) {
//             let degree = levelValueMatch[1];
//             // تبدیل به فرمت مورد نیاز
//             if (degree === "Master") {
//               degree = "Master's Degree";
//             } else if (degree === "Bachelor") {
//               degree = "Bachelor's Degree";
//             } else if (degree === "PhD" || degree === "Ph.D.") {
//               degree = "Doctoral Degree";
//             }
//             educationData.degree = degree;
//           }
//         }

//         // الگو برای تشخیص مقادیر university
//         const universityPattern =
//           /s:10:"university";a:\d+:{(?:[^{}]|{[^{}]*})*}/;
//         const universityMatch = rawEducationData.match(universityPattern);

//         if (universityMatch) {
//           const universityData = universityMatch[0];
//           // استخراج اولین مقدار برای university
//           const universityValuePattern = /i:0;s:\d+:"([^"]*)"/;
//           const universityValueMatch = universityData.match(
//             universityValuePattern
//           );

//           if (universityValueMatch && universityValueMatch[1]) {
//             educationData.university = universityValueMatch[1];
//           }
//         }

//         // الگو برای تشخیص مقادیر program (major)
//         const programPattern = /s:7:"program";a:\d+:{(?:[^{}]|{[^{}]*})*}/;
//         const programMatch = rawEducationData.match(programPattern);

//         if (programMatch) {
//           const programData = programMatch[0];
//           // استخراج اولین مقدار برای program
//           const programValuePattern = /i:0;s:\d+:"([^"]*)"/;
//           const programValueMatch = programData.match(programValuePattern);

//           if (programValueMatch && programValueMatch[1]) {
//             educationData.major = programValueMatch[1].trim();
//           }
//         }

//         // الگو برای تشخیص مقادیر gpa
//         const gpaPattern = /s:3:"gpa";a:\d+:{(?:[^{}]|{[^{}]*})*}/;
//         const gpaMatch = rawEducationData.match(gpaPattern);

//         if (gpaMatch) {
//           const gpaData = gpaMatch[0];
//           // استخراج اولین مقدار برای gpa
//           const gpaValuePattern = /i:0;s:\d+:"([^"]*)"/;
//           const gpaValueMatch = gpaData.match(gpaValuePattern);

//           if (gpaValueMatch && gpaValueMatch[1]) {
//             educationData.gpa = gpaValueMatch[1];
//           }
//         }
//       } catch (error) {
//         console.error("Error parsing education data:", error);
//       }
//     }

//     // پردازش داده‌های مقصد تحصیلی (destination)
//     let destinationData = {
//       country: "",
//       level: "",
//       field: "",
//     };

//     // دریافت کشور مقصد از متا
//     if (metaData.application_country) {
//       const countryId = metaData.application_country;
//       destinationData.country = {
//         id: countryId,
//         name: countryMap[countryId] || `Unknown (${countryId})`,
//       };
//     }

//     // دریافت سطح تحصیلی از متا
//     if (metaData.application_level) {
//       let level = metaData.application_level;

//       // تبدیل فرمت‌های مختلف به فرمت استاندارد UI
//       if (level === "Ph.D." || level === "PHD") {
//         level = "PhD";
//       } else if (level === "Master") {
//         level = "Master's Degree";
//       } else if (level === "Bachelor") {
//         level = "Bachelor's Degree";
//       }

//       destinationData.level = level;
//     }

//     // دریافت رشته تحصیلی از متا
//     let fieldName = "";
//     if (metaData.application_program) {
//       const programId = metaData.application_program;

//       // دریافت نام برنامه از جدول برنامه‌ها
//       try {
//         const [programRows] = await db.query(
//           `
//           SELECT id, name
//           FROM qacom_wp_apply_programs
//           WHERE id = ?
//         `,
//           [programId]
//         );

//         if (programRows && programRows.length > 0) {
//           fieldName = programRows[0].name;

//           destinationData.field = {
//             id: programId,
//             name: fieldName,
//           };
//         } else {
//           destinationData.field = {
//             id: programId,
//             name: "Selected Program",
//           };
//         }
//       } catch (error) {
//         console.error("Error fetching program name:", error);
//         destinationData.field = {
//           id: programId,
//           name: "Selected Program",
//         };
//       }
//     }

//     // دریافت لیست تمام برنامه‌های تحصیلی
//     let uniquePrograms = [];
//     try {
//       const [allPrograms] = await db.query(`
//         SELECT id, name
//         FROM qacom_wp_apply_programs
//         WHERE status = 'publish'
//         ORDER BY name ASC
//       `);

//       // حذف آیتم‌های تکراری با ID یکسان

//       const seenIds = new Set();

//       for (const program of allPrograms) {
//         if (!seenIds.has(program.id)) {
//           uniquePrograms.push({
//             id: String(program.id), // تبدیل به رشته
//             name: program.name,
//           });
//           seenIds.add(program.id);
//         } else {
//           console.log(
//             `Duplicate program ID found: ${program.id}, name: ${program.name}`
//           );
//         }
//       }

//       destinationData.availableFields = uniquePrograms.map((program) => ({
//         id: program.id,
//         name: program.name,
//       }));

//       // اگر program انتخاب شده در لیست نباشد، آن را اضافه کنیم
//       if (metaData.application_program && destinationData.field) {
//         const programId = String(metaData.application_program); // تبدیل به رشته
//         const selectedFieldExists = destinationData.availableFields.some(
//           (field) => field.id === programId
//         );

//         if (!selectedFieldExists && destinationData.field.id) {
//           // اضافه کردن به اول لیست تا به راحتی قابل مشاهده باشد
//           destinationData.availableFields.unshift({
//             id: String(destinationData.field.id), // تبدیل به رشته
//             name: destinationData.field.name || "Selected Program",
//           });
//         }
//       }
//     } catch (error) {
//       console.error("Error fetching all programs:", error);
//       destinationData.availableFields = [];

//       // اگر برنامه‌ها بارگیری نشدند ولی یک برنامه انتخاب شده داریم، آن را به عنوان تنها گزینه قرار دهیم
//       if (destinationData.field && destinationData.field.id) {
//         destinationData.availableFields = [
//           {
//             id: String(destinationData.field.id), // تبدیل به رشته
//             name: destinationData.field.name || "Selected Program",
//           },
//         ];
//       }
//     }

//     // پردازش داده‌های زبان انگلیسی
//     let languageData = {
//       test: "",
//       score: "",
//     };

//     if (metaData.application_english_test) {
//       languageData.test = metaData.application_english_test;

//       // اگر تست انتخاب شده نیاز به نمره دارد و نمره وجود دارد
//       if (
//         metaData.application_english_test !== "I don't have this" &&
//         metaData.application_english_test !==
//           "Not yet, but I will in the future" &&
//         metaData.application_english_score
//       ) {
//         languageData.score = metaData.application_english_score;
//       }
//     }

//     // پردازش داده‌های آزمون‌های استاندارد
//     let testsData = {
//       type: "",
//       scores: {},
//     };

//     // بررسی داده‌های GRE
//     const hasGreData =
//       metaData.application_gre_total ||
//       metaData.application_gre_verbal ||
//       metaData.application_gre_quantitative ||
//       metaData.application_gre_writing;

//     if (hasGreData) {
//       testsData.type = "gre";
//       testsData.scores.gre = {
//         total: metaData.application_gre_total || "",
//         verbal: metaData.application_gre_verbal || "",
//         quantitative: metaData.application_gre_quantitative || "",
//         writing: metaData.application_gre_writing || "",
//       };
//     }

//     // بررسی داده‌های GMAT
//     const hasGmatData =
//       metaData.application_gmat_total ||
//       metaData.application_gmat_verbal ||
//       metaData.application_gmat_quantitative ||
//       metaData.application_gmat_writing;

//     if (hasGmatData) {
//       if (!testsData.type) {
//         testsData.type = "gmat";
//       }
//       testsData.scores.gmat = {
//         total: metaData.application_gmat_total || "",
//         verbal: metaData.application_gmat_verbal || "",
//         quantitative: metaData.application_gmat_quantitative || "",
//         writing: metaData.application_gmat_writing || "",
//       };
//     }

//     // بررسی داده‌های LSAT
//     if (metaData.application_lsat_total) {
//       if (!testsData.type) {
//         testsData.type = "lsat";
//       }
//       testsData.scores.lsat = {
//         total: metaData.application_lsat_total || "",
//       };
//     }

//     const formData = {
//       citizenship: {
//         country: citizenship
//           ? {
//               code: citizenship,
//               name: countryCodeToName[citizenship] || "",
//             }
//           : "",
//         residence: currentCountry
//           ? {
//               code: currentCountry,
//               name: countryCodeToName[currentCountry] || "",
//             }
//           : "",
//       },
//       education: educationData,
//       goals: destinationData,
//       language: languageData,
//       tests: testsData,
//       isProfileComplete: isProfileComplete,
//     };

//     res.json(formData);
//   } catch (error) {
//     console.error("Error fetching user profile form data:", error);
//     res
//       .status(500)
//       .json({ error: "Internal server error", details: error.message });
//   }
// });

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

    // ----- Usermeta needed -----
    const keys = [
      "citizen",
      "country",
      "profile_education",
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

    // ----- Education (PHP-serialized) -----
    const educationData = { degree: "", university: "", major: "", gpa: "" };
    if (metaData.profile_education) {
      try {
        const raw = metaData.profile_education.replace(/^s:\d+:"(.*)"$/, "$1");

        // level
        const levelMatch = raw.match(/s:5:"level";a:\d+:{(?:[^{}]|{[^{}]*})*}/);
        if (levelMatch) {
          const m = levelMatch[0].match(/i:0;s:\d+:"([^"]*)"/);
          if (m && m[1]) {
            let degree = m[1];
            if (degree === "Master") degree = "Master's Degree";
            else if (degree === "Bachelor") degree = "Bachelor's Degree";
            else if (degree === "PhD" || degree === "Ph.D.")
              degree = "Doctoral Degree";
            educationData.degree = degree;
          }
        }

        // university
        const uniMatch = raw.match(
          /s:10:"university";a:\d+:{(?:[^{}]|{[^{}]*})*}/
        );
        if (uniMatch) {
          const m = uniMatch[0].match(/i:0;s:\d+:"([^"]*)"/);
          if (m && m[1]) educationData.university = m[1];
        }

        // program (major)
        const progMatch = raw.match(
          /s:7:"program";a:\d+:{(?:[^{}]|{[^{}]*})*}/
        );
        if (progMatch) {
          const m = progMatch[0].match(/i:0;s:\d+:"([^"]*)"/);
          if (m && m[1]) educationData.major = m[1].trim();
        }

        // gpa
        const gpaMatch = raw.match(/s:3:"gpa";a:\d+:{(?:[^{}]|{[^{}]*})*}/);
        if (gpaMatch) {
          const m = gpaMatch[0].match(/i:0;s:\d+:"([^"]*)"/);
          if (m && m[1]) educationData.gpa = m[1];
        }
      } catch (e) {
        console.error("Error parsing education data:", e);
      }
    }

    // ----- Destination (goals) -----
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
        name: countryMap[countryId] || `Unknown (${countryId})`, // فرض بر این‌که countryMap در اسکوپ شما موجود است
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
          destinationData.field = {
            id: programId,
            name: programRows[0].name,
          };
        } else {
          destinationData.field = {
            id: programId,
            name: "Selected Program",
          };
        }
      } catch (e) {
        console.error("Error fetching program name:", e);
        destinationData.field = {
          id: programId,
          name: "Selected Program",
        };
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

    // ----- Tests (with nested .scores shape for each test) -----
    const testsData = { type: "", scores: {} };

    const buildScores = (fieldToMetaKey) => {
      const out = {};
      for (const [field, key] of Object.entries(fieldToMetaKey)) {
        const v = metaData[key];
        if (v != null && String(v).trim() !== "") out[field] = v;
      }
      return out;
    };

    // GRE
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

    // GMAT
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

    // LSAT
    const LSAT = buildScores({
      total: "application_lsat_total",
    });
    if (Object.keys(LSAT).length) {
      testsData.scores.lsat = { scores: LSAT };
      if (!testsData.type) testsData.type = "lsat";
    }

    // SAT
    const SAT = buildScores({
      total: "application_sat_total",
      reading_writing: "application_sat_reading_writing",
      math: "application_sat_math",
    });
    if (Object.keys(SAT).length) {
      testsData.scores.sat = { scores: SAT };
      if (!testsData.type) testsData.type = "sat";
    }

    // ACT
    const ACT = buildScores({
      total: "application_act_total",
    });
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
            } // فرض: countryCodeToName در اسکوپ شما موجود است
          : "",
        residence: residenceCode
          ? {
              code: residenceCode,
              name: countryCodeToName[residenceCode] || "",
            }
          : "",
      },
      education: educationData,
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

    // --- Small helpers ---
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
    // Citizenship & Residence (codes)
    // -----------------------------
    if (citizenship?.country?.code) {
      await upsertMeta("citizen", citizenship.country.code);
    }
    if (citizenship?.residence?.code) {
      await upsertMeta("country", citizenship.residence.code);
    }

    // -----------------------------
    // Education (WordPress PHP-serialized structure)
    // -----------------------------
    if (education) {
      const [existingEducationMeta] = await db.query(
        `SELECT meta_value FROM qacom_wp_usermeta WHERE user_id = ? AND meta_key = 'profile_education'`,
        [userId]
      );

      let updatedEducationData = null;

      // Normalize degree names for DB format
      const normalizeDegree = (deg) => {
        if (deg === "Master's Degree") return "Master";
        if (deg === "Bachelor's Degree") return "Bachelor";
        if (deg === "Doctoral Degree") return "Ph.D.";
        return deg || "";
      };
      let degree = normalizeDegree(education.degree);

      if (
        existingEducationMeta &&
        existingEducationMeta.length > 0 &&
        existingEducationMeta[0].meta_value
      ) {
        try {
          const rawEducationData = existingEducationMeta[0].meta_value.replace(
            /^s:\d+:"(.*)"$/,
            "$1"
          );

          let updatedRawData = rawEducationData.replace(
            /s:5:"level";a:\d+:{i:0;s:\d+:"[^"]*"/,
            `s:5:"level";a:2:{i:0;s:${degree.length}:"${degree}"`
          );

          updatedRawData = updatedRawData.replace(
            /s:10:"university";a:\d+:{i:0;s:\d+:"[^"]*"/,
            `s:10:"university";a:2:{i:0;s:${education.university.length}:"${education.university}"`
          );

          updatedRawData = updatedRawData.replace(
            /s:7:"program";a:\d+:{i:0;s:\d+:"[^"]*"/,
            `s:7:"program";a:2:{i:0;s:${education.major.length}:"${education.major}"`
          );

          updatedRawData = updatedRawData.replace(
            /s:3:"gpa";a:\d+:{i:0;s:\d+:"[^"]*"/,
            `s:3:"gpa";a:2:{i:0;s:${education.gpa.length}:"${education.gpa}"`
          );

          updatedEducationData = `s:${updatedRawData.length}:"${updatedRawData}";`;
        } catch (e) {
          console.error("Error updating existing education data:", e);
          updatedEducationData = existingEducationMeta[0].meta_value;
        }
      } else {
        const serializedData = `a:7:{s:7:"country";a:1:{i:0;s:2:"US";}s:10:"university";a:1:{i:0;s:${education.university.length}:"${education.university}";}s:5:"level";a:1:{i:0;s:${degree.length}:"${degree}";}s:7:"program";a:1:{i:0;s:${education.major.length}:"${education.major}";}s:3:"gpa";a:1:{i:0;s:${education.gpa.length}:"${education.gpa}";}s:10:"start_date";a:1:{i:0;s:7:"2020-01";}s:8:"end_date";a:1:{i:0;s:7:"2024-01";}}`;
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
    // Language proficiency
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
          // Clear score if user selected "I don't have this" / "Not yet..."
          await upsertMeta("application_english_score", "");
        }
      }
    }

    // -----------------------------
    // Standardized tests (GRE/GMAT/LSAT + SAT/ACT for undergrad)
    // -----------------------------
    if (tests && typeof tests === "object") {
      // meta_key map
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
        lsat: {
          total: "application_lsat_total",
        },
        sat: {
          total: "application_sat_total",
          reading_writing: "application_sat_reading_writing",
          math: "application_sat_math",
        },
        act: {
          total: "application_act_total",
        },
      };

      // ریشه‌ی واقعی نمره‌ها (هر دو شکل را پوشش می‌دهد)
      const scoresRoot = tests.scores ?? tests;

      // فقط تست‌هایی را پردازش کن که در payload آمده‌اند و در MAP تعریف داریم
      const payloadTestIds = Object.keys(scoresRoot).filter(
        (id) => TEST_META_MAP[id]
      );

      // اگر هیچ تستی در payload نبود، کاری نکن (مرحله اختیاری است)
      if (payloadTestIds.length === 0) {
        // console.log("No standardized tests in payload.");
      } else {
        for (const testId of payloadTestIds) {
          const fieldMap = TEST_META_MAP[testId];

          // منبع فیلدها (یا زیرکلید scores یا خود آبجکت)
          const src =
            scoresRoot?.[testId]?.scores ?? scoresRoot?.[testId] ?? {};

          for (const fieldId of Object.keys(fieldMap)) {
            const metaKey = fieldMap[fieldId];
            const raw = src[fieldId];

            // normalize: null/undefined/"" حذف شود، سایر مقادیر به رشته
            const val =
              raw === undefined || raw === null || String(raw).trim() === ""
                ? ""
                : String(raw);

            await upsertMeta(metaKey, val);
            // برای دیباگ می‌تونی موقتاً بازش کنی:
            console.log(`[tests] ${metaKey} <-`, val);
          }
        }
      }
    }

    // -----------------------------
    // Compute profile completeness (unchanged logic)
    // -----------------------------
    const [userMetas] = await db.query(
      `SELECT meta_key, meta_value
       FROM qacom_wp_usermeta
       WHERE user_id = ?
         AND meta_key IN ('profile_education','application_country','application_level','application_english_test')`,
      [userId]
    );

    const metaData = {};
    userMetas.forEach((m) => (metaData[m.meta_key] = m.meta_value));

    const requiredMetaKeys = [
      "profile_education",
      "application_country",
      "application_level",
      "application_english_test",
    ];
    const isProfileComplete = requiredMetaKeys.every(
      (k) => metaData[k] && metaData[k] !== ""
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

// Api endpoint for UserPreferences
// router.get("/preferences", authenticateToken, async (req, res) => {
//   try {
//     const { email } = req.user; // فرض می‌کنیم اطلاعات کاربر از authenticateToken می‌آید

//     // Get the user's ID
//     const [userData] = await db.query(
//       `
//         SELECT ID
//         FROM qacom_wp_users
//         WHERE user_email = ?
//         `,
//       [email]
//     );

//     if (!userData || userData.length === 0) {
//       return res.status(404).json({ error: "User not found" });
//     }
//     const userId = userData[0].ID;

//     // Fetch user metas
//     const preferredMetaKeys = [
//       "application_country",
//       "application_level",
//       "application_program",
//       "application_english_test",
//       "application_english_score",
//       "application_gpa",
//       "gre_test",
//       "application_gre_total",
//       "application_gre_verbal",
//       "application_gre_quantitative",
//       "application_gre_writing",
//       "lsat_test",
//       "application_sat_total",
//       "application_act_total",
//     ];

//     const [userMetas] = await db.query(
//       `
//             SELECT meta_key, meta_value
//             FROM qacom_wp_usermeta
//             WHERE user_id = ? AND meta_key IN (?)
//         `,
//       [userId, preferredMetaKeys]
//     );

//     // Convert metas to object
//     let userPreferences = userMetas.reduce(
//       (acc, meta) => {
//         switch (meta.meta_key) {
//           case "application_country":
//             acc.country = meta.meta_value;
//             break;
//           case "application_level":
//             acc.level = meta.meta_value;
//             break;
//           case "application_program":
//             acc.program = meta.meta_value;
//             break;
//           case "application_english_test":
//             acc.englishTest = meta.meta_value;
//             break;
//           case "application_english_score":
//             acc.englishScore = meta.meta_value;
//             break;
//           case "application_gpa":
//             acc.gpa = meta.meta_value;
//             break;
//           case "gre_test":
//             acc.greTest = meta.meta_value;
//             break;
//           case "application_gre_total":
//             acc.greTotal = meta.meta_value;
//             break;
//           case "application_gre_verbal":
//             acc.greVerbal = meta.meta_value;
//             break;
//           case "application_gre_quantitative":
//             acc.greQuantitative = meta.meta_value;
//             break;
//           case "application_gre_writing":
//             acc.greWriting = meta.meta_value;
//             break;
//           case "lsat_test":
//             acc.lsatTest = meta.meta_value;
//             break;
//           case "application_sat_total":
//             acc.satTotal = meta.meta_value;
//             break;
//           case "application_act_total":
//             acc.actTotal = meta.meta_value;
//             break;
//           default:
//             break;
//         }
//         return acc;
//       },
//       {
//         country: null,
//         level: null,
//         program: null,
//         areaOfStudy: null,
//         englishTest: null,
//         englishScore: null,
//         gpa: null,
//         greTest: null,
//         greTotal: null,
//         greVerbal: null,
//         greQuantitative: null,
//         greWriting: null,
//         lsatTest: null,
//         satTotal: null,
//         actTotal: null,
//       }
//     );

//     // Get program category (area of study) for the selected program
//     if (userPreferences.program) {
//       const [programData] = await db.query(
//         `
//             SELECT p.id, p.name, p.category_id, t.name as category_name
//             FROM qacom_wp_apply_programs p
//             LEFT JOIN qacom_wp_terms t ON p.category_id = t.term_id
//             WHERE p.id = ?
//             LIMIT 1
//         `,
//         [userPreferences.program]
//       );

//       if (programData && programData.length > 0 && programData[0].category_id) {
//         userPreferences.areaOfStudy = {
//           id: programData[0].category_id,
//           name: decodeHtmlEntities(programData[0].category_name),
//         };
//         userPreferences.programDetails = {
//           id: programData[0].id,
//           name: decodeHtmlEntities(programData[0].name),
//         };
//       } else {
//         const [basicProgramData] = await db.query(
//           `
//             SELECT id, name
//             FROM qacom_wp_apply_programs
//             WHERE id = ?
//             LIMIT 1
//             `,
//           [userPreferences.program]
//         );
//         if (basicProgramData && basicProgramData.length > 0) {
//           userPreferences.programDetails = {
//             id: basicProgramData[0].id,
//             name: decodeHtmlEntities(basicProgramData[0].name),
//           };
//           const [categoryData] = await db.query(
//             `
//                 SELECT tt.term_id, t.name
//                 FROM qacom_wp_term_relationships tr
//                 JOIN qacom_wp_term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
//                 JOIN qacom_wp_terms t ON tt.term_id = t.term_id
//                 WHERE tr.object_id = ? AND tt.taxonomy = 'program_category'
//                 LIMIT 1
//             `,
//             [userPreferences.program]
//           );
//           if (categoryData && categoryData.length > 0) {
//             userPreferences.areaOfStudy = {
//               id: categoryData[0].term_id,
//               name: decodeHtmlEntities(categoryData[0].name),
//             };
//           }
//         }
//       }
//     }

//     // Get country data if country ID is available
//     if (userPreferences.country) {
//       const countryId = userPreferences.country;
//       const [statesData] = await db.query(
//         `
//                 SELECT t.term_id, t.name
//                 FROM qacom_wp_term_taxonomy tt
//                 JOIN qacom_wp_terms t ON t.term_id = tt.term_id
//                 WHERE tt.taxonomy = 'place' AND tt.parent = ?
//                 ORDER BY t.name ASC
//             `,
//         [countryId]
//       );

//       userPreferences.countryDetails = {
//         id: countryId,
//         name: countryMap[countryId] || `Unknown (${countryId})`,
//         states: statesData.map((state) => ({
//           id: state.term_id,
//           name: state.name,
//         })),
//       };
//     }

//     // Get all available countries from place taxonomy
//     const [countriesData] = await db.query(`
//         SELECT t.term_id, t.name
//         FROM qacom_wp_term_taxonomy tt
//         JOIN qacom_wp_terms t ON t.term_id = tt.term_id
//         WHERE tt.taxonomy = 'place' AND tt.parent = 0
//         `);
//     if (countriesData && countriesData.length > 0) {
//       userPreferences.availableCountries = countriesData.map((country) => ({
//         country: country.term_id,
//         name: country.name,
//       }));
//     }

//     // Get all program categories (areas of study)
//     const [categoriesData] = await db.query(`
//         SELECT t.term_id, t.name
//         FROM qacom_wp_term_taxonomy pr
//         JOIN qacom_wp_terms t ON t.term_id = pr.term_id
//         WHERE pr.taxonomy = 'program_category'
//         ORDER BY t.name ASC
//         `);
//     if (categoriesData && categoriesData.length > 0) {
//       userPreferences.availableAreasOfStudy = categoriesData.map(
//         (category) => ({
//           id: category.term_id,
//           name: decodeHtmlEntities(category.name),
//         })
//       );
//     }

//     // Get all available programs related to the selected area of study
//     if (userPreferences.areaOfStudy || userPreferences.program) {
//       let availableProgramsQuery = `
//                 SELECT p.id, p.name
//                 FROM qacom_wp_apply_programs p
//             `;
//       let availableProgramsWhere = [];
//       let availableProgramsParams = [];

//       if (userPreferences.areaOfStudy) {
//         availableProgramsWhere.push("p.category_id = ?");
//         availableProgramsParams.push(userPreferences.areaOfStudy.id);
//       } else if (userPreferences.program) {
//         availableProgramsWhere.push("p.id = ?");
//         availableProgramsParams.push(userPreferences.program);
//       }

//       if (availableProgramsWhere.length > 0) {
//         availableProgramsQuery += ` WHERE ${availableProgramsWhere.join(
//           " AND "
//         )}`;
//       }

//       availableProgramsQuery += " ORDER BY p.name ASC";

//       const [programsData] = await db.query(
//         availableProgramsQuery,
//         availableProgramsParams
//       );
//       if (programsData && programsData.length > 0) {
//         userPreferences.availablePrograms = programsData.map((program) => ({
//           id: program.id,
//           name: decodeHtmlEntities(program.name),
//         }));
//       }
//     }

//     // در اینجا فقط ترجیحات کاربر را برمی‌گردانیم، نه اساتید را
//     res.json({ userPreferences });
//   } catch (error) {
//     console.error("Error in /user/preferences:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

export default router;

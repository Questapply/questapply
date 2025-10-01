import express from "express";
import db from "../config/db.config.js";
import { decodeHtmlEntities } from "../utils/helpers.js";
import { countryMap } from "../config/constants.js";

import { serialize, unserialize } from "php-serialize";
import {
  formatDeadlineDate,
  normalizeDegreeLevel,
  convertToToefl,
  convertGrePercentile,
  calculateAdmissionFit,
  mapAdmissionChanceToFit,
  calculateAdmissionChance,
  buildAdmissionChancePackage,
} from "../utils/helpers.js";
import { buildUploadsUrl } from "../config/constants.js";

const router = express.Router();

// Helper: CSV parser
const parseCsv = (v) =>
  typeof v === "string"
    ? v
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : Array.isArray(v)
    ? v.map(String)
    : [];

const seasonColMap = {
  fall: "deadline_fall",
  winter: "deadline_winter",
  spring: "deadline_spring",
  summer: "deadline_summer",
};

// نام ماه → شماره ماه (1..12)
const monthNameToNum = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
};

const parseMonthsFlexible = (input) => {
  if (!input) return [];
  const flat = Array.isArray(input) ? input.join(",") : String(input);
  return flat
    .split(",")
    .map((s) => s.trim())
    .map((s) => (/^\d+$/.test(s) ? Number(s) : monthNameToNum[s.toLowerCase()]))
    .filter((n) => Number.isInteger(n) && n >= 1 && n <= 12);
};

//API endpoint details program
router.get("/details/:id", async (req, res) => {
  try {
    const relId = req.params.id; // Use relId to be clear it's the relationship ID
    const { email } = req.user; // Get user email from authenticated request

    // Phase 1: Concurrently fetch main program data (with all metas), user data, similar programs, and faculty highlights
    const [
      programMainDataQueryResult,
      userDataQueryResult,
      similarProgramRowsResult,
      facultyRowsResult,
    ] = await Promise.all([
      // Query 1.1: Get full program relationship details, including all meta fields via direct JOINs
      db.query(
        `
        SELECT
          A_PR.id as rel_id,
          A_PR.program_id,
          A_PR.school_id,
          A_PR.level,
          A_PR.status,
          A_PR.school_name,
          A_PR.country,
          A_PR.state,
          A_PR.school_logo,
          A_PR.program_name,
          A_PR.program_category,
          A_PR.title_link, -- Mapped to contact.website
          meta_qs_rank.meta_value AS qsRanking, -- Mapped to qsRanking and ranking
          meta_tuition.meta_value AS Cost_tuition, -- Mapped to costs.tuition
          meta_fee_us.meta_value AS extra_appication_fee_us, -- Mapped to applicationFees.us
          meta_fee.meta_value AS extra_appication_fee, -- Mapped to applicationFees.international
          meta_lsat.meta_value AS LSAT_requirement, -- Included in requirements
          meta_gre.meta_value AS GRE_subject_requirement, -- Included in requirements
          meta_gmat.meta_value AS GMAT_requirement, -- Included in requirements
          meta_email_admission.meta_value AS Email_admission, -- Mapped to contact.email
          meta_tel.meta_value AS TEL, -- Mapped to contact.tel
          meta_living_cost.meta_value AS Cost_living_cost, -- Mapped to costs.livingCost
          meta_health_insurance.meta_value AS Cost_health_insurance, -- Added for costs.healthInsurance
          meta_fee_cost.meta_value AS Cost_fee, -- Added for costs.fees
          meta_extra_recom.meta_value AS extra_recom, -- Used for otherRequirements logic
          meta_extra_SOP.meta_value AS extra_SOP, -- Used for otherRequirements logic
          meta_extra_recom_value.meta_value AS extra_recom_value, -- Used for otherRequirements logic
          meta_admission_rate.meta_value AS admission_rate, -- Mapped to admissionRate
          meta_description.meta_value AS program_description, -- Added for description
          meta_course_structure.meta_value AS program_course_structure, -- Added for courseStructure
          meta_overview.meta_value AS program_overview, -- Added for overview

          A_PR.MIN_IELTS, -- Included in requirements
          A_PR.MIN_TOEFL, -- Included in requirements
          A_PR.MIN_Duolingo, -- Included in requirements
          A_PR.MIN_MELAB, -- Included in requirements
          A_PR.MIN_PTE, -- Included in requirements
          A_PR.MIN_Cael, -- Included in requirements
          A_PR.MIN_GPA, -- Included in requirements
          A_PR.GRE_requirement, -- Included in requirements
          A_PR.deadline_fall, -- Used for deadline calculation
          A_PR.deadline_spring, -- Used for deadline calculation
          A_PR.deadline_winter, -- Used for deadline calculation
          A_PR.deadline_summer, -- Used for deadline calculation

          -- Include AVG fields for requirements.avg
          meta_avg_toefl.meta_value AS AVG_TOEFL,
          meta_avg_ielts.meta_value AS AVG_IELTS,
          meta_avg_duolingo.meta_value AS AVG_Duolingo,
          meta_avg_melab.meta_value AS AVG_MELAB,
          meta_avg_pte.meta_value AS AVG_PTE,
          meta_avg_gpa.meta_value AS AVG_GPA,
          meta_avg_gre_total.meta_value AS AVG_GRE_total,
          meta_avg_gre_verbal.meta_value AS AVG_GRE_verbal,
          meta_avg_gre_quantitative.meta_value AS AVG_GRE_quantitative,
          meta_avg_gre_writing.meta_value AS AVG_GRE_writing


        FROM
        (
            SELECT
                pr.id,
                pr.program_id,
                pr.school_id,
                pr.level,
                pr.status,
                s.name AS school_name,
                s.country AS country,
                s.state,
                CASE
                  WHEN s.image REGEXP '^[0-9]+$' THEN
                    (SELECT CONCAT('/uploads/', pm.meta_value)
                     FROM qacom_wp_postmeta pm
                     WHERE pm.post_id = CAST(s.image AS UNSIGNED)
                     AND pm.meta_key = '_wp_attached_file')
                  ELSE s.image
                END AS school_logo,
                p.name AS program_name,
                p.category_id AS program_category,
                pr.MIN_IELTS,
                pr.MIN_TOEFL,
                pr.MIN_Duolingo,
                pr.MIN_MELAB,
                pr.MIN_PTE,
                pr.MIN_GPA,
                pr.MIN_Cael,
                pr.GRE_requirement,
                pr.deadline_fall,
                pr.deadline_spring,
                pr.deadline_winter,
                pr.deadline_summer,
                pr.title_link
            FROM qacom_wp_apply_programs_relationship pr
            JOIN qacom_wp_apply_schools s ON pr.school_id = s.id
            JOIN qacom_wp_apply_programs p ON pr.program_id = p.id
            WHERE pr.status = 'publish' AND pr.id = ?
            ORDER BY pr.id ASC -- Added ORDER BY for consistency and potential optimization
        ) A_PR
        LEFT JOIN qacom_wp_apply_schools_meta meta_qs_rank
          ON meta_qs_rank.school_id = A_PR.school_id AND meta_qs_rank.meta_key = 'qs_rank'
        LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_tuition
          ON meta_tuition.program_rel_id = A_PR.id AND meta_tuition.meta_key = 'Cost_tuition'
        LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_fee_us
          ON meta_fee_us.program_rel_id = A_PR.id AND meta_fee_us.meta_key = 'extra_appication_fee_us'
        LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_fee
          ON meta_fee.program_rel_id = A_PR.id AND meta_fee.meta_key = 'extra_appication_fee'
        LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_lsat
          ON meta_lsat.program_rel_id = A_PR.id AND meta_lsat.meta_key = 'LSAT_requirement'
        LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_gre
          ON meta_gre.program_rel_id = A_PR.id AND meta_gre.meta_key = 'GRE_subject_requirement'
        LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_gmat
          ON meta_gmat.program_rel_id = A_PR.id AND meta_gmat.meta_key = 'GMAT_requirement'
        LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_email_admission
          ON meta_email_admission.program_rel_id = A_PR.id AND meta_email_admission.meta_key = 'Email_admission'
        LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_tel
          ON meta_tel.program_rel_id = A_PR.id AND meta_tel.meta_key = 'TEL'
        LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_living_cost
          ON meta_living_cost.program_rel_id = A_PR.id AND meta_living_cost.meta_key = 'Cost_living_cost'
        LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_health_insurance
          ON meta_health_insurance.program_rel_id = A_PR.id AND meta_health_insurance.meta_key = 'Cost_health_insurance'
        LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_fee_cost
          ON meta_fee_cost.program_rel_id = A_PR.id AND meta_fee_cost.meta_key = 'Cost_fee'
        LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_extra_recom
          ON meta_extra_recom.program_rel_id = A_PR.id AND meta_extra_recom.meta_key = 'extra_recom'
        LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_extra_SOP
          ON meta_extra_SOP.program_rel_id = A_PR.id AND meta_extra_SOP.meta_key = 'extra_SOP'
        LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_extra_recom_value
          ON meta_extra_recom_value.program_rel_id = A_PR.id AND meta_extra_recom_value.meta_key = 'extra_recom_value'
        LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_admission_rate
          ON meta_admission_rate.program_rel_id = A_PR.id AND meta_admission_rate.meta_key = 'admission_rate'
        LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_description
          ON meta_description.program_rel_id = A_PR.id AND meta_description.meta_key = 'program_description'
        LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_course_structure
          ON meta_course_structure.program_rel_id = A_PR.id AND meta_course_structure.meta_key = 'course_structure'
        LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_overview
          ON meta_overview.program_rel_id = A_PR.id AND meta_overview.meta_key = 'program_overview'

        LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_avg_toefl
          ON meta_avg_toefl.program_rel_id = A_PR.id AND meta_avg_toefl.meta_key = 'AVG_TOEFL'
        LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_avg_ielts
          ON meta_avg_ielts.program_rel_id = A_PR.id AND meta_avg_ielts.meta_key = 'AVG_IELTS'
        LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_avg_duolingo
          ON meta_avg_duolingo.program_rel_id = A_PR.id AND meta_avg_duolingo.meta_key = 'AVG_Duolingo'
        LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_avg_melab
          ON meta_avg_melab.program_rel_id = A_PR.id AND meta_avg_melab.meta_key = 'AVG_MELAB'
        LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_avg_pte
          ON meta_avg_pte.program_rel_id = A_PR.id AND meta_avg_pte.meta_key = 'AVG_PTE'
        LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_avg_gpa
          ON meta_avg_gpa.program_rel_id = A_PR.id AND meta_avg_gpa.meta_key = 'AVG_GPA'
        LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_avg_gre_total
          ON meta_avg_gre_total.program_rel_id = A_PR.id AND meta_avg_gre_total.meta_key = 'AVG_GRE_total'
        LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_avg_gre_verbal
          ON meta_avg_gre_verbal.program_rel_id = A_PR.id AND meta_avg_gre_verbal.meta_key = 'AVG_GRE_verbal'
        LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_avg_gre_quantitative
          ON meta_avg_gre_quantitative.program_rel_id = A_PR.id AND meta_avg_gre_quantitative.meta_key = 'AVG_GRE_quantitative'
        LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_avg_gre_writing
          ON meta_avg_gre_writing.program_rel_id = A_PR.id AND meta_avg_gre_writing.meta_key = 'AVG_GRE_writing'
      `,
        [relId]
      ),

      // Query 1.2: Get user data and metas for admission fit calculation
      db.query(
        `
          SELECT u.ID, um.meta_key, um.meta_value
          FROM qacom_wp_users u
          LEFT JOIN qacom_wp_usermeta um ON u.ID = um.user_id
          WHERE u.user_email = ?
        `,
        [email]
      ),

      // Query 1.3: Fetch Similar Programs
      db.query(
        `
              SELECT
                  pr.id,
                  pr.program_id,
                  pr.school_id,
                  pr.level,
                  s.name AS school_name,
                   CASE
                    WHEN s.image REGEXP '^[0-9]+$' THEN
                      (SELECT CONCAT('/uploads/', pm.meta_value)
                       FROM qacom_wp_postmeta pm
                       WHERE pm.post_id = CAST(s.image AS UNSIGNED)
                       AND pm.meta_key = '_wp_attached_file')
                    ELSE s.image
                  END AS school_logo,
                  p.name AS program_name
              FROM qacom_wp_apply_programs_relationship pr
              JOIN qacom_wp_apply_schools s ON pr.school_id = s.id
              JOIN qacom_wp_apply_programs p ON pr.program_id = p.id
              WHERE pr.school_id = (SELECT school_id FROM qacom_wp_apply_programs_relationship WHERE id = ? LIMIT 1)
                AND pr.program_id = (SELECT program_id FROM qacom_wp_apply_programs_relationship WHERE id = ? LIMIT 1)
                AND pr.id != ?
                AND pr.status = 'publish'
              ORDER BY pr.id ASC -- Added ORDER BY for consistency and potential optimization
              LIMIT 5
            `,
        [relId, relId, relId]
      ),

      // Query 1.4: Fetch Faculty Highlights
      db.query(
        `
              SELECT
                f.name,
                f.title,
                f.research_area,
                CASE
                  WHEN f.image REGEXP '^[0-9]+$' THEN
                   (SELECT CONCAT('/uploads/', pm.meta_value)
                   FROM qacom_wp_postmeta pm
                   WHERE pm.post_id = CAST(f.image AS UNSIGNED)
                    AND pm.meta_key = '_wp_attached_file'
                  LIMIT 1)
                WHEN f.image LIKE '/uploads/%' THEN f.image
                WHEN f.image LIKE 'http%'     THEN f.image
                ELSE NULL
              END AS image_url
           FROM qacom_wp_apply_faculty f
           WHERE f.school_id = (SELECT school_id FROM qacom_wp_apply_programs_relationship WHERE id = ? LIMIT 1)
            AND f.program_id = (SELECT program_id FROM qacom_wp_apply_programs_relationship WHERE id = ? LIMIT 1)
          ORDER BY f.name ASC
          LIMIT 3;
           `,
        [relId, relId]
      ),
    ]);

    // Extract rows from the query results (each result is [rows, fields])
    const programMainDataRows = programMainDataQueryResult[0];
    const userDataRows = userDataQueryResult[0];
    const similarProgramData = similarProgramRowsResult[0];
    const facultyData = facultyRowsResult[0];

    if (!programMainDataRows || programMainDataRows.length === 0) {
      return res.status(404).json({ error: "Program not found" });
    }

    const row = programMainDataRows[0];

    // Process user preferences
    let userPreferences = {
      country: null,
      level: null,
      program: null,
      areaOfStudy: null,
      englishTest: null,
      englishScore: null,
      gpa: null,
      greTest: null,
      greTotal: null,
      greVerbal: null,
      greQuantitative: null,
      greWriting: null,
      lsatTest: null,
      satTotal: null,
      actTotal: null,
    };
    if (userDataRows && userDataRows.length > 0) {
      userDataRows.forEach((meta) => {
        if (meta.meta_key === "application_country")
          userPreferences.country = meta.meta_value;
        else if (meta.meta_key === "application_level")
          userPreferences.level = meta.meta_value;
        else if (meta.meta_key === "application_program")
          userPreferences.program = meta.meta_value;
        else if (meta.meta_key === "application_english_test")
          userPreferences.englishTest = meta.meta_value;
        else if (meta.meta_key === "application_english_score")
          userPreferences.englishScore = meta.meta_value;
        else if (meta.meta_key === "application_gpa")
          userPreferences.gpa = meta.meta_value;
        else if (meta.meta_key === "gre_test")
          userPreferences.greTest = meta.meta_value;
        else if (meta.meta_key === "application_gre_total")
          userPreferences.greTotal = meta.meta_value;
        else if (meta.meta_key === "application_gre_verbal")
          userPreferences.greVerbal = meta.meta_value;
        else if (meta.meta_key === "application_gre_quantitative")
          userPreferences.greQuantitative = meta.meta_value;
        else if (meta.meta_key === "application_gre_writing")
          userPreferences.greWriting = meta.meta_value;
        else if (meta.meta_key === "lsat_test")
          userPreferences.lsatTest = meta.meta_value;
        else if (meta.meta_key === "application_sat_total")
          userPreferences.satTotal = meta.meta_value;
        else if (meta.meta_key === "application_act_total")
          userPreferences.actTotal = meta.meta_value;
      });
    }

    // Map similar programs to the simplified structure required by ProgramDetail interface
    const similarPrograms = similarProgramData.map((simRow) => ({
      id: simRow.id,
      name: decodeHtmlEntities(simRow.program_name),
      school: decodeHtmlEntities(simRow.school_name),
    }));

    // Map faculty highlights
    const facultyHighlights = facultyData.map((facRow) => {
      let researchString = "";
      const researchAreaString = facRow.research_area;
      if (researchAreaString && typeof researchAreaString === "string") {
        const match = researchAreaString.match(/^s:\d+:"(.*)";$/);
        if (match && match[1]) {
          researchString = match[1]
            .split("\n")
            .map((area) => area.trim())
            .filter((area) => area)
            .join(", ");
        }
      }

      const facultyPhotoUrl = buildUploadsUrl(facRow.image_url || "");

      return {
        name: facRow.name || "N/A",
        title: facRow.title || "N/A",
        photoUrl: facultyPhotoUrl,
        research: researchString,
      };
    });

    // Process program data and structure according to ProgramDetail interface
    const fullSchoolLogoUrl = buildUploadsUrl(row.school_logo || "");

    let program_duration = "";
    if (row.level == "Ph.D.") {
      program_duration = "4 Years";
    } else if (row.level == "Master") {
      program_duration = "2 Years";
    } else if (row.level == "Bachelor") {
      program_duration = "4 Years";
    }

    let validDeadlinesArray = [];
    const fallDeadline = formatDeadlineDate(row.deadline_fall);
    if (fallDeadline) {
      validDeadlinesArray.push({ season: "Fall", date: fallDeadline });
    }
    const winterDeadline = formatDeadlineDate(row.deadline_winter);
    if (winterDeadline) {
      validDeadlinesArray.push({ season: "Winter", date: winterDeadline });
    }
    const springDeadline = formatDeadlineDate(row.deadline_spring);
    if (springDeadline) {
      validDeadlinesArray.push({ season: "Spring", date: springDeadline });
    }
    const summerDeadline = formatDeadlineDate(row.deadline_summer);
    if (summerDeadline) {
      validDeadlinesArray.push({ season: "Summer", date: summerDeadline });
    }
    const displayDeadlinesForFrontEnd =
      validDeadlinesArray.length > 0 ? validDeadlinesArray : [];

    const reqForChance = {
      gpa: {
        min: row.MIN_GPA ? Number(row.MIN_GPA) : undefined,
        avg: row.AVG_GPA ? Number(row.AVG_GPA) : undefined,
      },
      gre: {
        status: row.GRE_requirement || "optional",
        min: row.MIN_GRE_total ? Number(row.MIN_GRE_total) : undefined,
        avg: row.AVG_GRE_total ? Number(row.AVG_GRE_total) : undefined,
        total: {
          avg: row.AVG_GRE_total ? Number(row.AVG_GRE_total) : undefined,
        },
      },
      toefl: {
        min: row.MIN_TOEFL ? Number(row.MIN_TOEFL) : undefined,
        avg: row.AVG_TOEFL ? Number(row.AVG_TOEFL) : undefined,
      },
      ielts: {
        min: row.MIN_IELTS ? Number(row.MIN_IELTS) : undefined,
        avg: row.AVG_IELTS ? Number(row.AVG_IELTS) : undefined,
      },
      duolingo: {
        min: row.MIN_Duolingo ? Number(row.MIN_Duolingo) : undefined,
        avg: row.AVG_Duolingo ? Number(row.AVG_Duolingo) : undefined,
      },
      melab: {
        min: row.MIN_MELAB ? Number(row.MIN_MELAB) : undefined,
        avg: row.AVG_MELAB ? Number(row.AVG_MELAB) : undefined,
      },
      pte: {
        min: row.MIN_PTE ? Number(row.MIN_PTE) : undefined,
        avg: row.AVG_PTE ? Number(row.AVG_PTE) : undefined,
      },
      cael: {
        min: row.MIN_Cael ? Number(row.MIN_Cael) : undefined,
        avg: row.AVG_Cael ? Number(row.AVG_Cael) : undefined,
      },
    };

    // 2) ورودی‌های کاربر برای تابع محاسبه (از userPreferences همین هندلر)
    const userForChance = {
      application_gpa: userPreferences.gpa,
      application_english_test: userPreferences.englishTest,
      application_english_score: userPreferences.englishScore,
      application_gre_total: userPreferences.greTotal,
    };

    // 3) محاسبه‌ی امتیاز 0..100 یا -1/-2
    let score = calculateAdmissionChance(userForChance, {
      requirements: reqForChance,
    });

    // 4) فالبک: اگر score نامعتبر بود، از admission_rate دیتابیس استفاده کن
    if (!(Number.isFinite(score) && score >= 0)) {
      const fallback = row.admission_rate ? Number(row.admission_rate) : NaN;
      if (Number.isFinite(fallback)) {
        score = Math.round(fallback);
      }
    }

    // 5) لیبل نهایی
    const fitLabel = mapAdmissionChanceToFit(score);

    const programDetails = {
      id: row.rel_id,
      name: decodeHtmlEntities(row.program_name),
      degree: row.level || "",
      school: decodeHtmlEntities(row.school_name),
      schoolLogo: fullSchoolLogoUrl,
      degreeType: "Program",
      duration: program_duration,
      format: "Full Time",
      language: "English",
      campus: "On Campus",
      fit: fitLabel,
      admissionChance: { score },
      ranking: row.qsRanking ? parseFloat(row.qsRanking) || 0 : 0,
      qsRanking: row.qsRanking || "",
      deadline:
        displayDeadlinesForFrontEnd
          .map((d) => `${d.season}: ${d.date}`)
          .join(", ") || "N/A",
      requirements: {
        toefl: {
          min: row.MIN_TOEFL ? Number(row.MIN_TOEFL) : 0,
          avg: row.AVG_TOEFL ? Number(row.AVG_TOEFL) : 0,
        },
        ielts: {
          min: row.MIN_IELTS ? Number(row.MIN_IELTS) : 0,
          avg: row.AVG_IELTS ? Number(row.AVG_IELTS) : 0,
        },
        duolingo: {
          min: row.MIN_Duolingo ? Number(row.MIN_Duolingo) : 0,
          avg: row.AVG_Duolingo ? Number(row.AVG_Duolingo) : 0,
        },
        pte: {
          min: row.MIN_PTE ? Number(row.MIN_PTE) : 0,
          avg: row.AVG_PTE ? Number(row.AVG_PTE) : 0,
        },
        gre: {
          status: row.GRE_requirement || "N/A",
          total: {
            avg: row.AVG_GRE_total ? Number(row.AVG_GRE_total) : 0,
          },
          verbal: {
            avg: row.AVG_GRE_verbal ? Number(row.AVG_GRE_verbal) : 0,
          },
          quantitative: {
            avg: row.AVG_GRE_quantitative
              ? Number(row.AVG_GRE_quantitative)
              : 0,
          },
          writing: {
            avg: row.AVG_GRE_writing ? Number(row.AVG_GRE_writing) : 0,
          },
        },
        gpa: {
          min: row.MIN_GPA ? parseFloat(row.MIN_GPA) || 0 : 0,
          avg: row.AVG_GPA ? parseFloat(row.AVG_GPA) || 0 : 0,
        },
      },
      costs: {
        residents: {
          tuition: row.Cost_tuition ? parseFloat(row.Cost_tuition) || 0 : 0,
          fees: row.Cost_fee ? parseFloat(row.Cost_fee) || 0 : 0,
          healthInsurance: row.Cost_health_insurance
            ? parseFloat(row.Cost_health_insurance) || 0
            : 0,
          livingCost: row.Cost_living_cost
            ? parseFloat(row.Cost_living_cost) || 0
            : 0,
        },
        international: {
          tuition: row.Cost_tuition ? parseFloat(row.Cost_tuition) || 0 : 0,
          fees: row.Cost_fee ? parseFloat(row.Cost_fee) || 0 : 0,
          healthInsurance: row.Cost_health_insurance
            ? parseFloat(row.Cost_health_insurance) || 0
            : 0,
          livingCost: row.Cost_living_cost
            ? parseFloat(row.Cost_living_cost) || 0
            : 0,
        },
      },
      applicationFees: {
        international: row.extra_appication_fee
          ? parseFloat(row.extra_appication_fee) || 0
          : 0,
        us: row.extra_appication_fee_us
          ? parseFloat(row.extra_appication_fee_us) || 0
          : 0,
      },
      otherRequirements: {
        transcript: row.extra_recom ? true : false,
        resumeCV: row.extra_recom ? true : false,
        applicationForm: row.extra_recom ? true : false,
        statementOfPurpose: row.extra_SOP ? true : false,
        recommendationLetters: row.extra_recom_value
          ? parseInt(row.extra_recom_value) || 0
          : 0,
      },
      admissionRate: row.admission_rate
        ? parseFloat(row.admission_rate) || 0
        : 0,
      contact: {
        tel: row.TEL || "",
        email: row.Email_admission || "",
        website: row.title_link || "",
        address: decodeHtmlEntities(row.school_name),
      },
      similarPrograms: similarPrograms,
      description:
        row.program_description ||
        "The Ph.D. program in Computer Science at Harvard University offers students the opportunity to work at the frontiers of knowledge in areas such as artificial intelligence, systems, theory, programming languages and systems, and more. With access to distinguished faculty, state-of-the-art facilities, and interdisciplinary collaboration opportunities, students are prepared to make significant contributions to the field of computer science through research, teaching, and professional practice.",
      courseStructure:
        row.program_course_structure ||
        "The program structure includes foundational coursework, qualifying examinations, research projects, and dissertation work. Students are expected to complete coursework in their first two years, followed by a qualifying exam. The remaining time is dedicated to original research leading to a dissertation that represents a significant contribution to the field of computer science.",
      facultyHighlights: facultyHighlights,
      careerOutcomes: [
        {
          title: "Average Salary",
          percentage: row.careerOutcomes_salary
            ? parseFloat(row.careerOutcomes_salary) || 0
            : 75000,
        },
        {
          title: "Job Placement Rate",
          percentage: row.careerOutcomes_jobPlacementRate
            ? parseFloat(row.careerOutcomes_jobPlacementRate) || 0
            : 85,
        },
      ],
      overview:
        row.program_overview ||
        "The Ph.D. program in Computer Science at Harvard University offers students the opportunity to work at the frontiers of knowledge in areas such as artificial intelligence, systems, theory, programming languages and systems, and more. With access to distinguished faculty, state-of-the-art facilities, and interdisciplinary collaboration opportunities, students are prepared to make significant contributions to the field of computer science through research, teaching, and professional practice.",
      favorite: false,
      country: row.country || "",
      state: row.state || "",
    };

    res.json(programDetails);
  } catch (error) {
    console.error("Error fetching program details:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

// API endpoint for programs by area of study 2
router.get("/by-area", async (req, res) => {
  try {
    const { areaOfStudy } = req.query;

    if (!areaOfStudy) {
      return res.status(400).json({ error: "Area of study ID is required" });
    }

    let programsData = [];

    // Attempt to get programs using the simpler category_id directly (more efficient without indexes)
    const [directProgramsData] = await db.query(
      `
      SELECT p.id, p.name
      FROM qacom_wp_apply_programs p
      WHERE p.category_id = ?
      ORDER BY p.name ASC
    `,
      [areaOfStudy]
    );

    if (directProgramsData && directProgramsData.length > 0) {
      programsData = directProgramsData;
    } else {
      // If direct lookup fails, fall back to the more complex query via term_relationships
      // This preserves the original logic for cases where category_id might not be directly set or reliable
      const [relatedProgramsData] = await db.query(
        `
        SELECT p.id, p.name
        FROM qacom_wp_apply_programs p
        JOIN qacom_wp_term_relationships tr ON p.id = tr.object_id
        JOIN qacom_wp_term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
        WHERE tt.taxonomy = 'program_category' AND tt.term_id = ?
        ORDER BY p.name ASC
      `,
        [areaOfStudy]
      );
      programsData = relatedProgramsData;
    }

    if (!programsData || programsData.length === 0) {
      return res
        .status(404)
        .json({ error: "No programs found for this area of study" });
    }

    const programs = programsData.map((program) => ({
      id: program.id,
      name: decodeHtmlEntities(program.name),
    }));

    res.json({ programs });
  } catch (error) {
    console.error("Error fetching programs by area of study:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

// Get all program categories (areas of study)
router.get("/program-categories", async (req, res) => {
  try {
    // Get all program categories (areas of study)
    const [categoriesData] = await db.query(`
      SELECT t.term_id, t.name
      FROM qacom_wp_term_taxonomy tt
      JOIN qacom_wp_terms t ON tt.term_id = t.term_id
      WHERE tt.taxonomy = 'program_category'
      ORDER BY t.name ASC
    `);

    if (!categoriesData || categoriesData.length === 0) {
      return res.status(404).json({ error: "No program categories found" });
    }

    const categories = categoriesData.map((category) => ({
      id: category.term_id,
      name: decodeHtmlEntities(category.name),
    }));

    res.json({ categories });
  } catch (error) {
    console.error("Error fetching program categories:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

// /api/program-data/find
router.get("/find", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { email } = req.user;

    // -------- Preload user + lookups (+ states for mapping id->name) --------
    const [
      userDataResult,
      countriesDataResult,
      categoriesDataResult,
      statesDataResult, // ⬅️ اضافه شد برای map آیدی→نام ایالت‌ها (همان منبع /api/states)
    ] = await Promise.all([
      db.query(
        `
          SELECT u.ID, um.meta_key, um.meta_value
          FROM qacom_wp_users u
          LEFT JOIN qacom_wp_usermeta um ON u.ID = um.user_id
          WHERE u.user_email = ?
        `,
        [email]
      ),
      db.query(`
          SELECT t.term_id, t.name
          FROM qacom_wp_term_taxonomy tt
          JOIN qacom_wp_terms t ON t.term_id = tt.term_id
          WHERE tt.taxonomy = 'place' AND tt.parent = 0
      `),
      db.query(`
          SELECT t.term_id, t.name
          FROM qacom_wp_term_taxonomy pr
          JOIN qacom_wp_terms t ON t.term_id = pr.term_id
          WHERE pr.taxonomy = 'program_category'
          ORDER BY t.name ASC
      `),
      db.query(`
          SELECT t.term_id, t.name
          FROM qacom_wp_term_taxonomy tt
          JOIN qacom_wp_terms t ON t.term_id = tt.term_id
          WHERE tt.taxonomy = 'place' AND tt.parent != 0
      `),
    ]);

    const userData = userDataResult[0];
    const countriesData = countriesDataResult[0] || [];
    const categoriesData = categoriesDataResult[0] || [];
    const statesData = statesDataResult?.[0] || [];

    if (!userData || userData.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Map: stateId → stateName (decode)
    const stateIdToNameMap = statesData.reduce((acc, s) => {
      acc[String(s.term_id)] = decodeHtmlEntities(s.name);
      return acc;
    }, {});

    // -------- Build userPreferences (مثل قبل) --------
    let userPreferences = {
      country: null,
      level: null,
      program: null,
      areaOfStudy: null,
      englishTest: null,
      englishScore: null,
      gpa: null,
      greTest: null,
      greTotal: null,
      greVerbal: null,
      greQuantitative: null,
      greWriting: null,
      lsatTest: null,
      satTotal: null,
      actTotal: null,
    };

    userData.forEach((meta) => {
      if (meta.meta_key === "application_country")
        userPreferences.country = meta.meta_value;
      else if (meta.meta_key === "application_level")
        userPreferences.level = meta.meta_value;
      else if (meta.meta_key === "application_program")
        userPreferences.program = meta.meta_value;
      else if (meta.meta_key === "application_english_test")
        userPreferences.englishTest = meta.meta_value;
      else if (meta.meta_key === "application_english_score")
        userPreferences.englishScore = meta.meta_value;
      else if (meta.meta_key === "application_gpa")
        userPreferences.gpa = meta.meta_value;
      else if (meta.meta_key === "gre_test")
        userPreferences.greTest = meta.meta_value;
      else if (meta.meta_key === "application_gre_total")
        userPreferences.greTotal = meta.meta_value;
      else if (meta.meta_key === "application_gre_verbal")
        userPreferences.greVerbal = meta.meta_value;
      else if (meta.meta_key === "application_gre_quantitative")
        userPreferences.greQuantitative = meta.meta_value;
      else if (meta.meta_key === "application_gre_writing")
        userPreferences.greWriting = meta.meta_value;
      else if (meta.meta_key === "lsat_test")
        userPreferences.lsatTest = meta.meta_value;
      else if (meta.meta_key === "application_sat_total")
        userPreferences.satTotal = meta.meta_value;
      else if (meta.meta_key === "application_act_total")
        userPreferences.actTotal = meta.meta_value;
    });

    userPreferences.availableCountries = countriesData.map((country) => ({
      country: country.term_id,
      name: country.name,
    }));

    userPreferences.availableAreasOfStudy = categoriesData.map((category) => ({
      id: category.term_id,
      name: decodeHtmlEntities(category.name),
    }));

    if (userPreferences.program) {
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
      if (programData && programData.length > 0 && programData[0].category_id) {
        userPreferences.areaOfStudy = {
          id: programData[0].category_id,
          name: decodeHtmlEntities(programData[0].category_name),
        };
        userPreferences.programDetails = {
          id: programData[0].id,
          name: decodeHtmlEntities(programData[0].name),
        };
      }
    }

    if (userPreferences.country) {
      userPreferences.countryDetails = {
        id: userPreferences.country,
        name:
          userPreferences.availableCountries?.find(
            (c) => c.country === userPreferences.country
          )?.name || `Unknown (${userPreferences.country})`,
      };
    }

    if (userPreferences.areaOfStudy || userPreferences.program) {
      let availableProgramsQuery = `
        SELECT p.id, p.name
        FROM qacom_wp_apply_programs p
      `;
      let availableProgramsWhere = [];
      let availableProgramsParams = [];

      if (userPreferences.areaOfStudy) {
        availableProgramsWhere.push("p.category_id = ?");
        availableProgramsParams.push(userPreferences.areaOfStudy.id);
      } else if (userPreferences.program) {
        availableProgramsWhere.push("p.id = ?");
        availableProgramsParams.push(userPreferences.program);
      }

      if (availableProgramsWhere.length > 0) {
        availableProgramsQuery += ` WHERE ${availableProgramsWhere.join(
          " AND "
        )}`;
      }
      availableProgramsQuery += " ORDER BY p.name ASC";

      const [programsData] = await db.query(
        availableProgramsQuery,
        availableProgramsParams
      );
      if (programsData && programsData.length > 0) {
        userPreferences.availablePrograms = programsData.map((program) => ({
          id: program.id,
          name: decodeHtmlEntities(program.name),
        }));
      }
    }

    // -------- Filters (با پشتیبانی CSV برای state/area/program) --------
    const filters = {
      country: req.query.country || userPreferences.country,
      level: req.query.degreeLevel || userPreferences.level,
      program: req.query.program || userPreferences.program, // CSV ok
      areaOfStudy:
        req.query.areaOfStudy ||
        (userPreferences.areaOfStudy && userPreferences.areaOfStudy.id), // CSV ok
      englishTest: req.query.english || userPreferences.englishTest,
      gpa: req.query.gpa || userPreferences.gpa,
      englishScore: req.query.englishScore || userPreferences.englishScore,
      state: req.query.state || null, // CSV ok (id or name)
      school: req.query.school || null,
      gre: req.query.gre || null,
      deadline: req.query.deadline || null,
      orderBy: req.query.orderBy || null,
    };
    const deadlineRaw = (req.query.deadline || "").toString(); // "fall" یا "Fall"
    const deadlineKey = deadlineRaw.toLowerCase(); // "fall"
    const deadlineCol = seasonColMap[deadlineKey]; // 'deadline_fall' | undefined
    const monthNums = parseMonthsFlexible(
      req.query.select_month || req.query.deadline_months
    );

    const englishTestMetaKeys = {
      TOEFL: "MIN_TOEFL",
      IELTS: "MIN_IELTS",
      Duolingo: "MIN_Duolingo",
      MELAB: "MIN_MELAB",
      PTE: "MIN_PTE",
      Cael: "MIN_Cael",
    };

    // -------- Base SELECT --------
    let baseQuery = `
      SELECT
        pr.id as rel_id,
        pr.program_id,
        pr.school_id,
        pr.level,
        pr.status,
        s.name AS school_name,
        s.country AS country,
        s.state,
        CASE
          WHEN s.image REGEXP '^[0-9]+$' THEN
            (SELECT CONCAT('/uploads/', pm.meta_value)
             FROM qacom_wp_postmeta pm
             WHERE pm.post_id = CAST(s.image AS UNSIGNED)
             AND pm.meta_key = '_wp_attached_file')
          ELSE s.image
        END AS school_logo,
        p.name AS program_name,
        pr.title AS program_title_from_pr,
        p.category_id AS program_category,
        pr.MIN_IELTS,
        pr.MIN_TOEFL,
        pr.MIN_Duolingo,
        pr.MIN_MELAB,
        pr.MIN_PTE,
        pr.MIN_Cael,
        pr.MIN_GPA,
        pr.GRE_requirement,
        pr.deadline_fall,
        pr.deadline_spring,
        pr.deadline_winter,
        pr.deadline_summer,
        pr.title_link,
        meta_tuition.meta_value AS Cost_tuition,
        meta_fee_us.meta_value AS extra_appication_fee_us,
        meta_fee.meta_value AS extra_appication_fee,
        meta_lsat.meta_value AS LSAT_requirement,
        meta_gre_subj.meta_value AS GRE_subject_requirement,
        meta_gmat.meta_value AS GMAT_requirement,
        meta_email_admission.meta_value AS Email_admission,
        meta_tel.meta_value AS TEL,
        meta_living_cost.meta_value AS Cost_living_cost,
        meta_health_insurance.meta_value AS Cost_health_insurance,
        meta_fee_cost.meta_value AS Cost_fee,
        meta_extra_recom.meta_value AS extra_recom,
        meta_extra_SOP.meta_value AS extra_SOP,
        meta_extra_recom_value.meta_value AS extra_recom_value,
        meta_admission_rate.meta_value AS admission_rate,
        meta_description.meta_value AS program_description,
        meta_course_structure.meta_value AS program_course_structure,
        meta_overview.meta_value AS program_overview,
        meta_avg_toefl.meta_value AS AVG_TOEFL,
        meta_avg_ielts.meta_value AS AVG_IELTS,
        meta_avg_duolingo.meta_value AS AVG_Duolingo,
        meta_avg_melab.meta_value AS AVG_MELAB,
        meta_avg_pte.meta_value AS AVG_PTE,
        meta_avg_gpa.meta_value AS AVG_GPA,
        meta_avg_gre_total.meta_value AS AVG_GRE_total,
        meta_avg_gre_verbal.meta_value AS AVG_GRE_verbal,
        meta_avg_gre_quantitative.meta_value AS AVG_GRE_quantitative,
        meta_avg_gre_writing.meta_value AS AVG_GRE_writing,
        meta_qs_rank.meta_value AS qsRanking
      FROM qacom_wp_apply_programs_relationship pr
      JOIN qacom_wp_apply_schools s ON pr.school_id = s.id
      JOIN qacom_wp_apply_programs p ON pr.program_id = p.id
      LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_tuition
        ON meta_tuition.program_rel_id = pr.id AND meta_tuition.meta_key = 'Cost_tuition'
      LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_fee_us
        ON meta_fee_us.program_rel_id = pr.id AND meta_fee_us.meta_key = 'extra_appication_fee_us'
      LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_fee
        ON meta_fee.program_rel_id = pr.id AND meta_fee.meta_key = 'extra_appication_fee'
      LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_lsat
        ON meta_lsat.program_rel_id = pr.id AND meta_lsat.meta_key = 'LSAT_requirement'
      LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_gre_subj
        ON meta_gre_subj.program_rel_id = pr.id AND meta_gre_subj.meta_key = 'GRE_subject_requirement'
      LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_gmat
        ON meta_gmat.program_rel_id = pr.id AND meta_gmat.meta_key = 'GMAT_requirement'
      LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_email_admission
        ON meta_email_admission.program_rel_id = pr.id AND meta_email_admission.meta_key = 'Email_admission'
      LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_tel
        ON meta_tel.program_rel_id = pr.id AND meta_tel.meta_key = 'TEL'
      LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_living_cost
        ON meta_living_cost.program_rel_id = pr.id AND meta_living_cost.meta_key = 'Cost_living_cost'
      LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_health_insurance
        ON meta_health_insurance.program_rel_id = pr.id AND meta_health_insurance.meta_key = 'Cost_health_insurance'
      LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_fee_cost
        ON meta_fee_cost.program_rel_id = pr.id AND meta_fee_cost.meta_key = 'Cost_fee'
      LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_extra_recom
        ON meta_extra_recom.program_rel_id = pr.id AND meta_extra_recom.meta_key = 'extra_recom'
      LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_extra_SOP
        ON meta_extra_SOP.program_rel_id = pr.id AND meta_extra_SOP.meta_key = 'extra_SOP'
      LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_extra_recom_value
        ON meta_extra_recom_value.program_rel_id = pr.id AND meta_extra_recom_value.meta_key = 'extra_recom_value'
      LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_admission_rate
        ON meta_admission_rate.program_rel_id = pr.id AND meta_admission_rate.meta_key = 'admission_rate'
      LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_description
        ON meta_description.program_rel_id = pr.id AND meta_description.meta_key = 'program_description'
      LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_course_structure
        ON meta_course_structure.program_rel_id = pr.id AND meta_course_structure.meta_key = 'course_structure'
      LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_overview
        ON meta_overview.program_rel_id = pr.id AND meta_overview.meta_key = 'program_overview'
      LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_avg_toefl
        ON meta_avg_toefl.program_rel_id = pr.id AND meta_avg_toefl.meta_key = 'AVG_TOEFL'
      LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_avg_ielts
        ON meta_avg_ielts.program_rel_id = pr.id AND meta_avg_ielts.meta_key = 'AVG_IELTS'
      LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_avg_duolingo
        ON meta_avg_duolingo.program_rel_id = pr.id AND meta_avg_duolingo.meta_key = 'AVG_Duolingo'
      LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_avg_melab
        ON meta_avg_melab.program_rel_id = pr.id AND meta_avg_melab.meta_key = 'AVG_MELAB'
      LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_avg_pte
        ON meta_avg_pte.program_rel_id = pr.id AND meta_avg_pte.meta_key = 'AVG_PTE'
      LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_avg_gpa
        ON meta_avg_gpa.program_rel_id = pr.id AND meta_avg_gpa.meta_key = 'AVG_GPA'
      LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_avg_gre_total
        ON meta_avg_gre_total.program_rel_id = pr.id AND meta_avg_gre_total.meta_key = 'AVG_GRE_total'
      LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_avg_gre_verbal
        ON meta_avg_gre_verbal.program_rel_id = pr.id AND meta_avg_gre_verbal.meta_key = 'AVG_GRE_verbal'
      LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_avg_gre_quantitative
        ON meta_avg_gre_quantitative.program_rel_id = pr.id AND meta_avg_gre_quantitative.meta_key = 'AVG_GRE_quantitative'
      LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_avg_gre_writing
        ON meta_avg_gre_writing.program_rel_id = pr.id AND meta_avg_gre_writing.meta_key = 'AVG_GRE_writing'
      LEFT JOIN qacom_wp_apply_schools_meta meta_qs_rank
        ON meta_qs_rank.school_id = s.id AND meta_qs_rank.meta_key = 'qs_rank'
      WHERE pr.status = 'publish'
    `;

    // -------- WHEREs --------
    let whereClauses = [];
    let params = [];

    if (filters.country) {
      whereClauses.push("s.country = ?");
      params.push(filters.country);
    }

    if (filters.level) {
      let level = filters.level === "PhD" ? "Ph.D." : filters.level;
      whereClauses.push("pr.level = ?");
      params.push(level);
    }

    // Program (CSV پشتیبانی)
    if (filters.program) {
      const progIds = parseCsv(filters.program).filter(Boolean);
      if (progIds.length === 1) {
        whereClauses.push("pr.program_id = ?");
        params.push(progIds[0]);
      } else if (progIds.length > 1) {
        whereClauses.push(
          `pr.program_id IN (${progIds.map(() => "?").join(",")})`
        );
        params.push(...progIds);
      }
    }

    // Area of Study (CSV پشتیبانی)
    if (filters.areaOfStudy) {
      const areaIds = parseCsv(filters.areaOfStudy).filter(Boolean);
      if (areaIds.length === 1) {
        whereClauses.push("p.category_id = ?");
        params.push(areaIds[0]);
      } else if (areaIds.length > 1) {
        whereClauses.push(
          `p.category_id IN (${areaIds.map(() => "?").join(",")})`
        );
        params.push(...areaIds);
      }
    }

    // English (وجود حداقل نمره)
    // --- English filter ---
    if (filters.englishTest && englishTestMetaKeys[filters.englishTest]) {
      const col = englishTestMetaKeys[filters.englishTest];

      if (filters.englishScore) {
        // آزمون + سقف نمره: فقط برنامه‌هایی که حداقل نمره‌شان <= نمره‌ کاربر باشد
        whereClauses.push(
          `pr.${col} IS NOT NULL AND pr.${col} != '' AND CAST(pr.${col} AS DECIMAL(6,2)) <= ?`
        );
        params.push(filters.englishScore);
      } else {
        // فقط آزمون انتخاب شده: وجود حداقل نمره
        whereClauses.push(`pr.${col} IS NOT NULL AND pr.${col} != ''`);
      }
    }

    // State (CSV; id یا name ⇒ name; IN)
    if (filters.state) {
      const rawStates = parseCsv(filters.state);
      if (rawStates.length) {
        const stateNames = rawStates
          .map((x) => stateIdToNameMap[x] || x) // اگر id بود، name از Map
          .map((s) => s && s.trim())
          .filter(Boolean);

        if (stateNames.length === 1) {
          whereClauses.push("s.state = ?");
          params.push(stateNames[0]);
        } else if (stateNames.length > 1) {
          whereClauses.push(
            `s.state IN (${stateNames.map(() => "?").join(",")})`
          );
          params.push(...stateNames);
        }
      }
    }

    // GPA
    if (filters.gpa) {
      whereClauses.push(
        `(pr.MIN_GPA IS NOT NULL AND pr.MIN_GPA != '' AND CAST(pr.MIN_GPA AS DECIMAL(4,2)) <= ?)`
      );
      params.push(filters.gpa);
    }

    // School
    if (filters.school) {
      whereClauses.push("pr.school_id = ?");
      params.push(filters.school);
    }

    // GRE
    if (filters.gre) {
      whereClauses.push("pr.GRE_requirement = ?");
      params.push(filters.gre);
    }

    // Deadline (یک ستون از چهار تا)
    if (deadlineCol) {
      whereClauses.push(`CAST(pr.\`${deadlineCol}\` AS CHAR) IS NOT NULL`);
      whereClauses.push(`CAST(pr.\`${deadlineCol}\` AS CHAR) != '0000-00-00'`);

      // اگر ماه هم آمده باشد، فیلتر ماه را هم اعمال کن
      if (monthNums.length) {
        whereClauses.push(
          `MONTH(pr.\`${deadlineCol}\`) IN (${monthNums
            .map(() => "?")
            .join(",")})`
        );
        params.push(...monthNums);
      }
    }

    // الصاق WHERE
    let finalBaseQuery = baseQuery;
    if (whereClauses.length > 0) {
      finalBaseQuery += " AND " + whereClauses.join(" AND ");
    }

    // Order (فعلاً همان QS → سپس نام برنامه و دانشگاه)
    finalBaseQuery += ` ORDER BY
        CASE
            WHEN qsRanking IS NULL OR qsRanking = '' OR NOT (qsRanking REGEXP '^[0-9]+$') THEN 999999999
            ELSE CAST(qsRanking AS UNSIGNED)
        END ASC,
        program_title_from_pr ASC,
        school_name ASC`;

    // Pagination
    finalBaseQuery += " LIMIT ? OFFSET ?";
    params.push(limit, offset);

    // اجرا
    const [programRows] = await db.query(finalBaseQuery, params);

    // -------- Count Query (با پشتیبانی CSV و state IN) --------
    let countQuery = `
      SELECT COUNT(DISTINCT pr.id) as count
      FROM qacom_wp_apply_programs_relationship pr
      JOIN qacom_wp_apply_schools s ON pr.school_id = s.id
      JOIN qacom_wp_apply_programs p ON pr.program_id = p.id
      WHERE pr.status = ?
    `;
    let countParams = ["publish"];
    let countWhereClauses = [];

    if (filters.country) {
      countWhereClauses.push("s.country = ?");
      countParams.push(filters.country);
    }
    if (filters.level) {
      let level = filters.level === "PhD" ? "Ph.D." : filters.level;
      countWhereClauses.push("pr.level = ?");
      countParams.push(level);
    }
    if (filters.program) {
      const progIds = parseCsv(filters.program).filter(Boolean);
      if (progIds.length === 1) {
        countWhereClauses.push("pr.program_id = ?");
        countParams.push(progIds[0]);
      } else if (progIds.length > 1) {
        countWhereClauses.push(
          `pr.program_id IN (${progIds.map(() => "?").join(",")})`
        );
        countParams.push(...progIds);
      }
    }
    if (filters.areaOfStudy) {
      const areaIds = parseCsv(filters.areaOfStudy).filter(Boolean);
      if (areaIds.length === 1) {
        countWhereClauses.push("p.category_id = ?");
        countParams.push(areaIds[0]);
      } else if (areaIds.length > 1) {
        countWhereClauses.push(
          `p.category_id IN (${areaIds.map(() => "?").join(",")})`
        );
        countParams.push(...areaIds);
      }
    }
    if (filters.englishTest && englishTestMetaKeys[filters.englishTest]) {
      const col = englishTestMetaKeys[filters.englishTest];
      if (filters.englishScore) {
        countWhereClauses.push(
          `pr.${col} IS NOT NULL AND pr.${col} != '' AND CAST(pr.${col} AS DECIMAL(6,2)) <= ?`
        );
        countParams.push(filters.englishScore);
      } else {
        countWhereClauses.push(`pr.${col} IS NOT NULL AND pr.${col} != ''`);
      }
    }

    if (filters.state) {
      const rawStates = parseCsv(filters.state);
      if (rawStates.length) {
        const stateNames = rawStates
          .map((x) => stateIdToNameMap[x] || x)
          .map((s) => s && s.trim())
          .filter(Boolean);

        if (stateNames.length === 1) {
          countWhereClauses.push("s.state = ?");
          countParams.push(stateNames[0]);
        } else if (stateNames.length > 1) {
          countWhereClauses.push(
            `s.state IN (${stateNames.map(() => "?").join(",")})`
          );
          countParams.push(...stateNames);
        }
      }
    }
    if (filters.gpa) {
      countWhereClauses.push(
        `(pr.MIN_GPA IS NOT NULL AND pr.MIN_GPA != '' AND CAST(pr.MIN_GPA AS DECIMAL(4,2)) <= ?)`
      );
      countParams.push(filters.gpa);
    }
    if (filters.school) {
      countWhereClauses.push("pr.school_id = ?");
      countParams.push(filters.school);
    }
    if (filters.gre) {
      countWhereClauses.push("pr.GRE_requirement = ?");
      countParams.push(filters.gre);
    }
    if (deadlineCol) {
      countWhereClauses.push(`CAST(pr.\`${deadlineCol}\` AS CHAR) IS NOT NULL`);
      countWhereClauses.push(
        `CAST(pr.\`${deadlineCol}\` AS CHAR) != '0000-00-00'`
      );
      if (monthNums.length) {
        countWhereClauses.push(
          `MONTH(pr.\`${deadlineCol}\`) IN (${monthNums
            .map(() => "?")
            .join(",")})`
        );
        countParams.push(...monthNums);
      }
    }
    if (countWhereClauses.length > 0) {
      countQuery += " AND " + countWhereClauses.join(" AND ");
    }

    const [countRows] = await db.query(countQuery, countParams);
    const total = countRows[0]?.count || 0;
    const hasMore = page * limit < total;

    // -------- Map rows → programs (مثل قبل) --------
    let programs = (programRows || []).map((row) => {
      const fullSchoolLogoUrl = buildUploadsUrl(row.school_logo || "");

      let program_duration = "";
      if (row.level === "Ph.D.") program_duration = "4 Years";
      else if (row.level === "Master") program_duration = "2 Years";
      else if (row.level === "Bachelor") program_duration = "4 Years";

      let validDeadlinesArray = [];
      const fallDeadline = formatDeadlineDate(row.deadline_fall);
      if (fallDeadline)
        validDeadlinesArray.push({ season: "Fall", date: fallDeadline });
      const winterDeadline = formatDeadlineDate(row.deadline_winter);
      if (winterDeadline)
        validDeadlinesArray.push({ season: "Winter", date: winterDeadline });
      const springDeadline = formatDeadlineDate(row.deadline_spring);
      if (springDeadline)
        validDeadlinesArray.push({ season: "Spring", date: springDeadline });
      const summerDeadline = formatDeadlineDate(row.deadline_summer);
      if (summerDeadline)
        validDeadlinesArray.push({ season: "Summer", date: summerDeadline });

      const admissionChancePercentage = calculateAdmissionFit(
        userPreferences,
        row
      );

      return {
        id: row.rel_id,
        name: decodeHtmlEntities(row.program_title_from_pr),
        degree: row.level,
        school: decodeHtmlEntities(row.school_name),
        schoolLogo: fullSchoolLogoUrl,
        degreeType: "Program",
        fit: mapAdmissionChanceToFit(admissionChancePercentage),
        programType: null,
        duration: program_duration,
        format: null,
        language: "English",
        campus: "On Campus",
        ranking: row.qsRanking ? parseFloat(row.qsRanking) || 0 : 0,
        qsRanking: row.qsRanking || "",
        deadline: validDeadlinesArray.length > 0 ? validDeadlinesArray : [],
        requirements: {
          toefl: {
            min: row.MIN_TOEFL ? Number(row.MIN_TOEFL) : 0,
            avg: row.AVG_TOEFL ? Number(row.AVG_TOEFL) : 0,
          },
          ielts: {
            min: row.MIN_IELTS ? Number(row.MIN_IELTS) : 0,
            avg: row.AVG_IELTS ? Number(row.AVG_IELTS) : 0,
          },
          duolingo: {
            min: row.MIN_Duolingo ? Number(row.MIN_Duolingo) : 0,
            avg: row.AVG_Duolingo ? Number(row.AVG_Duolingo) : 0,
          },
          pte: {
            min: row.MIN_PTE ? Number(row.MIN_PTE) : 0,
            avg: row.AVG_PTE ? Number(row.AVG_PTE) : 0,
          },
          gre: {
            status: row.GRE_requirement || "N/A",
            total: {
              avg: row.AVG_GRE_total ? Number(row.AVG_GRE_total) : 0,
            },
            verbal: {
              avg: row.AVG_GRE_verbal ? Number(row.AVG_GRE_verbal) : 0,
            },
            quantitative: {
              avg: row.AVG_GRE_quantitative
                ? Number(row.AVG_GRE_quantitative)
                : 0,
            },
            writing: {
              avg: row.AVG_GRE_writing ? Number(row.AVG_GRE_writing) : 0,
            },
          },
          gpa: {
            min: row.MIN_GPA ? parseFloat(row.MIN_GPA) || 0 : 0,
            avg: row.AVG_GPA ? parseFloat(row.AVG_GPA) || 0 : 0,
          },
        },
        costs: {
          residents: {
            tuition: row.Cost_tuition ? parseFloat(row.Cost_tuition) || 0 : 0,
            fees: row.Cost_fee ? parseFloat(row.Cost_fee) || 0 : 0,
            healthInsurance: row.Cost_health_insurance
              ? parseFloat(row.Cost_health_insurance) || 0
              : 0,
            livingCost: row.Cost_living_cost
              ? parseFloat(row.Cost_living_cost) || 0
              : 0,
          },
          international: {
            tuition: row.Cost_tuition ? parseFloat(row.Cost_tuition) || 0 : 0,
            fees: row.Cost_fee ? parseFloat(row.Cost_fee) || 0 : 0,
            healthInsurance: row.Cost_health_insurance
              ? parseFloat(row.Cost_health_insurance) || 0
              : 0,
            livingCost: row.Cost_living_cost
              ? parseFloat(row.Cost_living_cost) || 0
              : 0,
          },
        },
        applicationFees: {
          international: row.extra_appication_fee
            ? parseFloat(row.extra_appication_fee) || 0
            : 0,
          us: row.extra_appication_fee_us
            ? parseFloat(row.extra_appication_fee_us) || 0
            : 0,
        },
        otherRequirements: {
          transcript: row.extra_recom ? true : false,
          resumeCV: row.extra_recom ? true : false,
          applicationForm: row.extra_recom ? true : false,
          statementOfPurpose: row.extra_SOP ? true : false,
          recommendationLetters: row.extra_recom_value
            ? parseInt(row.extra_recom_value) || 0
            : 0,
        },
        admissionRate: row.admission_rate
          ? parseFloat(row.admission_rate) || 0
          : 0,
        contact: {
          tel: row.TEL || "",
          email: row.Email_admission || "",
          website: row.title_link || "",
          address: decodeHtmlEntities(row.school_name),
        },
        description: row.program_description || "",
        courseStructure: row.program_course_structure || "",
        overview: row.program_overview || "",
        favorite: false,
        country: row.country || "",
        state: row.state || "",
      };
    });

    const response = {
      programs,
      count: total,
      userPreferences,
      hasMore,
      message:
        programs.length === 0
          ? "No programs found for the selected filters"
          : "",
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching programs:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

// API endpoint to toggle program in user's program list
router.post("/program-list", async (req, res) => {
  try {
    const { programId, action } = req.body; // action: 'add' or 'remove'
    const { email } = req.user;

    if (!programId || !action || (action !== "add" && action !== "remove")) {
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

    // Check if the program exists in the relationship table
    const [programData] = await db.query(
      `
      SELECT pr.ID, pr.school_id, pr.title
      FROM qacom_wp_apply_programs_relationship pr
      WHERE pr.ID = ?
      LIMIT 1
    `,
      [programId]
    );

    if (!programData || programData.length === 0) {
      return res.status(404).json({ error: "Program not found" });
    }

    const programName = programData[0].title;

    // Get current program list
    const [programListData] = await db.query(
      `
      SELECT meta_value
      FROM qacom_wp_usermeta
      WHERE user_id = ? AND meta_key = 'program_list'
    `,
      [userId]
    );

    let programList = [];

    if (
      programListData &&
      programListData.length > 0 &&
      programListData[0].meta_value
    ) {
      // Parse the serialized PHP array format
      const serializedData = programListData[0].meta_value;
      const arrayPattern = /a:(\d+):{(.*?)}/s;
      const match = serializedData.match(arrayPattern);

      if (match) {
        // Extract values using regex
        const itemPattern = /i:(\d+);s:(\d+):"(\d+)";/g;
        let itemMatch;

        while ((itemMatch = itemPattern.exec(match[2])) !== null) {
          programList.push(itemMatch[3]); // The program ID
        }
      }
    }

    // Add or remove the program ID
    const programIdStr = String(programId);
    if (action === "add") {
      if (!programList.includes(programIdStr)) {
        programList.push(programIdStr);
      }
    } else {
      programList = programList.filter((id) => id !== programIdStr);
    }

    // Serialize back to PHP array format
    let serializedProgramList = `a:${programList.length}:{`;
    programList.forEach((id, index) => {
      serializedProgramList += `i:${index};s:${id.length}:"${id}";`;
    });
    serializedProgramList += "}";

    // Update or insert the meta
    const [existingMeta] = await db.query(
      `
      SELECT umeta_id
      FROM qacom_wp_usermeta
      WHERE user_id = ? AND meta_key = 'program_list'
    `,
      [userId]
    );

    if (existingMeta && existingMeta.length > 0) {
      // Update existing meta
      await db.query(
        `
        UPDATE qacom_wp_usermeta
        SET meta_value = ?
        WHERE user_id = ? AND meta_key = 'program_list'
      `,
        [serializedProgramList, userId]
      );
    } else {
      // Insert new meta
      await db.query(
        `
        INSERT INTO qacom_wp_usermeta (user_id, meta_key, meta_value)
        VALUES (?, 'program_list', ?)
      `,
        [userId, serializedProgramList]
      );
    }

    res.json({
      success: true,
      message:
        action === "add"
          ? `Added ${programName} to your application list`
          : `Removed ${programName} from your application list`,
      programList,
    });
  } catch (error) {
    console.error("Error managing program list:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

//API endpoint second program list
// router.get("/program-list", async (req, res) => {
//   try {
//     const schoolId =
//       parseInt(
//         String(
//           req.query.schoolId || req.query.school || req.query.school_id || ""
//         ),
//         10
//       ) || 0;

//     if (schoolId) {
//       const levelRaw = (req.query.level || "").toString();
//       const statusRaw = (req.query.status || "").toString().toLowerCase();
//       const status =
//         statusRaw === "published" ? "publish" : statusRaw || "publish";

//       const limit = Math.min(
//         parseInt(String(req.query.limit || "100"), 10) || 100,
//         10000
//       );
//       const page = Math.max(
//         parseInt(String(req.query.page || "1"), 10) || 1,
//         1
//       );
//       const offset = (page - 1) * limit;

//       const normalizeLevel = (lv = "") => {
//         const s = String(lv).toLowerCase();
//         if (s.includes("ph")) return "Ph.D.";
//         if (s.includes("master")) return "Master";
//         if (s.includes("bachelor")) return "Bachelor";
//         return "Master";
//       };

//       const BASE_SITE_URL = "https://questapply.com";
//       const buildUrl = (level, programId, sid) =>
//         `${BASE_SITE_URL}/find-program/?level=${encodeURIComponent(
//           level
//         )}&program=${encodeURIComponent(
//           String(programId)
//         )}&school=${encodeURIComponent(String(sid))}`;

//       const levelFilter = levelRaw ? `AND (LOWER(level) LIKE ?)` : ``;
//       const levelParam = levelRaw
//         ? [`%${levelRaw.toString().toLowerCase()}%`]
//         : [];

//       const [countRows] = await db.query(
//         `
//         SELECT COUNT(*) AS cnt
//         FROM qacom_wp_apply_programs_relationship
//         WHERE school_id = ? AND status = ?
//         ${levelFilter}
//         `,
//         [schoolId, status, ...levelParam]
//       );
//       const total = Number(countRows?.[0]?.cnt || 0);

//       const [rows] = await db.query(
//         `
//         SELECT
//           ID            AS row_id,
//           program_id,
//           title,
//           level,
//           type,
//           sub_program,
//           deadline_fall,
//           deadline_winter,
//           deadline_spring,
//           deadline_summer
//         FROM qacom_wp_apply_programs_relationship
//         WHERE school_id = ? AND status = ?
//         ${levelFilter}
//         ORDER BY title ASC
//         LIMIT ? OFFSET ?
//         `,
//         [schoolId, status, ...levelParam, limit, offset]
//       );

//       const parsePhpStringArray = (s) => {
//         if (!s || typeof s !== "string" || !s.startsWith("a:")) return null;
//         const out = [];
//         const re = /s:\d+:"([^"]*)"/g;
//         let m;
//         while ((m = re.exec(s)) !== null) out.push(m[1]);
//         return out.length ? out : null;
//       };

//       const seenPage = new Set();
//       const programList = [];

//       rows.forEach((r) => {
//         const lvl = normalizeLevel(r.level);
//         const title = (r.title || "").trim();
//         if (!r.program_id || !title) return;

//         const key = `${title.toLowerCase()}::${lvl}`;
//         if (seenPage.has(key)) return;
//         seenPage.add(key);

//         programList.push({
//           rowId: r.row_id,
//           programId: r.program_id,
//           title,
//           level: lvl,
//           degreeType: r.type || null,
//           subProgram: parsePhpStringArray(r.sub_program) || null,
//           url: buildUrl(lvl, r.program_id, schoolId),
//         });
//       });

//       const [allRows] = await db.query(
//         `
//   SELECT program_id, title, level, type, sub_program, deadline_fall, deadline_winter, deadline_spring, deadline_summer
//   FROM qacom_wp_apply_programs_relationship
//   WHERE school_id = ? AND status = ?
//   ORDER BY title ASC
//   `,
//         [schoolId, status]
//       );

//       // --- Aggregate seasonal deadlines across all programs for this school ---
//       const toISO = (s) => {
//         if (!s) return null;
//         // اگر از قبل YYYY-MM-DD است
//         const str = (s ?? "").toString().trim();
//         if (!str || str === "0000-00-00") return null;
//         if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
//         const t = Date.parse(str);
//         if (!isNaN(t)) {
//           const d = new Date(t);
//           const mm = String(d.getMonth() + 1).padStart(2, "0");
//           const dd = String(d.getDate()).padStart(2, "0");
//           return `${d.getFullYear()}-${mm}-${dd}`;
//         }
//         return null;
//       };

//       const minDate = (a, b) => {
//         if (!a) return b || null;
//         if (!b) return a || null;
//         return a < b ? a : b;
//       };

//       const deadlinesAgg = {
//         fall: null,
//         winter: null,
//         spring: null,
//         summer: null,
//       };

//       for (const r of allRows) {
//         const fallISO = toISO(r.deadline_fall);
//         const winterISO = toISO(r.deadline_winter);
//         const springISO = toISO(r.deadline_spring);
//         const summerISO = toISO(r.deadline_summer);

//         if (fallISO) deadlinesAgg.fall = minDate(deadlinesAgg.fall, fallISO);
//         if (winterISO)
//           deadlinesAgg.winter = minDate(deadlinesAgg.winter, winterISO);
//         if (springISO)
//           deadlinesAgg.spring = minDate(deadlinesAgg.spring, springISO);
//         if (summerISO)
//           deadlinesAgg.summer = minDate(deadlinesAgg.summer, summerISO);
//       }

//       const groupedMap = {
//         Bachelor: new Map(),
//         Master: new Map(),
//         "Ph.D.": new Map(),
//       };

//       allRows.forEach((r) => {
//         const lvl = normalizeLevel(r.level);
//         const title = (r.title || "").trim();
//         if (!r.program_id || !title) return;

//         const key = `${title.toLowerCase()}::${lvl}`;
//         if (groupedMap[lvl].has(key)) return;

//         groupedMap[lvl].set(key, {
//           rowId: null,
//           programId: r.program_id,
//           title,
//           level: lvl,
//           degreeType: r.type || null,
//           subProgram: parsePhpStringArray(r.sub_program) || null,
//           url: buildUrl(lvl, r.program_id, schoolId),
//         });
//       });

//       const byLevel = {};
//       ["Master", "Ph.D.", "Bachelor"].forEach((lvl) => {
//         const list = Array.from(groupedMap[lvl].values()).sort((a, b) =>
//           a.title.localeCompare(b.title)
//         );
//         byLevel[lvl] = { total: list.length, top3: list.slice(0, 3) };
//       });

//       return res.json({
//         schoolId,
//         page,
//         limit,
//         total,
//         programList,
//         byLevel,
//         deadlines: deadlinesAgg,
//       });
//     }

//     const { email } = req.user;
//     // گرفتن userId
//     const [userData] = await db.query(
//       `SELECT ID FROM qacom_wp_users WHERE user_email = ?`,
//       [email]
//     );
//     if (!userData?.length) {
//       return res.status(404).json({ error: "User not found" });
//     }
//     const userId = userData[0].ID;

//     const [programListData] = await db.query(
//       `SELECT meta_value FROM qacom_wp_usermeta WHERE user_id = ? AND meta_key = 'program_list'`,
//       [userId]
//     );

//     let savedProgramRowIds = [];
//     if (programListData?.length && programListData[0].meta_value) {
//       // PHP-serialized → regex parse
//       const serializedData = programListData[0].meta_value;
//       const arrayPattern = /a:(\d+):{(.*?)}/s;
//       const match = serializedData.match(arrayPattern);
//       if (match) {
//         const itemPattern = /i:(\d+);s:(\d+):"(\d+)";/g;
//         let itemMatch;
//         while ((itemMatch = itemPattern.exec(match[2])) !== null) {
//           savedProgramRowIds.push(itemMatch[3]);
//         }
//       }
//     }

//     return res.json({ programList: savedProgramRowIds });
//   } catch (error) {
//     console.error("GET /program-list error:", error);
//     res
//       .status(500)
//       .json({ error: "Internal server error", details: error.message });
//   }
// });

// GET /program-data/program-list — deadlines exactly like /find (per row, no school-level aggregation)
router.get("/program-list", async (req, res) => {
  try {
    const schoolId =
      parseInt(
        String(
          req.query.schoolId || req.query.school || req.query.school_id || ""
        ),
        10
      ) || 0;

    // ===== helpers — IDENTICAL to /find =====
    const formatDeadlineDate = (v) => {
      if (!v) return null;
      const s = String(v).trim();
      if (!s || s === "0000-00-00") return null;
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
      const t = Date.parse(s);
      if (Number.isNaN(t)) return null;
      const d = new Date(t);
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${d.getFullYear()}-${mm}-${dd}`;
    };

    const normalizeLevel = (lv = "") => {
      const s = String(lv).toLowerCase();
      if (s.includes("ph")) return "Ph.D.";
      if (s.includes("master")) return "Master";
      if (s.includes("bachelor")) return "Bachelor";
      return "Master";
    };

    const parsePhpStringArray = (s) => {
      if (!s || typeof s !== "string" || !s.startsWith("a:")) return null;
      const out = [];
      const re = /s:\d+:"([^"]*)"/g;
      let m;
      while ((m = re.exec(s)) !== null) out.push(m[1]);
      return out.length ? out : null;
    };

    const BASE_SITE_URL = "https://questapply.com";
    const buildUrl = (level, programId, sid) =>
      `${BASE_SITE_URL}/find-program/?level=${encodeURIComponent(
        level
      )}&program=${encodeURIComponent(
        String(programId)
      )}&school=${encodeURIComponent(String(sid))}`;

    // ===== no schoolId → return saved list (unchanged behavior) =====
    if (!schoolId) {
      const { email } = req.user;
      const [userData] = await db.query(
        `SELECT ID FROM qacom_wp_users WHERE user_email = ?`,
        [email]
      );
      if (!userData?.length)
        return res.status(404).json({ error: "User not found" });
      const userId = userData[0].ID;

      const [programListData] = await db.query(
        `SELECT meta_value FROM qacom_wp_usermeta WHERE user_id = ? AND meta_key = 'program_list'`,
        [userId]
      );

      let savedProgramRowIds = [];
      if (programListData?.length && programListData[0].meta_value) {
        const serializedData = programListData[0].meta_value;
        const arrayPattern = /a:(\d+):{(.*?)}/s;
        const match = serializedData.match(arrayPattern);
        if (match) {
          const itemPattern = /i:(\d+);s:(\d+):"(\d+)";/g;
          let im;
          while ((im = itemPattern.exec(match[2])) !== null)
            savedProgramRowIds.push(im[3]);
        }
      }
      return res.json({ programList: savedProgramRowIds });
    }

    // ===== with schoolId: return per-row deadlines like /find =====
    const statusRaw = (req.query.status || "").toString().toLowerCase();
    const status =
      statusRaw === "published" ? "publish" : statusRaw || "publish";

    const limit = Math.min(
      parseInt(String(req.query.limit || "100"), 10) || 100,
      10000
    );
    const page = Math.max(parseInt(String(req.query.page || "1"), 10) || 1, 1);
    const offset = (page - 1) * limit;

    const levelRaw = (req.query.level || "").toString();
    const levelFilter = levelRaw ? `AND (LOWER(pr.level) LIKE ?)` : ``;
    const levelParam = levelRaw ? [`%${levelRaw.toLowerCase()}%`] : [];

    // count
    const [countRows] = await db.query(
      `
      SELECT COUNT(*) AS cnt
      FROM qacom_wp_apply_programs_relationship pr
      WHERE pr.school_id = ? AND pr.status = ?
      ${levelFilter}
      `,
      [schoolId, status, ...levelParam]
    );
    const total = Number(countRows?.[0]?.cnt || 0);

    // rows (source of truth for deadlines)
    const [rows] = await db.query(
      `
      SELECT
        pr.ID            AS row_id,
        pr.program_id,
        pr.title,
        pr.level,
        pr.type,
        pr.sub_program,
        pr.deadline_fall,
        pr.deadline_winter,
        pr.deadline_spring,
        pr.deadline_summer
      FROM qacom_wp_apply_programs_relationship pr
      WHERE pr.school_id = ? AND pr.status = ?
      ${levelFilter}
      ORDER BY pr.title ASC
      LIMIT ? OFFSET ?
      `,
      [schoolId, status, ...levelParam, limit, offset]
    );

    // build programList EXACTLY like /find (only valid dates included)
    const programList = [];
    for (const r of rows) {
      const lvl = normalizeLevel(r.level);
      const title = (r.title || "").trim();
      if (!r.program_id || !title) continue;

      const fall = formatDeadlineDate(r.deadline_fall);
      const winter = formatDeadlineDate(r.deadline_winter);
      const spring = formatDeadlineDate(r.deadline_spring);
      const summer = formatDeadlineDate(r.deadline_summer);

      const deadline = [];
      if (fall) deadline.push({ season: "Fall", date: fall });
      if (winter) deadline.push({ season: "Winter", date: winter });
      if (spring) deadline.push({ season: "Spring", date: spring });
      if (summer) deadline.push({ season: "Summer", date: summer });

      programList.push({
        rowId: r.row_id,
        programId: r.program_id,
        title,
        level: lvl,
        degreeType: r.type || null,
        subProgram: parsePhpStringArray(r.sub_program) || null,
        url: buildUrl(lvl, r.program_id, schoolId),
        deadline, // ← مثل /find (فقط تاریخ‌های معتبر)
      });
    }

    // byLevel (for cards) — unchanged
    const [allForGroups] = await db.query(
      `
      SELECT ID AS row_id, program_id, title, level, type, sub_program
      FROM qacom_wp_apply_programs_relationship
      WHERE school_id = ? AND status = ?
      `,
      [schoolId, status]
    );
    const groupedMap = {
      Bachelor: new Map(),
      Master: new Map(),
      "Ph.D.": new Map(),
    };
    for (const r of allForGroups) {
      const lvl = normalizeLevel(r.level);
      const title = (r.title || "").trim();
      if (!r.program_id || !title) continue;
      const key = `${title.toLowerCase()}::${lvl}`;
      if (!groupedMap[lvl].has(key)) {
        groupedMap[lvl].set(key, {
          rowId: r.row_id,
          programId: r.program_id,
          title,
          level: lvl,
          degreeType: r.type || null,
          subProgram: parsePhpStringArray(r.sub_program) || null,
          url: buildUrl(lvl, r.program_id, schoolId),
        });
      }
    }
    const byLevel = {};
    ["Master", "Ph.D.", "Bachelor"].forEach((lvl) => {
      const list = Array.from(groupedMap[lvl].values()).sort((a, b) =>
        a.title.localeCompare(b.title)
      );
      byLevel[lvl] = { total: list.length, top3: list.slice(0, 3) };
    });

    // IMPORTANT: no top-level "deadlines" field here (prevents mismatch with /find)
    return res.json({
      schoolId,
      page,
      limit,
      total,
      programList,
      byLevel,
    });
  } catch (error) {
    console.error("GET /program-list error:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

// POST /favorites/programs

router.post("/favorites", async (req, res) => {
  try {
    const { programId, action } = req.body;
    const { email } = req.user || {};
    const metaKey = "favorite_programs";

    if (!email) return res.status(401).json({ error: "Unauthorized" });
    if (!programId || (action !== "add" && action !== "remove")) {
      return res.status(400).json({ error: "Invalid request parameters" });
    }

    // 1) userId
    const [userRows] = await db.query(
      `SELECT ID FROM qacom_wp_users WHERE user_email = ?`,
      [email]
    );
    if (!userRows || !userRows.length) {
      return res.status(404).json({ error: "User not found" });
    }
    const userId = userRows[0].ID;

    // 2) program exists? (اول رابطه، بعد جدول برنامه‌ها)
    const pidNum = Number(programId);
    let exists = false;

    const [rel] = await db.query(
      `SELECT id FROM qacom_wp_apply_programs_relationship WHERE id = ? LIMIT 1`,
      [pidNum]
    );
    exists = !!(rel && rel.length);

    if (!exists) {
      const [prog] = await db.query(
        `SELECT id FROM qacom_wp_apply_programs WHERE id = ? LIMIT 1`,
        [pidNum]
      );
      exists = !!(prog && prog.length);
    }
    if (!exists) return res.status(404).json({ error: "Program not found" });

    // 3) load favorites
    const [metaRows] = await db.query(
      `SELECT meta_value FROM qacom_wp_usermeta WHERE user_id = ? AND meta_key = ?`,
      [userId, metaKey]
    );
    let favorites = [];
    if (metaRows && metaRows.length && metaRows[0].meta_value) {
      try {
        const parsed = unserialize(metaRows[0].meta_value);
        if (Array.isArray(parsed)) {
          favorites = parsed.map(String);
        } else if (parsed && typeof parsed === "object") {
          favorites = Object.values(parsed).map(String);
        }
      } catch (_) {
        favorites = [];
      }
    }

    // 4) mutate
    const pid = String(programId);
    if (action === "add") {
      if (!favorites.includes(pid)) favorites.push(pid);
    } else {
      favorites = favorites.filter((id) => id !== pid);
    }
    favorites.sort((a, b) => Number(a) - Number(b));

    // 5) save (upsert)
    const serialized = serialize(favorites);
    const [existsMeta] = await db.query(
      `SELECT umeta_id FROM qacom_wp_usermeta WHERE user_id = ? AND meta_key = ?`,
      [userId, metaKey]
    );
    if (existsMeta && existsMeta.length) {
      await db.query(
        `UPDATE qacom_wp_usermeta SET meta_value = ? WHERE user_id = ? AND meta_key = ?`,
        [serialized, userId, metaKey]
      );
    } else {
      await db.query(
        `INSERT INTO qacom_wp_usermeta (user_id, meta_key, meta_value) VALUES (?, ?, ?)`,
        [userId, metaKey, serialized]
      );
    }

    return res.json({
      success: true,
      message:
        action === "add"
          ? "Added program to favorites"
          : "Removed program from favorites",
      favorites,
    });
  } catch (err) {
    console.error("Error managing program favorites:", err);
    return res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
  }
});

// GET /favorites/programs

router.get("/favorites", async (req, res) => {
  try {
    const { email } = req.user || {};
    const metaKey = "favorite_programs";

    if (!email) return res.status(401).json({ error: "Unauthorized" });

    // userId
    const [userRows] = await db.query(
      `SELECT ID FROM qacom_wp_users WHERE user_email = ?`,
      [email]
    );
    if (!userRows || !userRows.length) {
      return res.status(404).json({ error: "User not found" });
    }
    const userId = userRows[0].ID;

    // load favorites
    const [metaRows] = await db.query(
      `SELECT meta_value FROM qacom_wp_usermeta WHERE user_id = ? AND meta_key = ?`,
      [userId, metaKey]
    );

    let favorites = [];
    if (metaRows && metaRows.length && metaRows[0].meta_value) {
      try {
        const parsed = unserialize(metaRows[0].meta_value);
        if (Array.isArray(parsed)) {
          favorites = parsed.map(String);
        } else if (parsed && typeof parsed === "object") {
          favorites = Object.values(parsed).map(String);
        }
      } catch (_) {
        favorites = [];
      }
    }

    favorites.sort((a, b) => Number(a) - Number(b));
    return res.json({ favorites });
  } catch (err) {
    console.error("Error fetching program favorites:", err);
    return res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
  }
});

// /api/program-data/compare
router.get("/compare", async (req, res) => {
  try {
    // 1) Parse & validate ids
    const idsParam = (req.query.ids || "").toString().trim();
    if (!idsParam) {
      return res.status(400).json({ error: "Query param 'ids' is required" });
    }
    // ids can be CSV: "12,34,56"
    const ids = idsParam
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => Number.isFinite(n));
    if (!ids.length) {
      return res.status(400).json({ error: "No valid ids provided" });
    }

    // 2) Build dynamic placeholders for IN (...)
    const placeholders = ids.map(() => "?").join(",");

    // 3) Select the data we need (based on the same joins/aliases used in /find)
    const sql = `
      SELECT
        pr.id AS rel_id,
        pr.program_id,
        pr.school_id,
        pr.level,
        s.name AS school_name,
        CASE
          WHEN s.image REGEXP '^[0-9]+$' THEN
            (SELECT CONCAT('/uploads/', pm.meta_value)
             FROM qacom_wp_postmeta pm
             WHERE pm.post_id = CAST(s.image AS UNSIGNED)
               AND pm.meta_key = '_wp_attached_file')
          ELSE s.image
        END AS school_logo,
        p.name AS program_name,
        pr.title AS program_title_from_pr,

        -- MINs (language + GPA + GRE status)
        pr.MIN_IELTS,
        pr.MIN_TOEFL,
        pr.MIN_Duolingo,
        pr.MIN_MELAB,
        pr.MIN_PTE,
        pr.MIN_Cael,
        pr.MIN_GPA,
        pr.GRE_requirement,

        -- Deadlines (raw; keep as YYYY-MM-DD when present)
        pr.deadline_fall,
        pr.deadline_spring,
        pr.deadline_winter,
        pr.deadline_summer,

        -- Application fee
        meta_fee_us.meta_value AS extra_appication_fee_us,
        meta_fee.meta_value    AS extra_appication_fee,

        -- Costs (we'll use for residents + international)
        meta_tuition.meta_value          AS Cost_tuition,
        meta_fee_cost.meta_value         AS Cost_fee,
        meta_health_insurance.meta_value AS Cost_health_insurance,
        meta_living_cost.meta_value      AS Cost_living_cost,

        -- Averages
        meta_avg_toefl.meta_value            AS AVG_TOEFL,
        meta_avg_ielts.meta_value            AS AVG_IELTS,
        meta_avg_duolingo.meta_value         AS AVG_Duolingo,
        meta_avg_melab.meta_value            AS AVG_MELAB,
        meta_avg_pte.meta_value              AS AVG_PTE,
        meta_avg_gpa.meta_value              AS AVG_GPA,
        meta_avg_gre_total.meta_value        AS AVG_GRE_total,
        meta_avg_gre_verbal.meta_value       AS AVG_GRE_verbal,
        meta_avg_gre_quantitative.meta_value AS AVG_GRE_quantitative,
        meta_avg_gre_writing.meta_value      AS AVG_GRE_writing,

        -- Ranking (QS from school meta)
        meta_qs_rank.meta_value AS qsRanking

      FROM qacom_wp_apply_programs_relationship pr
      JOIN qacom_wp_apply_schools   s ON pr.school_id  = s.id
      JOIN qacom_wp_apply_programs  p ON pr.program_id = p.id

      LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_tuition
        ON meta_tuition.program_rel_id = pr.id AND meta_tuition.meta_key = 'Cost_tuition'
      LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_fee_us
        ON meta_fee_us.program_rel_id = pr.id AND meta_fee_us.meta_key = 'extra_appication_fee_us'
      LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_fee
        ON meta_fee.program_rel_id     = pr.id AND meta_fee.meta_key    = 'extra_appication_fee'

      LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_living_cost
        ON meta_living_cost.program_rel_id = pr.id AND meta_living_cost.meta_key = 'Cost_living_cost'
      LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_health_insurance
        ON meta_health_insurance.program_rel_id = pr.id AND meta_health_insurance.meta_key = 'Cost_health_insurance'
      LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_fee_cost
        ON meta_fee_cost.program_rel_id = pr.id AND meta_fee_cost.meta_key = 'Cost_fee'

      LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_avg_toefl
        ON meta_avg_toefl.program_rel_id = pr.id AND meta_avg_toefl.meta_key = 'AVG_TOEFL'
      LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_avg_ielts
        ON meta_avg_ielts.program_rel_id = pr.id AND meta_avg_ielts.meta_key = 'AVG_IELTS'
      LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_avg_duolingo
        ON meta_avg_duolingo.program_rel_id = pr.id AND meta_avg_duolingo.meta_key = 'AVG_Duolingo'
      LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_avg_melab
        ON meta_avg_melab.program_rel_id = pr.id AND meta_avg_melab.meta_key = 'AVG_MELAB'
      LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_avg_pte
        ON meta_avg_pte.program_rel_id = pr.id AND meta_avg_pte.meta_key = 'AVG_PTE'
      LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_avg_gpa
        ON meta_avg_gpa.program_rel_id = pr.id AND meta_avg_gpa.meta_key = 'AVG_GPA'
      LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_avg_gre_total
        ON meta_avg_gre_total.program_rel_id = pr.id AND meta_avg_gre_total.meta_key = 'AVG_GRE_total'
      LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_avg_gre_verbal
        ON meta_avg_gre_verbal.program_rel_id = pr.id AND meta_avg_gre_verbal.meta_key = 'AVG_GRE_verbal'
      LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_avg_gre_quantitative
        ON meta_avg_gre_quantitative.program_rel_id = pr.id AND meta_avg_gre_quantitative.meta_key = 'AVG_GRE_quantitative'
      LEFT JOIN qacom_wp_apply_programs_relationship_meta meta_avg_gre_writing
        ON meta_avg_gre_writing.program_rel_id = pr.id AND meta_avg_gre_writing.meta_key = 'AVG_GRE_writing'

      LEFT JOIN qacom_wp_apply_schools_meta meta_qs_rank
        ON meta_qs_rank.school_id = s.id AND meta_qs_rank.meta_key = 'qs_rank'

      WHERE pr.status = 'publish'
        AND pr.id IN (${placeholders})
    `;

    const [rows] = await db.query(sql, ids);

    // 4) Row → API shape (ordered by request ids)
    const byId = new Map(rows.map((r) => [Number(r.rel_id), r]));

    // helper: keep only YYYY-MM-DD (or null)
    const keepYMD = (raw) => {
      if (!raw) return null;
      const s = String(raw).trim();
      if (!s || s === "0000-00-00") return null;
      // Expect "YYYY-MM-DD"
      return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
    };

    const toNum = (v) => {
      if (v === null || v === undefined || v === "") return null;
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };

    const programs = ids
      .map((id) => byId.get(id))
      .filter(Boolean)
      .map((row) => {
        const fullSchoolLogoUrl = buildUploadsUrl(row.school_logo || "");
        const name =
          decodeHtmlEntities(row.program_title_from_pr || "") ||
          decodeHtmlEntities(row.program_name || "");

        return {
          // ===== Header =====
          id: Number(row.rel_id),
          programId: Number(row.program_id),
          schoolId: Number(row.school_id),
          name,
          degree: normalizeDegreeLevel(row.level || ""),
          school: decodeHtmlEntities(row.school_name || ""),
          schoolLogo: fullSchoolLogoUrl,

          // ===== Rankings =====
          rankings: {
            qs: toNum(row.qsRanking),
          },
          qsRanking: row.qsRanking ?? null,

          // ===== MINs =====
          mins: {
            toefl: toNum(row.MIN_TOEFL),
            ielts: toNum(row.MIN_IELTS),
            duolingo: toNum(row.MIN_Duolingo),
            melab: toNum(row.MIN_MELAB),
            pte: toNum(row.MIN_PTE),
            cael: toNum(row.MIN_Cael),
            gpa: toNum(row.MIN_GPA),
            // GRE/GMAT/LSAT mins: در دیتای فعلی ستون مین جدا نداریم → null
            gre: {
              total: null,
              verbal: null,
              quantitative: null,
              writing: null,
            },
            gmat: {
              total: null,
              verbal: null,
              quantitative: null,
              writing: null,
            },
            lsat: {
              total: null,
              verbal: null,
              quantitative: null,
              writing: null,
            },
          },

          // ===== Deadlines =====
          deadlines: {
            spring: keepYMD(row.deadline_spring),
            summer: keepYMD(row.deadline_summer),
            fall: keepYMD(row.deadline_fall),
            winter: keepYMD(row.deadline_winter),
          },

          // ===== Admission Chance (placeholder) =====

          // ===== Avgs =====
          avgs: {
            gpa: toNum(row.AVG_GPA),
            gre: toNum(row.AVG_GRE_total), // اگر بخوای تفکیک بدیم می‌تونیم ساختار شیئی کنیم
            gmat: null, // در متا فعلاً میانگین GMAT نداریم
            lsat: null, // در متا فعلاً میانگین LSAT نداریم
          },

          // ===== Application Fee =====
          applicationFee: {
            intl: toNum(row.extra_appication_fee),
            domestic: toNum(row.extra_appication_fee_us),
            // currency را فعلاً خالی می‌گذاریم (USD/… اگر لازم شد بعداً پر می‌کنیم)
            currency: undefined,
          },

          // ===== Costs =====
          residentsCost: {
            tuition: toNum(row.Cost_tuition),
            fee: toNum(row.Cost_fee),
            healthInsurance: toNum(row.Cost_health_insurance),
            livingCost: toNum(row.Cost_living_cost),
            currency: undefined,
          },
          internationalCost: {
            tuition: toNum(row.Cost_tuition),
            fee: toNum(row.Cost_fee),
            healthInsurance: toNum(row.Cost_health_insurance),
            livingCost: toNum(row.Cost_living_cost),
            currency: undefined,
          },
        };
      });

    return res.json({ programs });
  } catch (error) {
    console.error("GET /compare error:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

router.get("/search", async (req, res) => {
  try {
    const qRaw = String(req.query.q || "").trim();
    if (!qRaw) return res.json({ programs: [] });

    const terms = qRaw.split(/\s+/).filter(Boolean);
    const whereParts = [];
    const likeParams = [];

    // match
    for (const t of terms) {
      const like = `%${String(t).toLowerCase()}%`;
      whereParts.push("(LOWER(p.name) LIKE ? OR LOWER(s.name) LIKE ?)");
      likeParams.push(like, like);
    }

    let idParam = [];
    if (/^\d+$/.test(qRaw)) {
      whereParts.push("pr.id = ?");
      idParam = [Number(qRaw)];
    }
    const uploadsBase = String(
      process.env.WP_UPLOADS_BASE ||
        "https://questapply.com/wp-content/uploads/"
    );
    const sql = `
  SELECT
    pr.id AS id,
    pr.program_id AS programId,
    pr.school_id AS schoolId,
    p.name AS program_name,
    pr.level AS degree,
    s.name AS school_name,
    CASE
      WHEN s.image REGEXP '^[0-9]+$' THEN
        (SELECT CONCAT(CAST(? AS CHAR), pm.meta_value)  -- نکته: CAST برای اطمینان
         FROM qacom_wp_postmeta pm
         WHERE pm.post_id = CAST(s.image AS UNSIGNED)
           AND pm.meta_key = '_wp_attached_file'
         LIMIT 1)
      ELSE s.image
    END AS school_logo
  FROM qacom_wp_apply_programs_relationship pr
  JOIN qacom_wp_apply_programs p ON p.id = pr.program_id
  JOIN qacom_wp_apply_schools s ON s.id = pr.school_id
  ${whereParts.length ? "WHERE " + whereParts.join(" AND ") : ""}
  ORDER BY p.name ASC
  LIMIT 20
`;

    const params = [uploadsBase, ...likeParams, ...idParam];
    const [rows] = await db.query(sql, params);

    const programs = rows.map((r) => ({
      id: r.id, // relationship id
      programId: r.programId,
      schoolId: r.schoolId,
      name: r.program_name,
      degree: r.degree,
      school: r.school_name,
      schoolLogo: r.school_logo,
    }));

    res.json({ programs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to search programs" });
  }
});

// /api/program-data/deadline-months
router.get("/deadline-months", async (req, res) => {
  try {
    const deadlineKey = String(req.query.deadline || "").toLowerCase(); // fall|spring|winter|summer
    const deadlineCol = seasonColMap[deadlineKey];
    if (!deadlineCol) return res.json({ months: [] });

    // WHERE مشترک با /find
    let whereClauses = [`pr.status = 'publish'`];
    let params = [];

    // همانند /find
    if (req.query.country) {
      whereClauses.push("s.country = ?");
      params.push(req.query.country);
    }

    if (req.query.degreeLevel) {
      const level =
        req.query.degreeLevel === "PhD" ? "Ph.D." : req.query.degreeLevel;
      whereClauses.push("pr.level = ?");
      params.push(level);
    }

    if (req.query.program) {
      const ids = parseCsv(req.query.program);
      if (ids.length === 1) {
        whereClauses.push("pr.program_id = ?");
        params.push(ids[0]);
      } else if (ids.length > 1) {
        whereClauses.push(`pr.program_id IN (${ids.map(() => "?").join(",")})`);
        params.push(...ids);
      }
    }

    if (req.query.areaOfStudy) {
      const ids = parseCsv(req.query.areaOfStudy);
      if (ids.length === 1) {
        whereClauses.push("p.category_id = ?");
        params.push(ids[0]);
      } else if (ids.length > 1) {
        whereClauses.push(`p.category_id IN (${ids.map(() => "?").join(",")})`);
        params.push(...ids);
      }
    }

    if (req.query.school) {
      whereClauses.push("pr.school_id = ?");
      params.push(req.query.school);
    }

    if (req.query.gpa) {
      whereClauses.push(
        `(pr.MIN_GPA IS NOT NULL AND pr.MIN_GPA != '' AND CAST(pr.MIN_GPA AS DECIMAL(4,2)) <= ?)`
      );
      params.push(req.query.gpa);
    }

    if (req.query.gre) {
      whereClauses.push("pr.GRE_requirement = ?");
      params.push(req.query.gre);
    }

    // English test presence
    const englishTestMetaKeys = {
      TOEFL: "MIN_TOEFL",
      IELTS: "MIN_IELTS",
      Duolingo: "MIN_Duolingo",
      MELAB: "MIN_MELAB",
      PTE: "MIN_PTE",
      Cael: "MIN_Cael",
    };
    if (req.query.english && englishTestMetaKeys[req.query.english]) {
      const col = englishTestMetaKeys[req.query.english];
      whereClauses.push(`pr.${col} IS NOT NULL AND pr.${col} != ''`);
    }

    // فقط رکوردهایی که ددلاینِ انتخاب‌شده دارند
    whereClauses.push(`CAST(pr.\`${deadlineCol}\` AS CHAR) IS NOT NULL`);
    whereClauses.push(`CAST(pr.\`${deadlineCol}\` AS CHAR) != '0000-00-00'`);

    const sql = `
      SELECT DISTINCT MONTH(pr.\`${deadlineCol}\`) AS m
      FROM qacom_wp_apply_programs_relationship pr
      JOIN qacom_wp_apply_schools s ON pr.school_id = s.id
      JOIN qacom_wp_apply_programs p ON pr.program_id = p.id
      WHERE ${whereClauses.join(" AND ")}
      ORDER BY m ASC
    `;
    const [rows] = await db.query(sql, params);
    const months = (rows || []).map((r) => r.m).filter(Boolean); // e.g. [9,10]

    res.json({ months });
  } catch (e) {
    console.error("deadline-months error:", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

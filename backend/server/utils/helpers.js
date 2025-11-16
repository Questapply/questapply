import db from "../config/db.config.js";
import { countryMap, BASE_UPLOADS_URL } from "../config/constants.js";

/**
 * Decodes common HTML entities in a string.
 * @param {string} text The input string potentially containing HTML entities.
 * @returns {string} The string with HTML entities decoded.
 */
export const decodeHtmlEntities = (text) => {
  if (!text) return "";
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#39;/g, "'") // Added this as it was in professorsRoutes.js
    .replace(/&nbsp;/g, " ") // Added this as it was in professorsRoutes.js
    .replace(/&copy;/g, "©") // Added this as it was in professorsRoutes.js
    .replace(/&reg;/g, "®") // Added this as it was in professorsRoutes.js
    .replace(/&trade;/g, "™") // Added this as it was in professorsRoutes.js
    .replace(/&#x([0-9a-f]+);/gi, (match, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    )
    .replace(/&#(\\d+);/g, (match, dec) => String.fromCharCode(dec));
};

/**
 * Calculates the average rating from an array of review objects.
 * @param {Array<Object>} reviews An array of review objects, each with a 'rate' property.
 * @returns {number|null} The average rating, or null if no reviews.
 */
export const calculateAverageRating = (reviews) => {
  if (!reviews || reviews.length === 0) {
    return null;
  }
  const total = reviews.reduce((sum, review) => sum + review.rate, 0);
  return total / reviews.length;
};

export const convertNumber = (value) => {
  if (!value) return 0;
  const cleaned = value.replace(/,/g, "").trim();
  return isNaN(cleaned) ? 0 : parseInt(cleaned, 10);
};

//Date format function
export const formatDeadlineDate = (dateValue) => {
  if (dateValue === null || typeof dateValue === "undefined") {
    return null;
  }

  let date;
  if (dateValue instanceof Date) {
    date = dateValue;
  } else {
    const trimmedDateString = String(dateValue).trim();
    date = new Date(trimmedDateString);
  }
  if (
    isNaN(date.getTime()) ||
    date.getFullYear() <= 1899 ||
    date.toISOString().startsWith("0000-00-00")
  ) {
    console.warn(
      `Debug: Encountered problematic date value (Invalid, 1899, or zero-date string), returning null: ${dateValue}`
    );
    return null;
  }
  const options = { month: "short", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
};

// Function to normalize degree level
export const normalizeDegreeLevel = (level) => {
  if (!level) return null;

  const levelMap = {
    // Ph.D. variations
    phd: "Ph.D.",
    "ph.d": "Ph.D.",
    "ph.d.": "Ph.D.",
    "phd.": "Ph.D.",
    doctorate: "Ph.D.",
    doctoral: "Ph.D.",
    doctor: "Ph.D.",
    // Master variations
    master: "Master",
    masters: "Master",
    ms: "Master",
    ma: "Master",
    "m.sc": "Master",
    "m.sc.": "Master",
    "m.s": "Master",
    "m.s.": "Master",
    // Bachelor variations
    bachelor: "Bachelor",
    bachelors: "Bachelor",
    bs: "Bachelor",
    ba: "Bachelor",
    "b.sc": "Bachelor",
    "b.sc.": "Bachelor",
    "b.s": "Bachelor",
    "b.s.": "Bachelor",
  };

  const normalizedLevel = levelMap[level.toLowerCase()];
  return normalizedLevel || level; // Return original if no mapping found
};

// function convertToToefl(testType, score)
export const convertToToefl = (testType, score) => {
  if (score === null || typeof score === "undefined") return null;
  score = parseFloat(score);
  if (isNaN(score)) return null;

  // Conversions based on commonly available charts - these may need adjustment
  switch (testType) {
    case "IELTS":
      // Approximate conversion based on common scales (IELTS 0-9, TOEFL 0-120)
      if (score >= 9) return 120;
      if (score >= 8.5) return 118;
      if (score >= 8) return 115;
      if (score >= 7.5) return 109;
      if (score >= 7) return 102;
      if (score >= 6.5) return 94;
      if (score >= 6) return 79;
      if (score >= 5.5) return 65;
      if (score >= 5) return 52;
      if (score >= 4.5) return 35;
      if (score >= 4) return 31;
      return null; // Scores below 4 might not have a direct TOEFL equivalent
    case "Duolingo":
      // Approximate conversion based on Duolingo's provided scale (Duolingo 10-160, TOEFL 0-120)
      if (score >= 145) return 110; // Roughly 110-120
      if (score >= 130) return 100; // Roughly 100-109
      if (score >= 115) return 85; // Roughly 85-99
      if (score >= 90) return 70; // Roughly 70-84
      if (score >= 65) return 50; // Roughly 50-69
      if (score >= 40) return 30; // Roughly 30-49
      return null; // Scores below 40 might not have a meaningful TOEFL equivalent
    case "PTE":
      // Approximate conversion based on common scales (PTE 10-90, TOEFL 0-120)
      if (score >= 86) return 120;
      if (score >= 84) return 119;
      if (score >= 81) return 117;
      if (score >= 78) return 114;
      if (score >= 75) return 109;
      if (score >= 72) return 105;
      if (score >= 69) return 101;
      if (score >= 66) return 98;
      if (score >= 63) return 94;
      if (score >= 60) return 90;
      if (score >= 57) return 86;
      if (score >= 54) return 82;
      if (score >= 50) return 75;
      if (score >= 46) return 68;
      if (score >= 41) return 61;
      if (score >= 35) return 47;
      if (score >= 30) return 38;
      return null; // Scores below 30 might not have a direct TOEFL equivalent
    case "Cael":
      // Approximate conversion based on common scales (CAEL 10-90, TOEFL 0-120)
      if (score >= 80) return 100; // Roughly 100-120
      if (score >= 70) return 90; // Roughly 90-99
      if (score >= 60) return 80; // Roughly 80-89
      if (score >= 50) return 60; // Roughly 60-79
      if (score >= 40) return 40; // Roughly 40-59
      return null; // Scores below 40 might not have a direct TOEFL equivalent
    case "MELAB":
      // Approximate conversion based on common scales (MELAB 0-99, TOEFL 0-120)
      if (score >= 90) return 105; // Roughly 105-120
      if (score >= 85) return 90; // Roughly 90-104
      if (score >= 80) return 80; // Roughly 80-89
      if (score >= 75) return 70; // Roughly 70-79
      if (score >= 70) return 60; // Roughly 60-69
      return null; // Scores below 70 might not have a direct TOEFL equivalent
    case "TOEFL":
    default:
      return score;
  }
};

// Placeholder GRE percentile conversion (Returns the score itself for now)
export const convertGrePercentile = (score, section) => {
  if (score === null || typeof score === "undefined") return null;
  score = parseFloat(score);
  if (isNaN(score)) return null;
  // REPLACE with actual GRE score to percentile conversion logic
  return score;
};

// Function to calculate admission chance based on user and program data
export const calculateAdmissionFit = (userPreferences, program) => {
  // Ensure necessary user data is available (check for null/undefined/empty string)
  const userEnglishTest = userPreferences.englishTest;
  const userEnglishScore = userPreferences.englishScore
    ? parseFloat(userPreferences.englishScore)
    : null;
  const userGpa = userPreferences.gpa ? parseFloat(userPreferences.gpa) : null;
  const hasGre = userPreferences.greTest === "on";
  const hasLsatFlag = userPreferences.lsatTest === "on"; // Assuming lsat_test means user has SAT/ACT scores

  const userGreStatus = hasGre ? "yes" : "no";
  const userGreTotal =
    hasGre && userPreferences.greTotal
      ? parseFloat(userPreferences.greTotal)
      : null;
  const userGreVerbal =
    hasGre && userPreferences.greVerbal
      ? parseFloat(userPreferences.greVerbal)
      : null;
  const userGreQuantitative =
    hasGre && userPreferences.greQuantitative
      ? parseFloat(userPreferences.greQuantitative)
      : null;
  const userGreWriting =
    hasGre && userPreferences.greWriting
      ? parseFloat(userPreferences.greWriting)
      : null;

  // Use the lsatTest flag to determine if SAT/ACT scores are available
  const userSatTotal =
    hasLsatFlag && userPreferences.satTotal
      ? parseFloat(userPreferences.satTotal)
      : null;
  const userActTotal =
    hasLsatFlag && userPreferences.actTotal
      ? parseFloat(userPreferences.actTotal)
      : null;

  const applicationLevel = userPreferences.level; // e.g., 'Bachelor', 'Master', 'Ph.D.'

  // Check for minimum user data requirements based on program level
  if (applicationLevel === "Bachelor") {
    if (hasLsatFlag) {
      if (userSatTotal === null && userActTotal === null) {
        return -2;
      }
    } else {
      return -2;
    }
  }

  // Check for essential user data (English, GPA)
  // Note: The PHP code checks GRE requirement here too, but without knowing the user's
  // GRE scores from user_metas yet, we'll check based on availability later in the function
  // when calculating the GRE score component.
  if (
    userEnglishTest === null ||
    userEnglishScore === null ||
    userGpa === null
  ) {
    return -1; // Corresponds to PHP's -1 for insufficient user data
  }

  // Get program average data
  const avgToefl = program.AVG_TOEFL ? parseFloat(program.AVG_TOEFL) : null;
  const avgIelts = program.AVG_IELTS ? parseFloat(program.AVG_IELTS) : null;
  const avgDuolingo = program.AVG_Duolingo
    ? parseFloat(program.AVG_Duolingo)
    : null;
  const avgMelab = program.AVG_MELAB ? parseFloat(program.AVG_MELAB) : null;
  const avgPte = program.AVG_PTE ? parseFloat(program.AVG_PTE) : null;
  const avgGpa =
    program.AVG_GPA && program.AVG_GPA !== "NO"
      ? parseFloat(program.AVG_GPA)
      : null; // Check for 'NO' string
  const avgGreTotal = program.AVG_GRE_total
    ? parseFloat(program.AVG_GRE_total)
    : null;
  const avgGreVerbal = program.AVG_GRE_verbal
    ? parseFloat(program.AVG_GRE_verbal)
    : null;
  const avgGreQuantitative = program.AVG_GRE_quantitative
    ? parseFloat(program.AVG_GRE_quantitative)
    : null;
  const avgGreWriting = program.AVG_GRE_writing
    ? parseFloat(program.AVG_GRE_writing)
    : null;

  // Determine program English test type and check for valid average data
  let hasValidAverageData = false;
  let programEnglishTest = null;
  let avgEnglishScore = null;

  const englishTests = {
    TOEFL: avgToefl,
    IELTS: avgIelts,
    Duolingo: avgDuolingo,
    MELAB: avgMelab,
    PTE: avgPte,
    // CAEL was in MIN_Cael, not clear if there's an AVG_Cael. Assuming not for now.
  };

  for (const test in englishTests) {
    if (englishTests[test] !== null && englishTests[test] > 0) {
      programEnglishTest = test;
      avgEnglishScore = englishTests[test];
      hasValidAverageData = true;
      break; // Use the first valid average found
    }
  }

  // Check for valid average GPA data
  if (avgGpa !== null && avgGpa > 0) {
    hasValidAverageData = true;
  }

  // Check for valid average GRE data based on program requirement
  if (program.GRE_requirement !== "N/A") {
    if (
      avgGreTotal !== null ||
      avgGreVerbal !== null ||
      avgGreQuantitative !== null ||
      avgGreWriting !== null
    ) {
      hasValidAverageData = true;
    }
  }

  // If no valid average data exists for the program, we cannot calculate fit
  if (!hasValidAverageData) {
    return -2; // Corresponds to PHP's -2 for insufficient program data
  }

  // Calculate Admission Chance components
  const admission = {};

  // Calc English Test Rate
  if (
    programEnglishTest !== null &&
    avgEnglishScore !== null &&
    userEnglishScore !== null
  ) {
    let convertedUserScore = userEnglishScore;
    let effectiveAvgScore = avgEnglishScore;

    if (avgToefl !== null && userEnglishTest !== "TOEFL") {
      convertedUserScore = convertToToefl(userEnglishTest, userEnglishScore);
      effectiveAvgScore = avgToefl; // Use AVG_TOEFL for comparison
    } else if (programEnglishTest && userEnglishTest !== programEnglishTest) {
      // Fallback: if no AVG_TOEFL but program has another AVG test, convert user's score
      // to the program's preferred test type. This requires convertTo function to handle
      // conversions to tests other than TOEFL. For now, if no AVG_TOEFL, we stick to
      // comparing user's score converted to the *first available* AVG test type of the program.
      convertedUserScore = convertToToefl(userEnglishTest, userEnglishScore); // convert user to program's preferred
      effectiveAvgScore = avgEnglishScore; // use program's preferred avg
    }

    if (
      convertedUserScore !== null &&
      effectiveAvgScore !== null &&
      effectiveAvgScore > 0
    ) {
      const number = Math.min(convertedUserScore, effectiveAvgScore); // Use the smaller of the two scores
      admission.english = (number / effectiveAvgScore) * 100;
    }
  }

  // Calc GPA Rate
  if (avgGpa !== null && userGpa !== null && avgGpa > 0) {
    const number = Math.min(userGpa, avgGpa); // Use the smaller of the two GPAs
    admission.gpa = (number / avgGpa) * 100;
  }

  // Calc GRE Rate
  if (program.GRE_requirement !== "N/A" && userGreStatus === "yes") {
    const greAdmission = {};

    // Verbal
    if (avgGreVerbal !== null && userGreVerbal !== null) {
      const number = Math.min(userGreVerbal, avgGreVerbal);
      const convertedAvg = convertGrePercentile(avgGreVerbal, "verbal");
      if (convertedAvg !== null && convertedAvg !== 0) {
        greAdmission.verbal =
          (convertGrePercentile(number, "verbal") / convertedAvg) * 100;
      }
    }

    // Quantitative
    if (avgGreQuantitative !== null && userGreQuantitative !== null) {
      const number = Math.min(userGreQuantitative, avgGreQuantitative);
      const convertedAvg = convertGrePercentile(
        avgGreQuantitative,
        "quantitative"
      );
      if (convertedAvg !== null && convertedAvg !== 0) {
        greAdmission.quantitative =
          (convertGrePercentile(number, "quantitative") / convertedAvg) * 100;
      }
    }

    // Writing
    if (avgGreWriting !== null && userGreWriting !== null) {
      const number = Math.min(userGreWriting, avgGreWriting);
      const convertedAvg = convertGrePercentile(avgGreWriting, "writing");
      if (convertedAvg !== null && convertedAvg !== 0) {
        greAdmission.writing =
          (convertGrePercentile(number, "writing") / convertedAvg) * 100;
      }
    }

    if (Object.keys(greAdmission).length > 0) {
      if (
        Object.keys(greAdmission).length < 2 &&
        avgGreTotal !== null &&
        userGreTotal !== null
      ) {
        // PHP logic for using total if less than 2 sections available
        const number = Math.min(userGreTotal, avgGreTotal);
        if (avgGreTotal - 260 !== 0) {
          // Avoid division by zero (min GRE score is 260)
          admission.gre = ((number - 260) / (avgGreTotal - 260)) * 100;
        }
      } else if (Object.keys(greAdmission).length >= 2) {
        // Average the available section scores if 2 or more are present
        admission.gre =
          Object.values(greAdmission).reduce(
            (sum, percent) => sum + percent,
            0
          ) / Object.keys(greAdmission).length;
      }
    } else if (avgGreTotal !== null && userGreTotal !== null) {
      // If no section averages but total average is available
      const number = Math.min(userGreTotal, avgGreTotal);
      if (avgGreTotal - 260 !== 0) {
        // Avoid division by zero
        admission.gre = ((number - 260) / (avgGreTotal - 260)) * 100;
      }
    }
  }

  // Calc SAT Rate (for Bachelor level only) - Requires fetching SAT/ACT user metas
  if (applicationLevel === "Bachelor" && userSatTotal !== null) {
    // Assuming program doesn't have average SAT, so calculating based on max score (1600)
    admission.sat = (userSatTotal / 1600) * 100;
  }

  // Calc ACT Rate (for Bachelor level only) - Requires fetching SAT/ACT user metas
  if (applicationLevel === "Bachelor" && userActTotal !== null) {
    // Assuming program doesn't have average ACT, so calculating based on max score (36)
    admission.act = (userActTotal / 36) * 100;
  }

  // Final calculate admission chance
  let admissionChance = 0;
  const contributingFactors = Object.keys(admission);

  if (contributingFactors.length > 0) {
    const totalPercentage = Object.values(admission).reduce(
      (sum, percent) => sum + percent,
      0
    );
    admissionChance = totalPercentage / contributingFactors.length;
  } else {
    // If no factors contributed (e.g., no valid user or program data for any test/GPA)
    return -2; // Similar to PHP's handling when no valid data exists for calculation
  }

  // The PHP code applied a check_requirement function and halved the chance if it passed.
  // We don't have the check_requirement logic. For now, we return the calculated percentage directly.
  // If you need the check_requirement logic implemented, please provide it.

  // Return output (percentage)
  return Math.round(admissionChance);
};

// Function to map the calculated chance percentage to a fit string
export const mapAdmissionChanceToFit = (chancePercentage) => {
  if (chancePercentage === -1) {
    return "Insufficient User Data";
  } else if (chancePercentage === -2) {
    return "Insufficient Program Data";
  } else if (chancePercentage >= 70) {
    // Example thresholds
    return "High Fit";
  } else if (chancePercentage >= 40) {
    return "Moderate Fit";
  } else {
    return "Low Fit";
  }
};

/**
 * Fetches and processes user preferences from the database.
 * @param {string} userEmail The email of the authenticated user.
 * @returns {Promise<Object>} A promise that resolves to an object containing user preferences.
 */
export async function fetchUserPreferences(userEmail) {
  let userPreferences = {
    country: null,
    level: null,
    program: null,
    areaOfStudy: null,
    programDetails: null,
    countryDetails: null,
    availableCountries: [],
    availableAreasOfStudy: [],
    availablePrograms: [],
    appliedFilters: {
      country: false,
      level: false,
      program: false,
      areaOfStudy: false,
    },
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

  const [userData] = await db.query(
    `
    SELECT u.ID, um.meta_key, um.meta_value
    FROM qacom_wp_users u
    LEFT JOIN qacom_wp_usermeta um ON u.ID = um.user_id
    WHERE u.user_email = ?
    `,
    [email]
  );

  if (!userData || userData.length === 0) {
    // Optionally throw an error or return a specific state if user is not found
    return { userId: null, userPreferences };
  }

  const userId = userData[0].ID;

  // Convert metas to object
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

  // Get program category if program exists
  let programCategoryId = null; // Defined here to be accessible later for appliedFilters
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
      programCategoryId = programData[0].category_id;
    }
  }

  // Get country details
  if (userPreferences.country) {
    userPreferences.countryDetails = {
      id: userPreferences.country,
      name:
        countryMap[userPreferences.country] ||
        `Unknown (${userPreferences.country})`,
    };
    // Fetch states if needed, similar to schoolRoutes.js logic
    const [statesData] = await db.query(
      `
        SELECT t.term_id, t.name
        FROM qacom_wp_term_taxonomy tt
        JOIN qacom_wp_terms t ON tt.term_id = t.term_id
        WHERE tt.taxonomy = 'place' AND tt.parent = ?
        ORDER BY t.name ASC
        `,
      [userPreferences.country]
    );
    if (statesData && statesData.length > 0) {
      userPreferences.countryDetails.states = statesData.map((state) => ({
        id: state.term_id,
        name: state.name,
      }));
    }
  }

  // Get available countries
  const [countriesData] = await db.query(`
    SELECT t.term_id, t.name
    FROM qacom_wp_term_taxonomy tt
    JOIN qacom_wp_terms t ON t.term_id = tt.term_id
    WHERE tt.taxonomy = 'place' AND tt.parent = 0
  `);
  if (countriesData && countriesData.length > 0) {
    userPreferences.availableCountries = countriesData.map((country) => ({
      country: country.term_id,
      name: country.name,
    }));
  }

  // Get available areas of study
  const [categoriesData] = await db.query(`
    SELECT t.term_id, t.name
    FROM qacom_wp_term_taxonomy pr
    JOIN qacom_wp_terms t ON t.term_id = pr.term_id
    WHERE pr.taxonomy = 'program_category'
    ORDER BY t.name ASC
  `);
  if (categoriesData && categoriesData.length > 0) {
    userPreferences.availableAreasOfStudy = categoriesData.map((category) => ({
      id: category.term_id,
      name: decodeHtmlEntities(category.name),
    }));
  }

  // Get available programs
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

  // Set applied filters flags (using the programCategoryId defined earlier)
  userPreferences.appliedFilters = {
    country: userPreferences.country !== null,
    level: userPreferences.level !== null,
    program: userPreferences.program !== null,
    areaOfStudy: programCategoryId !== null,
  };

  return { userId, userPreferences };
}

function normalizeUserMeta(userMeta) {
  if (!userMeta) return {};
  if (Array.isArray(userMeta)) {
    // شکل: [{ meta_key, meta_value }, ...]
    const o = {};
    for (const row of userMeta) {
      const k = row?.meta_key;
      const v = row?.meta_value;
      if (!k) continue;
      // تلاش برای تبدیل عددی
      const num = Number(v);
      o[k] = Number.isFinite(num) ? num : v;
    }
    return o;
  }
  return userMeta; // فرض: آبجکت آماده
}

function toNum(x) {
  const n = Number(x);
  return Number.isFinite(n) ? n : undefined;
}

// نرمال‌سازی نام آزمون زبان کاربر به کلید استاندارد
function normalizeTestName(raw) {
  const t = String(raw || "")
    .trim()
    .toUpperCase();
  if (!t) return undefined;
  if (t === "DUOLINGO") return "DUOLINGO";
  if (t === "TOEFL") return "TOEFL";
  if (t === "IELTS") return "IELTS";
  if (t === "MELAB") return "MELAB";
  if (t === "PTE") return "PTE";
  if (t === "CAEL") return "CAEL";
  return t;
}

// خواندن نمره زبان کاربر بسته به آزمون انتخابی
function getUserEnglishScore(user, normTest) {
  // حالت ۱: ساختار جدید (باندل امتیازات)
  const scores = user.english_scores || {};
  const pick = (k) =>
    scores[k]?.score ??
    scores[k] ??
    user[`application_${k.toLowerCase()}_score`];

  switch (normTest) {
    case "TOEFL":
      return toNum(pick("toefl")) ?? toNum(user.application_english_score);
    case "IELTS":
      return toNum(pick("ielts")) ?? toNum(user.application_english_score);
    case "DUOLINGO":
      return toNum(pick("duolingo")) ?? toNum(user.application_english_score);
    case "MELAB":
      return toNum(pick("melab")) ?? toNum(user.application_english_score);
    case "PTE":
      return toNum(pick("pte")) ?? toNum(user.application_english_score);
    case "CAEL":
      return toNum(pick("cael")) ?? toNum(user.application_english_score);
    default:
      return undefined;
  }
}

// حداقل زبانِ موردنیاز برنامه برای آزمون انتخابی کاربر
function getProgramEnglishMin(requirements, normTest) {
  if (!requirements) return undefined;
  const r = requirements;
  switch (normTest) {
    case "TOEFL":
      return toNum(r?.toefl?.min);
    case "IELTS":
      return toNum(r?.ielts?.min);
    case "DUOLINGO":
      return toNum(r?.duolingo?.min);
    case "MELAB":
      return toNum(r?.melab?.min);
    case "PTE":
      return toNum(r?.pte?.min);
    case "CAEL":
      return toNum(r?.cael?.min);
    default:
      return undefined;
  }
}

export function calculateAdmissionChance(userMetaRaw, programDetail) {
  const user = normalizeUserMeta(userMetaRaw);
  const req = programDetail?.requirements || {};

  // ورودی‌های کاربر
  const userGPA = toNum(user.application_gpa);
  const greRequired =
    String(req?.gre?.status || "").toLowerCase() === "required";
  const userGRE = toNum(user.application_gre_total);
  const normTest = normalizeTestName(user.application_english_test);
  const userEnglish = getUserEnglishScore(user, normTest);

  // ورودی‌های برنامه (حداقل‌ها/میانگین‌ها)
  const gpaMin = toNum(req?.gpa?.min);
  const gpaAvg = toNum(req?.gpa?.avg);
  const greMin = toNum(req?.gre?.min);
  const greAvg = toNum(req?.gre?.avg ?? req?.gre?.total?.avg);
  const engMin = normTest ? getProgramEnglishMin(req, normTest) : undefined;
  const engAvg =
    normTest === "TOEFL"
      ? toNum(req?.toefl?.avg)
      : normTest === "IELTS"
      ? toNum(req?.ielts?.avg)
      : normTest === "DUOLINGO"
      ? toNum(req?.duolingo?.avg)
      : normTest === "MELAB"
      ? toNum(req?.melab?.avg)
      : normTest === "PTE"
      ? toNum(req?.pte?.avg)
      : normTest === "CAEL"
      ? toNum(req?.cael?.avg)
      : undefined;

  // چک ناکافی‌بودن دادهٔ برنامه
  if (gpaMin === undefined) return -2;
  if (normTest && engMin === undefined) return -2;
  if (greRequired && greMin === undefined) return -2;

  // چک ناکافی‌بودن دادهٔ کاربر
  if (userGPA === undefined) return -1;
  if (!normTest) return -1;
  if (userEnglish === undefined) return -1;
  if (greRequired && userGRE === undefined) return -1;

  // کمک: نسبت معیار به بازه [min..avg] (اگر avg نبود، فقط آستانه‌ای)
  const ratioBetween = (val, min, avg) => {
    if (val === undefined || min === undefined) return 0;
    if (avg !== undefined && avg > min) {
      const r = (val - min) / (avg - min);
      return Math.max(0, Math.min(1, r));
    }
    // بدون avg: اگر بالای حداقل است 1، وگرنه 0
    return val >= min ? 1 : 0;
  };

  const gpaRatio = ratioBetween(userGPA, gpaMin, gpaAvg);
  const engRatio = ratioBetween(userEnglish, engMin, engAvg);
  let greRatio = 0;
  if (greRequired) {
    greRatio = ratioBetween(userGRE, greMin, greAvg);
  }

  // وزن‌ها
  let score = 0;
  if (greRequired) {
    score = 100 * (0.4 * gpaRatio + 0.4 * engRatio + 0.2 * greRatio);
  } else {
    score = 100 * (0.5 * gpaRatio + 0.5 * engRatio);
  }

  // اگر هر حداقل کلیدی رعایت نشده، امتیاز را کف Low نگه داریم (مثلاً <= 35)
  const failsMin =
    userGPA < gpaMin ||
    (greRequired && userGRE < greMin) ||
    userEnglish < engMin;

  if (failsMin) {
    // نگه‌داشتن در محدوده Low
    score = Math.min(score, 35);
  }

  // تمیزکاری
  if (!Number.isFinite(score)) return -1;
  return Math.round(score);
}

export function buildAdmissionChancePackage(userMetaRaw, programDetail) {
  const score = calculateAdmissionChance(userMetaRaw, programDetail);
  const fit = mapAdmissionChanceToFit(score);
  return {
    admissionChance: { score },
    fit,
  };
}

// routes/auth.js  (یا authRoutes.js) — فقط روت /login را با این نسخه جایگزین کن
import express from "express";
import db from "../config/db.config.js";
import wordpressHash from "wordpress-hash-node";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import crypto from "crypto";

dotenv.config();
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your-secure-jwt-secret";
const md5 = (s) => crypto.createHash("md5").update(s, "utf8").digest("hex");

// --- یک verify چند‌طرحه و fail-safe ---
async function verifyPassword(inputPassword, storedHashRaw) {
  const hash = String(storedHashRaw ?? "").trim();

  // 1) PHPPass (WordPress)
  try {
    if (
      hash.startsWith("$P$") ||
      hash.startsWith("$H$") ||
      hash.length === 34
    ) {
      if (wordpressHash.CheckPassword(inputPassword, hash))
        return { ok: true, scheme: "phpass" };
      if (wordpressHash.CheckPassword(md5(inputPassword), hash))
        return { ok: true, scheme: "phpass-md5-prehash" };
    } else {
      // حتی اگر پیشوند واضح نبود یک‌بار امتحانش کن
      if (wordpressHash.CheckPassword(inputPassword, hash))
        return { ok: true, scheme: "phpass-unguessed" };
    }
  } catch {}

  // 2) bcrypt با پیشوند $wp$
  try {
    if (hash.startsWith("$wp$")) {
      const normalized = hash.replace(/^\$wp\$/, "$"); // $wp$2y$ → $2y$
      if (await bcrypt.compare(inputPassword, normalized))
        return { ok: true, scheme: "wp-bcrypt" };
      if (await bcrypt.compare(md5(inputPassword), normalized))
        return { ok: true, scheme: "wp-bcrypt-md5-prehash" };
    }
  } catch {}

  // 3) bcrypt استاندارد
  try {
    if (/^\$2[aby]\$/.test(hash)) {
      if (await bcrypt.compare(inputPassword, hash))
        return { ok: true, scheme: "bcrypt" };
      if (await bcrypt.compare(md5(inputPassword), hash))
        return { ok: true, scheme: "bcrypt-md5-prehash" };
    }
  } catch {}

  // 4) MD5 legacy
  try {
    if (/^[a-f0-9]{32}$/i.test(hash)) {
      if (md5(inputPassword).toLowerCase() === hash.toLowerCase())
        return { ok: true, scheme: "md5" };
    }
  } catch {}

  return { ok: false, scheme: null };
}

// --- /login ---
router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  try {
    // 1) کاربر را با alias یکنواخت بخوان
    const [rows] = await db.query(
      `SELECT ID AS userId, user_email AS email, user_pass AS hash
         FROM qacom_wp_users
        WHERE user_email = ?
        LIMIT 1`,
      [email]
    );
    if (!rows?.length)
      return res.status(401).json({ error: "Invalid email or password" });

    const user = rows[0];
    const userId = user.userId;
    const stored = String(user.hash ?? "").trim();

    // 2) تطبیق چند‌طرحه
    const result = await verifyPassword(password, stored);

    // لاگ تشخیصی کامل (به کنسول سرور می‌رود، نه کلاینت)
    console.log("login.verify", {
      email,
      prefix: stored.slice(0, 6),
      len: stored.length,
      scheme: result.scheme,
      ok: result.ok,
    });

    if (!result.ok)
      return res.status(401).json({ error: "Invalid email or password" });

    // 3) مهاجرت به PHPPass اگر غیر از phpass بود
    if (!String(result.scheme).startsWith("phpass")) {
      try {
        const newWpHash = wordpressHash.HashPassword(password);
        await db.query(`UPDATE qacom_wp_users SET user_pass = ? WHERE ID = ?`, [
          newWpHash,
          userId,
        ]);
      } catch (e) {
        console.warn("login.rehashFail", e?.message);
      }
    }

    // 4) متاها
    const [userMetas] = await db.query(
      `SELECT meta_key, meta_value
         FROM qacom_wp_usermeta
        WHERE user_id = ?
          AND meta_key IN ('profile_education','application_country','application_level','application_english_test')`,
      [userId]
    );
    const meta = {};
    for (const m of userMetas) meta[m.meta_key] = m.meta_value;
    const required = [
      "profile_education",
      "application_country",
      "application_level",
      "application_english_test",
    ];
    const isProfileComplete = required.every((k) => meta[k] && meta[k] !== "");

    const token = jwt.sign({ email: user.email, userId }, JWT_SECRET, {
      expiresIn: "1h",
    });

    return res.json({
      message: "Login successful",
      token,
      user: { email: user.email, userId },
      isProfileComplete,
    });
  } catch (err) {
    console.error("auth.login.error", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});
// API endpoint for login
// router.post("/login", async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const [users] = await db.query(
//       `
//       SELECT id, user_email, user_pass
//       FROM qacom_wp_users
//       WHERE user_email = ?`,
//       [email]
//     );

//     if (!users || users.length === 0) {
//       return res.status(401).json({ error: "Invalid email or password" });
//     }

//     const user = users[0];

//     const userId = user.ID || user.id;

//     if (!userId) {
//       return res
//         .status(500)
//         .json({ error: "User ID not found in database response" });
//     }

//     const isPasswordValid = wordpressHash.CheckPassword(
//       password,
//       user.user_pass
//     );

//     if (!isPasswordValid) {
//       return res.status(401).json({ error: "Invalid email or password" });
//     }

//     const [userMetas] = await db.query(
//       `SELECT meta_key, meta_value FROM qacom_wp_usermeta WHERE user_id = ? AND meta_key IN ('profile_education', 'application_country', 'application_level', 'application_english_test')`,
//       [user.id]
//     );

//     const metaData = {};
//     userMetas.forEach((meta) => {
//       metaData[meta.meta_key] = meta.meta_value;
//     });

//     const requiredMetaKeys = [
//       "profile_education",
//       "application_country",
//       "application_level",
//       "application_english_test",
//     ];
//     const isProfileComplete = requiredMetaKeys.every(
//       (key) => metaData[key] && metaData[key] !== ""
//     );

//     const token = jwt.sign({ email: user.user_email }, JWT_SECRET, {
//       expiresIn: "1h",
//     });

//     res.json({
//       message: "Login successful",
//       token,
//       user: { email: user.user_email },
//       isProfileComplete,
//     });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ error: "Internal server error", details: error.message });
//   }
// });

// API endpoint for signup
router.post("/signup", async (req, res) => {
  const { fullName, email, password, userType, agreeTerms } = req.body; // Assuming you get email, password, and a username

  if (!fullName || !email || !password || !userType || !agreeTerms) {
    return res.status(400).json({
      error:
        "Please fill in all required fields (fullname ,email, password, userType, agreeTerms ).",
    });
  }

  try {
    const user_login = email.split("@")[0].replace(/[^a-zA-Z0-9_.]/g, "");
    // Check if user already exists
    const [existingUsers] = await db.query(
      `SELECT ID FROM qacom_wp_users WHERE user_email = ? OR user_login = ?`,
      [email, user_login]
    );

    if (existingUsers && existingUsers.length > 0) {
      return res
        .status(409)
        .json({ error: "User with this email already exists." });
    }

    // Hash the password using WordPress's hashing mechanism
    const hashedPassword = wordpressHash.HashPassword(password);

    const now = new Date().toISOString().slice(0, 19).replace("T", " ");

    // Insert new user into qacom_wp_users table
    const [result] = await db.query(
      `INSERT INTO qacom_wp_users (user_login, user_pass, user_nicename, user_email, user_url, user_registered, user_activation_key, user_status, display_name)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_login, hashedPassword, user_login, email, "", now, "", 0, fullName]
    );
    // console.log(result);
    console.log("Result object from DB query:", result);
    const newUserId = result ? result.insertId : null;
    console.log("Value of newUserId:", newUserId);
    // Get the ID of the newly inserted user

    console.log(newUserId);
    if (!newUserId) {
      throw new Error("Failed to create user in database.");
    }

    const usermetaQueries = [];
    // Save type of User
    usermetaQueries.push(
      db.query(
        `INSERT INTO qacom_wp_usermeta (user_id, meta_key, meta_value) VALUES (?, 'application_apply_yourself_type', ?)`,
        [newUserId, userType === "student" ? "free" : userType]
      )
    );
    // Save Metakey as Fullname
    usermetaQueries.push(
      db.query(
        `INSERT INTO qacom_wp_usermeta (user_id, meta_key, meta_value) VALUES (?, 'first_name', ?)`,
        [newUserId, fullName]
      )
    );

    // Save the identifier code (if sent)
    if (req.body.referralCode) {
      usermetaQueries.push(
        db.query(
          `INSERT INTO qacom_wp_usermeta (user_id, meta_key, meta_value) VALUES (?, 'referral_code', ?)`,
          [newUserId, req.body.referralCode]
        )
      );
    }

    // Execute all metadata queries simultaneously
    await Promise.all(usermetaQueries);

    // Generate a token for the newly registered user
    const token = jwt.sign({ email: email, userId: newUserId }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: { email: email, userId: newUserId, fullName: fullName },
      isProfileComplete: false,
    });
  } catch (error) {
    console.error("Signup error:", error);

    if (error.code === "ER_DUP_ENTRY") {
      if (error.sqlMessage && error.sqlMessage.includes("user_login")) {
        return res.status(409).json({
          error:
            "Username already exists. Please try another email or username.",
        });
      }
    }

    res.status(500).json({
      error: "Internal server error during signup",
      details: error.message,
    });
  }
});
export default router;

import express from "express";
import db from "../config/db.config.js";
import wordpressHash from "wordpress-hash-node";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "your-secure-jwt-secret"; // مطمئن شوید که این متغیر از .env خوانده می‌شود

// API endpoint for login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await db.query(
      `
      SELECT id, user_email, user_pass
      FROM qacom_wp_users
      WHERE user_email = ?`,
      [email]
    );

    if (!users || users.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = users[0];

    const userId = user.ID || user.id;

    if (!userId) {
      return res
        .status(500)
        .json({ error: "User ID not found in database response" });
    }

    const isPasswordValid = wordpressHash.CheckPassword(
      password,
      user.user_pass
    );

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const [userMetas] = await db.query(
      `SELECT meta_key, meta_value FROM qacom_wp_usermeta WHERE user_id = ? AND meta_key IN ('profile_education', 'application_country', 'application_level', 'application_english_test')`,
      [user.id]
    );

    const metaData = {};
    userMetas.forEach((meta) => {
      metaData[meta.meta_key] = meta.meta_value;
    });

    const requiredMetaKeys = [
      "profile_education",
      "application_country",
      "application_level",
      "application_english_test",
    ];
    const isProfileComplete = requiredMetaKeys.every(
      (key) => metaData[key] && metaData[key] !== ""
    );

    const token = jwt.sign({ email: user.user_email }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({
      message: "Login successful",
      token,
      user: { email: user.user_email },
      isProfileComplete,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

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

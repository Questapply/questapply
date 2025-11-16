// routes/imageProxyRoutes.js
import express from "express";
import axios from "axios"; // برای ارسال درخواست HTTP از بک‌اند به سرور تصاویر
import { BASE_UPLOADS_URL } from "../config/constants.js"; // برای اعتبار سنجی URL

const router = express.Router();

router.get("/proxy-image", async (req, res) => {
  const imageUrl = req.query.url; // URL اصلی تصویر که از فرانت‌اند می‌آید

  if (!imageUrl) {
    return res.status(400).send("Image URL is required.");
  }

  // **بهبود امنیتی:** اعتبار سنجی URL برای اطمینان از اینکه فقط از دامنه های مجاز پروکسی می کنیم.
  // این یک گام مهم برای جلوگیری از حملات Open Proxy یا SSRF است.
  const allowedHost = new URL(BASE_UPLOADS_URL).host;
  let parsedUrl;
  try {
    parsedUrl = new URL(imageUrl);
  } catch (error) {
    console.error(`Invalid URL provided: ${imageUrl}`, error);
    return res.status(400).send("Invalid image URL format.");
  }

  if (parsedUrl.host !== allowedHost) {
    console.warn(`Attempt to proxy unauthorized host: ${parsedUrl.host}`);
    return res.status(403).send("Access denied: Unauthorized image host.");
  }

  try {
    const response = await axios.get(imageUrl, {
      responseType: "stream", // برای مدیریت تصاویر بزرگ به صورت استریم
      timeout: 10000, // مهلت 10 ثانیه ای برای دریافت تصویر
    });

    // تنظیم هدرهای مناسب برای پاسخ (Content-Type و Cache-Control)
    res.setHeader("Content-Type", response.headers["content-type"]);
    res.setHeader("Cache-Control", "public, max-age=31536000"); // کش برای یک سال (می‌توانید تنظیم کنید)
    res.setHeader("Access-Control-Allow-Origin", "*"); // CORS (اگر لازم است)

    response.data.pipe(res); // ارسال مستقیم استریم تصویر به کلاینت
  } catch (error) {
    console.error(`Error proxying image from ${imageUrl}:`, error.message);
    if (error.response) {
      // اگر پاسخ از سمت سرور questapply.com خطا بود
      res
        .status(error.response.status)
        .send(`Failed to load image: ${error.response.statusText}`);
    } else {
      res.status(500).send("Internal server error while fetching image.");
    }
  }
});

export default router;

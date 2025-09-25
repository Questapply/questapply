import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "localhost",
    port: 8080,
    proxy: { "/api": { target: "http://localhost:5000", changeOrigin: true } },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)), // ← مهم
    },
  },
  build: { outDir: "build" },
});
////////////////////////////
// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react-swc";
// import path from "path";
// import { componentTagger } from "lovable-tagger";

// // https://vitejs.dev/config/
// export default defineConfig(({ mode }) => ({
//   server: {
//     host: "::",
//     port: 8080,
//     proxy: {
//       // **تنظیمات پراکسی جدید برای API وردپرس**
//       "/wp-json": {
//         // هر درخواستی که با /wp-json شروع بشه
//         target: "https://questapply.com", // به این دامنه هدایت میشه
//         changeOrigin: true, // برای حل مشکل CORS ضروریه
//         secure: true, // چون مقصد HTTPS هست
//       },
//       // اگر هنوز به API لوکال نیاز داری (مثلاً برای Endpoints دیگه که وردپرس نداره)، می‌تونی این رو نگه داری.
//       // اما اگر قصدت اینه که تمام ارتباطات با وردپرس باشه، می‌تونی این بخش رو حذف کنی.
//       // '/api': {
//       //   target: 'http://localhost:5000',
//       //   changeOrigin: true,
//       //   secure: false
//       // }
//     },
//   },
//   plugins: [react(), mode === "development" && componentTagger()].filter(
//     Boolean
//   ),
//   resolve: {
//     alias: {
//       "@": path.resolve(__dirname, "./src"),
//     },
//   },
// }));

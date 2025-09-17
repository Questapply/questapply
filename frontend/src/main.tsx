import { createRoot } from "react-dom/client";
import React from "react";
import App from "./App.tsx";
import "./index.css";
// import "./components/game/responsive-game.css";

// Create custom CSS for the scrollbar styling
const style = document.createElement("style");
style.textContent = `
  /* Custom scrollbar styling */
  ::-webkit-scrollbar {
    width: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 10px;
  }
  
  ::-webkit-scrollbar-thumb {
    background: rgba(128, 90, 213, 0.6);
    border-radius: 10px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: rgba(128, 90, 213, 0.8);
  }
  
  /* Override any overflow:hidden that might be blocking scrolling */
  body, html {
    overflow-y: auto !important;
    height: auto !important;
  }
`;
document.head.appendChild(style);

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

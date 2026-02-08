import { createRoot } from "react-dom/client";
import App from "./App";
import Admin from "./Admin";
import "./index.css";

// =========================
// PWA install prompt
// =========================

let deferredPrompt: any = null;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
});

(window as any).installBurgerApp = async () => {
  if (!deferredPrompt) return;

  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
};

// =========================
// Simple routing:
// /admin => Admin
// else => App
// =========================

const root = document.getElementById("root")!;

const isAdmin = window.location.pathname === "/admin";

createRoot(root).render(
  isAdmin ? <Admin /> : <App />
);

console.log("MAIN RENDERED");
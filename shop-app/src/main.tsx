console.log("MAIN LOADED");
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App.tsx"

// PWA install prompt
let deferredPrompt: any = null

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault()
  deferredPrompt = e
})

// optional: expose to window so App.tsx can use it
;(window as any).installBurgerApp = async () => {
  if (!deferredPrompt) return

  deferredPrompt.prompt()
  await deferredPrompt.userChoice
  deferredPrompt = null
}

createRoot(document.getElementById("root")!).render(
  
    <App />
)

console.log("MAIN RENDERED");
import { createRoot } from "react-dom/client";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { Analytics } from "@vercel/analytics/react";
import "./index.css";
import App from "./App";

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("Root element not found");
}

const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;
if (!convexUrl) {
  createRoot(rootEl).render(
    <div style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>App failed to start</h1>
      <p style={{ fontSize: 14 }}>
        Missing <code>VITE_CONVEX_URL</code>. Check your <code>.env.local</code> and restart the dev server.
      </p>
    </div>,
  );
} else {
  const convex = new ConvexReactClient(convexUrl);

  createRoot(rootEl).render(
    <ConvexAuthProvider client={convex}>
      <App />
      <Analytics />
    </ConvexAuthProvider>,
  );
}

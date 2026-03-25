"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
    // TODO: Report to Sentry once integrated
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          color: "#e2e8f0",
          fontFamily: "sans-serif",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1.5rem",
          }}
        >
          <div
            style={{
              width: "4rem",
              height: "4rem",
              borderRadius: "50%",
              background: "rgba(239,68,68,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AlertTriangle
              style={{ width: "2rem", height: "2rem", color: "#ef4444" }}
            />
          </div>

          <div>
            <h1
              style={{
                margin: "0 0 0.5rem",
                fontSize: "1.5rem",
                fontWeight: 700,
              }}
            >
              Something went wrong
            </h1>
            <p style={{ margin: 0, fontSize: "0.875rem", color: "#94a3b8" }}>
              A critical error occurred. Please reload the page.
            </p>
            {error.digest && (
              <p
                style={{
                  margin: "0.5rem 0 0",
                  fontSize: "0.75rem",
                  color: "#64748b",
                }}
              >
                Error ID: {error.digest}
              </p>
            )}
          </div>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              onClick={reset}
              style={{
                padding: "0.5rem 1.25rem",
                borderRadius: "0.5rem",
                background: "#4f6ef7",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              Try again
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              style={{
                padding: "0.5rem 1.25rem",
                borderRadius: "0.5rem",
                background: "transparent",
                color: "#e2e8f0",
                border: "1px solid #334155",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              Go home
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

"use client"

import { useEffect } from "react"

export interface GlobalErrorBoundaryProps {
  error: unknown
  retry: () => void
}

/**
 * Root-level error boundary (Next.js 16 `retry` prop).
 * Must render its own `<html>`/`<body>`; kept minimal and dependency-free.
 */
export default function GlobalError({ error, retry }: GlobalErrorBoundaryProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          margin: 0,
          background: "#F7FBF9",
          color: "#183A36",
        }}
      >
        <main
          style={{
            display: "flex",
            minHeight: "100vh",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            padding: "24px",
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: "20px", fontWeight: 600, margin: 0, color: "#183A36" }}>
            Something went wrong
          </h1>
          <p style={{ color: "#526A65", fontSize: "14px", margin: 0 }}>
            The application hit an unexpected error. Please try again.
          </p>
          <button
            type="button"
            onClick={retry}
            style={{
              marginTop: "8px",
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              background: "#0B6E66",
              color: "#FFFFFF",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  )
}

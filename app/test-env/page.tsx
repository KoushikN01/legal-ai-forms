"use client"

export default function TestEnvPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Test</h1>
      <div className="space-y-2">
        <p><strong>NEXT_PUBLIC_API_URL:</strong> {process.env.NEXT_PUBLIC_API_URL || "NOT SET"}</p>
        <p><strong>NEXT_PUBLIC_GOOGLE_CLIENT_ID:</strong> {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "NOT SET"}</p>
        <p><strong>NEXT_PUBLIC_WS_URL:</strong> {process.env.NEXT_PUBLIC_WS_URL || "NOT SET"}</p>
      </div>
    </div>
  )
}





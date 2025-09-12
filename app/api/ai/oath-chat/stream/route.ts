import { NextResponse } from "next/server"

function normalizeBaseURL(u: string) {
  return (u || "").trim().replace(/\/$/, "")
}

function buildURL(baseURL: string) {
  const url = normalizeBaseURL(baseURL)
  if (!url) return ""
  if (/(responses)$/i.test(url)) return url
  if (/\/chat\/completions$/i.test(url)) return url
  return `${url}/chat/completions`
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { baseURL, apiKey, model, systemPrompt, history, userMessage } = body as {
      baseURL: string
      apiKey: string
      model: string
      systemPrompt: string
      history: { role: "user" | "assistant"; content: string }[]
      userMessage: string
    }

    if (!baseURL || !apiKey || !model || !systemPrompt || !userMessage) {
      return NextResponse.json({ error: "Missing required params" }, { status: 400 })
    }

    const messages = [
      { role: "system", content: `${systemPrompt}\n\nStream the assistantMessage tokens only. Do NOT include extra salutations.` },
      ...(history || []).map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: userMessage },
    ]

    const url = buildURL(baseURL)
    if (!url) return NextResponse.json({ error: "Invalid baseURL" }, { status: 400 })

    const upstream = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model, messages, stream: true, temperature: 0.2 }),
    })

    if (!upstream.ok || !upstream.body) {
      const t = await upstream.text().catch(() => "")
      return NextResponse.json({ error: `Upstream error: ${upstream.status}`, detail: t.slice(0, 800) }, { status: 502 })
    }

    // Proxy SSE directly
    return new Response(upstream.body, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    })
  } catch (err) {
    console.error("/api/ai/oath-chat/stream error:", err)
    return NextResponse.json({ error: "Streaming service unavailable" }, { status: 500 })
  }
}

function decodeBase64(input: string): string {
  try {
    const decoded = decodeURIComponent(input)
    // Node.js runtime
    // @ts-ignore
    return Buffer.from(decoded, "base64").toString("utf-8")
  } catch {
    try {
      // Edge/Browser fallback
      // @ts-ignore
      return decodeURIComponent(escape(atob(decodeURIComponent(input))))
    } catch {
      return ""
    }
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get("q") || ""
    if (!q) return NextResponse.json({ error: "Missing query payload" }, { status: 400 })
    const json = decodeBase64(q)
    const parsed = JSON.parse(json) as {
      baseURL: string
      apiKey: string
      model: string
      systemPrompt: string
      history: { role: "user" | "assistant"; content: string }[]
      userMessage: string
    }

    const { baseURL, apiKey, model, systemPrompt, history, userMessage } = parsed
    if (!baseURL || !apiKey || !model || !systemPrompt || !userMessage) {
      return NextResponse.json({ error: "Missing required params" }, { status: 400 })
    }

    const messages = [
      { role: "system", content: `${systemPrompt}` },
      ...(history || []).map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: userMessage },
    ]

    const url = buildURL(baseURL)
    if (!url) return NextResponse.json({ error: "Invalid baseURL" }, { status: 400 })

    const upstream = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model, messages, stream: true, temperature: 0.2 }),
    })

    if (!upstream.ok || !upstream.body) {
      const t = await upstream.text().catch(() => "")
      return NextResponse.json({ error: `Upstream error: ${upstream.status}`, detail: t.slice(0, 800) }, { status: 502 })
    }

    return new Response(upstream.body, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    })
  } catch (err) {
    console.error("/api/ai/oath-chat/stream GET error:", err)
    return NextResponse.json({ error: "Streaming service unavailable" }, { status: 500 })
  }
}



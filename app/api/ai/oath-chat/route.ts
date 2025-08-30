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

function extractJSON(text: string) {
  try {
    return JSON.parse(text)
  } catch {
    const start = text.indexOf("{")
    const end = text.lastIndexOf("}")
    if (start !== -1 && end !== -1 && end > start) {
      const maybe = text.slice(start, end + 1)
      try {
        return JSON.parse(maybe)
      } catch {
        return null
      }
    }
    return null
  }
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
      return NextResponse.json({ error: "缺少必要参数" }, { status: 400 })
    }

    const messages = [
      {
        role: "system",
        content:
          `${systemPrompt}\n\n请严格输出 JSON，对象需包含 assistantMessage 与 oathPlan（见系统提示词定义），不要输出多余解释。`,
      },
      ...(history || []).map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: userMessage },
    ]

    const url = buildURL(baseURL)
    if (!url) return NextResponse.json({ error: "baseURL 无效" }, { status: 400 })

    let resp: Response
    try {
      resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.2,
          response_format: { type: "json_object" },
        }),
      })
    } catch (networkErr: any) {
      const message = networkErr?.message || "网络错误"
      return NextResponse.json(
        {
          error: `无法连接到模型服务：${message}`,
          hint: "请检查 baseURL 是否正确、是否可达（例如需 https://api.openai.com/v1 或其他兼容地址）",
        },
        { status: 502 },
      )
    }

    if (!resp.ok) {
      const t = await resp.text().catch(() => "")
      return NextResponse.json({ error: `上游模型错误: ${resp.status}`, detail: t.slice(0, 800) }, { status: 502 })
    }

    const data = await resp.json()

    const content = data?.choices?.[0]?.message?.content || ""
    const json = typeof content === "string" ? extractJSON(content) : content

    if (!json || typeof json !== "object") {
      return NextResponse.json(
        { error: "模型未返回有效 JSON", raw: content?.slice?.(0, 800) ?? "" },
        { status: 500 },
      )
    }

    const assistantMessage = json.assistantMessage ?? ""
    const oathPlan = json.oathPlan ?? null

    return NextResponse.json({ assistantMessage, oathPlan })
  } catch (err) {
    console.error("/api/ai/oath-chat error:", err)
    return NextResponse.json({ error: "AI服务暂时不可用" }, { status: 500 })
  }
} 
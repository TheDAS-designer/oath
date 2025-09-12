"use client"

import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"

type ChatMessage = {
  role: "user" | "assistant"
  content: string
  analysis?: OathStructuredAnalysis | null
}

export type OathStructuredAnalysis = {
  infoSufficiency: "insufficient" | "sufficient"
  missingInfo: string[]
  isVerifiable: boolean
  verificationApproach: "onchain" | "offchain" | "hybrid"
  recommendedCategory: string
  requiredInfo: string[]
  verificationSteps: string[]
  evidenceTypes: string[]
  risks: string[]
  timelineEstimation: string
  readyForCostEstimation: boolean
  costEstimation?: {
    usdtMin: number
    usdtMax: number
    oathMin: number
    oathMax: number
    basis: string
    assumptions: string[]
  }
  // Optional helpers for auto-filling the form
  titleSuggestion?: string
  descriptionKeyPoints?: string[]
  tags?: string[]
  deadline?: {
    type: "relative" | "absolute" | "permanent"
    days?: number
    dateISO?: string
  }
  // Automatic monitoring/review interval for arbitrators/AI to check default
  reviewInterval?: {
    value: number
    unit: "hours" | "days" | "weeks" | "months"
  }
}

const LS_KEYS = {
  apiKey: "oathChat.apiKey",
  baseURL: "oathChat.baseURL",
  model: "oathChat.model",
  systemPrompt: "oathChat.systemPrompt",
  draft: "oathChat.draft",
  sessions: "oathChat.sessions",
  activeSessionId: "oathChat.activeSessionId",
} as const

const DEFAULT_SYSTEM_PROMPT = `You are the conversation consultant of the "Oath" DApp. Your job is to translate a user's natural-language oath into a structured, on-chain executable and arbitrable plan, and provide a cost estimate when information is sufficient. Detect and reply in the user's language.

Principles:
- First "structure the understanding", then "ask for missing information", and only when information is sufficient, "estimate cost".
- Cost estimation includes both USDT and an equal amount of OATH tokens; never guess numbers without sufficient information.
- Clearly separate verifiability: onchain / offchain / hybrid, and provide verification steps and required evidence.
- You MUST return both a natural-language assistantMessage and a structured oathPlan object.

Background (for memory/reference):
- The oath creator stakes collateral; default triggers liquidation/compensation.
- Arbitration is jointly performed by AI nodes and human arbitrators; AI pre-analyzes evidence, humans cast the final vote.
- Typical evidence: on-chain tx/contract state, timestamps, third‑party snapshots, text/image/video, signature proofs, etc.
- Cost is influenced by complexity, duration, evidence collection difficulty, likelihood of arbitration, and number of on-chain interactions.
- When information is insufficient, list missing items and give a minimal completion checklist.

Output format:
- You must return a JSON object with:
  - assistantMessage: string (concise English guidance for the user)
  - oathPlan: {
      infoSufficiency: "insufficient" | "sufficient"
      missingInfo: string[]
      isVerifiable: boolean
      verificationApproach: "onchain" | "offchain" | "hybrid"
      recommendedCategory: string
      requiredInfo: string[]
      verificationSteps: string[]
      evidenceTypes: string[]
      risks: string[]
      timelineEstimation: string
      readyForCostEstimation: boolean
      costEstimation?: {
        usdtMin: number
        usdtMax: number
        oathMin: number
        oathMax: number
        basis: string
        assumptions: string[]
      }
      // Optional helpers so the UI can auto-fill the form:
      titleSuggestion?: string
      descriptionKeyPoints?: string[]
      tags?: string[]
      deadline?: { type: "relative" | "absolute" | "permanent", days?: number, dateISO?: string }
      // Monitoring schedule for automatic reviews by AI/human arbitrators
      reviewInterval?: { value: number, unit: "hours" | "days" | "weeks" | "months" }
    }
- The assistantMessage must be concise and clear, and should use the user's language.
- oathPlan must strictly match the schema above.

Workflow:
1) First message: judge verifiability; list key clarifications; propose category and verification approach.
2) After user adds info: update plan; when readyForCostEstimation = true, output cost range with basis and assumptions.
3) Always keep oathPlan directly consumable by the frontend.`

function mapCategoryToEnum(value: string): string {
  const s = (value || "").toLowerCase()
  if (s.includes("project") || s.includes("项目")) return "project_commitment"
  if (s.includes("delivery") || s.includes("service") || s.includes("服务") || s.includes("配送")) return "delivery_service"
  if (s.includes("business") || s.includes("商业")) return "business_agreement"
  if (s.includes("personal") || s.includes("个人")) return "personal_goal"
  if (s.includes("community") || s.includes("社区")) return "community_service"
  return "other"
}

export function OathAssistantChat() {
  const [open, setOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)

  const [apiKey, setApiKey] = useState("")
  const [baseURL, setBaseURL] = useState("")
  const [model, setModel] = useState("gpt-4o-mini")
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT)

  const [messages, setMessages] = useState<ChatMessage[]>([])
  type ChatSession = { id: string; title: string; createdAt: number; updatedAt: number; messages: ChatMessage[] }
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string>("")
  const [input, setInput] = useState("")
  const [isSending, setIsSending] = useState(false)
  const lastUserInputRef = useRef<string>("")

  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    try {
      const storedApiKey = localStorage.getItem(LS_KEYS.apiKey) || ""
      const storedBaseURL = localStorage.getItem(LS_KEYS.baseURL) || ""
      const storedModel = localStorage.getItem(LS_KEYS.model) || "gemini-2.5-pro"
      const storedSystemPrompt = localStorage.getItem(LS_KEYS.systemPrompt) || DEFAULT_SYSTEM_PROMPT
      const draft = localStorage.getItem(LS_KEYS.draft)
      const sessStr = localStorage.getItem(LS_KEYS.sessions)
      const activeId = localStorage.getItem(LS_KEYS.activeSessionId) || ""
      setApiKey(storedApiKey)
      setBaseURL(storedBaseURL)
      setModel(storedModel)
      setSystemPrompt(storedSystemPrompt)
      if (draft) {
        try {
          const parsed = JSON.parse(draft)
          if (Array.isArray(parsed.messages)) setMessages(parsed.messages)
        } catch {}
      }
      if (sessStr) {
        try {
          const parsed = JSON.parse(sessStr) as ChatSession[]
          if (Array.isArray(parsed)) {
            setSessions(parsed)
            const found = parsed.find((s) => s.id === activeId) || parsed[0]
            if (found) {
              setActiveSessionId(found.id)
              setMessages(found.messages || [])
            }
          }
        } catch {}
      }
      if (!sessStr) {
        const init: ChatSession = { id: crypto.randomUUID(), title: "New session", createdAt: Date.now(), updatedAt: Date.now(), messages: [] }
        setSessions([init])
        setActiveSessionId(init.id)
        try {
          localStorage.setItem(LS_KEYS.sessions, JSON.stringify([init]))
          localStorage.setItem(LS_KEYS.activeSessionId, init.id)
        } catch {}
      }
    } catch {}
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, isSending])

  function persistSettings() {
    try {
      localStorage.setItem(LS_KEYS.apiKey, apiKey)
      localStorage.setItem(LS_KEYS.baseURL, baseURL)
      localStorage.setItem(LS_KEYS.model, model)
      localStorage.setItem(LS_KEYS.systemPrompt, systemPrompt)
    } catch {}
  }

  function persistSessions(nextSessions: ChatSession[], nextActiveId?: string) {
    try {
      localStorage.setItem(LS_KEYS.sessions, JSON.stringify(nextSessions))
      if (nextActiveId) localStorage.setItem(LS_KEYS.activeSessionId, nextActiveId)
    } catch {}
  }

  function saveDraft() {
    try {
      localStorage.setItem(LS_KEYS.draft, JSON.stringify({ messages }))
      toast({ description: "Draft saved locally" })
    } catch {
      toast({ description: "Save failed: local storage unavailable" })
    }
  }

  function saveSessionSnapshot(customTitle?: string) {
    setSessions((prev) => {
      const idx = prev.findIndex((s) => s.id === activeSessionId)
      const titleCandidate = customTitle || messages.find((m) => m.role === "user")?.content?.slice(0, 40) || "Session"
      const updated: ChatSession = {
        id: activeSessionId || crypto.randomUUID(),
        title: titleCandidate,
        createdAt: idx >= 0 ? prev[idx].createdAt : Date.now(),
        updatedAt: Date.now(),
        messages: messages,
      }
      let next: ChatSession[]
      if (idx >= 0) {
        next = [...prev]
        next[idx] = updated
      } else {
        next = [...prev, updated]
      }
      persistSessions(next, updated.id)
      return next
    })
  }

  function createNewSession() {
    const s: ChatSession = { id: crypto.randomUUID(), title: "New session", createdAt: Date.now(), updatedAt: Date.now(), messages: [] }
    setSessions((prev) => {
      const next = [s, ...prev]
      persistSessions(next, s.id)
      return next
    })
    setActiveSessionId(s.id)
    setMessages([])
  }

  function switchSession(id: string) {
    const found = sessions.find((s) => s.id === id)
    if (!found) return
    setActiveSessionId(found.id)
    setMessages(found.messages || [])
    persistSessions(sessions, found.id)
    setHistoryOpen(false)
  }

  function parseTimelineToDeadline(timeline: string): { deadlineType?: "relative" | "absolute" | "permanent"; duration?: number; deadlineDate?: string } {
    const text = (timeline || "").toLowerCase()
    // Very lightweight heuristics to help auto-fill
    // If contains keywords for permanent
    if (/(no\s*deadline|permanent|open\s*ended)/.test(text)) {
      return { deadlineType: "permanent" }
    }
    // Try parse patterns like "in 30 days", "within 6 months"
    const dayMatch = text.match(/(\d{1,3})\s*(day|days)/)
    const weekMatch = text.match(/(\d{1,3})\s*(week|weeks)/)
    const monthMatch = text.match(/(\d{1,3})\s*(month|months)/)
    const yearMatch = text.match(/(\d{1,3})\s*(year|years)/)
    if (dayMatch) {
      return { deadlineType: "relative", duration: parseInt(dayMatch[1] || "0", 10) }
    }
    if (weekMatch) {
      const w = parseInt(weekMatch[1] || "0", 10)
      return { deadlineType: "relative", duration: w * 7 }
    }
    if (monthMatch) {
      const m = parseInt(monthMatch[1] || "0", 10)
      return { deadlineType: "relative", duration: m * 30 }
    }
    if (yearMatch) {
      const y = parseInt(yearMatch[1] || "0", 10)
      return { deadlineType: "relative", duration: y * 365 }
    }
    // Try to pick up absolute date like "Oct 1, 2025"
    const date = Date.parse(timeline)
    if (!Number.isNaN(date)) {
      const iso = new Date(date).toISOString().slice(0, 16) // yyyy-MM-ddTHH:mm
      return { deadlineType: "absolute", deadlineDate: iso }
    }
    return {}
  }

  function deriveTitleFromPrompt(promptText: string): string | undefined {
    const t = (promptText || "").trim()
    if (!t) return undefined
    // take first line or sentence, limit length
    const firstLine = t.split(/\n|[。.!?]/)[0] || t
    const title = firstLine.slice(0, 60)
    return title
  }

  function applyToForm(analysis: OathStructuredAnalysis, fallbackDescription?: string, fallbackTitle?: string) {
    const cat = mapCategoryToEnum(analysis.recommendedCategory)
    let mid = 0
    if (analysis.costEstimation) {
      const a = analysis.costEstimation
      const usdt = typeof a.usdtMin === "number" && typeof a.usdtMax === "number" ? (a.usdtMin + a.usdtMax) / 2 : 0
      const oath = typeof a.oathMin === "number" && typeof a.oathMax === "number" ? (a.oathMin + a.oathMax) / 2 : 0
      mid = Math.round((usdt || oath || 0))
    }
    const amount = mid > 0 ? mid : 100
    let deadlineDetail: { deadlineType?: "relative" | "absolute" | "permanent"; duration?: number; deadlineDate?: string } = {}
    if (analysis.deadline) {
      if (analysis.deadline.type === "relative" && typeof analysis.deadline.days === "number") {
        deadlineDetail = { deadlineType: "relative", duration: analysis.deadline.days }
      } else if (analysis.deadline.type === "absolute" && analysis.deadline.dateISO) {
        // Expecting ISO 8601 string compatible with datetime-local value
        const iso = analysis.deadline.dateISO.length > 16 ? analysis.deadline.dateISO.slice(0, 16) : analysis.deadline.dateISO
        deadlineDetail = { deadlineType: "absolute", deadlineDate: iso }
      } else if (analysis.deadline.type === "permanent") {
        deadlineDetail = { deadlineType: "permanent" }
      }
    } else if (analysis.timelineEstimation) {
      deadlineDetail = parseTimelineToDeadline(analysis.timelineEstimation)
    }

    const detail = {
      category: cat,
      usdt: amount,
      oath: amount,
      tags: analysis.tags ?? [],
      title: analysis.titleSuggestion || deriveTitleFromPrompt(fallbackTitle || ""),
      description: (analysis.descriptionKeyPoints && analysis.descriptionKeyPoints.length > 0)
        ? analysis.descriptionKeyPoints.join("; ")
        : (fallbackDescription || undefined),
      ...deadlineDetail,
      reviewIntervalUnit: analysis.reviewInterval?.unit,
      reviewIntervalValue: analysis.reviewInterval?.value,
    }
    window.dispatchEvent(new CustomEvent("oath.applyFromAI", { detail }))
    toast({ description: "Applied suggested fields to the form (1:1 amounts)" })
  }

  async function send() {
    if (!input.trim()) return
    if (!apiKey || !baseURL) {
      alert("Please configure baseURL and API Key in Settings")
      return
    }

    const userMessage: ChatMessage = { role: "user", content: input }
    lastUserInputRef.current = input
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsSending(true)

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }))

      // 1) Fire streaming SSE for assistantMessage tokens (chat-like typing but native stream)
      // EventSource based streaming (native SSE)
      const msgIndex = messages.length + 1
      setMessages((prev) => [...prev, { role: "assistant", content: "", analysis: null }])
      await new Promise<void>(async (resolve, reject) => {
        const payload = {
          baseURL,
          apiKey,
          model,
          systemPrompt,
          history,
          userMessage: userMessage.content,
        }
        // Safer encoding for non-Latin characters
        const jsonStr = JSON.stringify(payload)
        const q = encodeURIComponent(btoa(unescape(encodeURIComponent(jsonStr))))
        const es = new EventSource(`/api/ai/oath-chat/stream?q=${q}`)
        // 通过 first open 再发送 body（借助 POST 预请求不适配 EventSource，改用 URL 传参 + bodyless 约定）
        // 这里采用 fetch 初始化会话并返回一个 sessionId，然后用该 sessionId 打开 SSE 更复杂。
        // 为避免后端大改，我们改为以 POST 预热方案：因此这里我们改用 fetch 触发流已经就绪的重放。
        // 简化：直接关闭并回退到 fetch-based reader 若浏览器不允许。
        es.onerror = () => {
          es.close()
          reject(new Error("EventSource connection failed"))
        }
        es.onmessage = (e) => {
          const payload = (e.data || "").trim()
          if (!payload || payload === "[DONE]") {
            es.close()
            resolve()
            return
          }
          try {
            const obj = JSON.parse(payload)
            const delta = obj?.choices?.[0]?.delta
            const token = typeof delta?.content === "string" ? delta.content : ""
            if (!token) return
            setMessages((prev) => {
              const copy = [...prev]
              const msg = copy[msgIndex]
              if (msg) copy[msgIndex] = { ...msg, content: (msg.content || "") + token }
              return copy
            })
          } catch {}
        }
      })

      // 2) Request final structured JSON (oathPlan) via HTTP once text stream finished
      const res = await fetch("/api/ai/oath-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baseURL, apiKey, model, systemPrompt, history, userMessage: userMessage.content }),
      })
      const data = await res.json()
      if (res.ok && data?.oathPlan) {
        setMessages((prev) => {
          const copy = [...prev]
          const msg = copy[msgIndex]
          if (msg) copy[msgIndex] = { ...msg, analysis: data.oathPlan }
          return copy
        })
      }
      saveSessionSnapshot()
    } catch (err) {
      const assistantChat: ChatMessage = {
        role: "assistant",
        content: "Sorry, the AI service is temporarily unavailable. Please check network and settings and try again later.",
        analysis: null,
      }
      setMessages((prev) => [...prev, assistantChat])
      // eslint-disable-next-line no-console
      console.error("OathAssistantChat error:", err)
    } finally {
      setIsSending(false)
      // Persist the session even on error so history is retained
      saveSessionSnapshot()
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="default">Oath AI Assistant</Button>
        </SheetTrigger>
        <SheetContent className="flex flex-col w-full sm:max-w-xl p-0">
          <SheetHeader className="px-4 pt-4 pb-2">
            <SheetTitle className="flex items-center justify-between">
              <span>Oath AI Assistant</span>
              <div className="flex items-center gap-2">
                <Dialog open={settingsOpen} onOpenChange={(o) => setSettingsOpen(o)}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="secondary" className="transition-transform active:scale-95">Settings</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Model & Prompt Settings</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 pb-2">
                      <div>
                        <label className="text-sm text-slate-600">System prompt</label>
                        <Textarea value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} rows={10} />
                      </div>
                      <div>
                        <label className="text-sm text-slate-600">Base URL</label>
                        <Input value={baseURL} onChange={(e) => setBaseURL(e.target.value)} placeholder="例如：https://api.openai.com/v1" />
                      </div>
                      <div>
                        <label className="text-sm text-slate-600">API Key</label>
                        <Input value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="sk-..." type="password" />
                      </div>
                      <div>
                        <label className="text-sm text-slate-600">Model</label>
                        <Input value={model} onChange={(e) => setModel(e.target.value)} placeholder="gpt-4o-mini" />
                      </div>
                      <div className="flex justify-end gap-2 sticky bottom-0 bg-white pt-2">
                        <Button variant="secondary" onClick={() => {
                          setSystemPrompt(DEFAULT_SYSTEM_PROMPT)
                        }}>Reset default</Button>
                        <Button onClick={() => { persistSettings(); setSettingsOpen(false) }}>Save</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="transition-transform active:scale-95">History</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Chat history</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-slate-600">{sessions.length} sessions</div>
                        <Button size="sm" onClick={createNewSession}>New session</Button>
                      </div>
                      <div className="divide-y border rounded">
                        {sessions.map((s) => (
                          <button key={s.id} onClick={() => switchSession(s.id)} className={`w-full text-left px-3 py-2 hover:bg-slate-50 ${activeSessionId === s.id ? "bg-slate-50" : ""}`}>
                            <div className="font-medium truncate">{s.title || "Untitled"}</div>
                            <div className="text-xs text-slate-500">{new Date(s.updatedAt).toLocaleString()} · {s.messages?.length || 0} messages</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </SheetTitle>
          </SheetHeader>
          <Separator />

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">如何使用</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-600 space-y-2">
                  <p>在此与 AI 沟通你的誓言目标与验证方式。助手会：</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>判断是否可验证，并给出验证路径</li>
                    <li>列出需要你补充的关键信息</li>
                    <li>提供结构化方案，信息充分后给出 USDT 与誓言币估算</li>
                  </ul>
                </CardContent>
              </Card>
            ) : null}

            {messages.map((m, idx) => (
              <div key={idx} className={m.role === "user" ? "text-right" : "text-left"}>
                <div className={
                  m.role === "user"
                    ? "inline-block bg-slate-900 text-white px-3 py-2 rounded-lg max-w-[85%]"
                    : "inline-block bg-slate-100 text-slate-900 px-3 py-2 rounded-lg max-w-[85%]"
                }>
                  <div className="whitespace-pre-wrap text-sm">{m.content}</div>
                </div>

                {m.analysis ? (
                  <div className="mt-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">结构化分析</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-slate-500">可验证：</span>
                            <span>{m.analysis.isVerifiable ? "是" : "否"}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">路径：</span>
                            <span>{m.analysis.verificationApproach}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">信息完备：</span>
                            <span>{m.analysis.infoSufficiency === "sufficient" ? "充分" : "不足"}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">建议分类：</span>
                            <span>{m.analysis.recommendedCategory}</span>
                          </div>
                        </div>

                        {m.analysis.missingInfo.length > 0 ? (
                          <div>
                            <div className="text-slate-500 mb-1">缺失信息：</div>
                            <ul className="list-disc pl-5 space-y-1">
                              {m.analysis.missingInfo.map((x, i) => (
                                <li key={i}>{x}</li>
                              ))}
                            </ul>
                          </div>
                        ) : null}

                        {m.analysis.requiredInfo.length > 0 ? (
                          <div>
                            <div className="text-slate-500 mb-1">需提供信息：</div>
                            <ul className="list-disc pl-5 space-y-1">
                              {m.analysis.requiredInfo.map((x, i) => (
                                <li key={i}>{x}</li>
                              ))}
                            </ul>
                          </div>
                        ) : null}

                        {m.analysis.verificationSteps.length > 0 ? (
                          <div>
                            <div className="text-slate-500 mb-1">验证步骤：</div>
                            <ol className="list-decimal pl-5 space-y-1">
                              {m.analysis.verificationSteps.map((x, i) => (
                                <li key={i}>{x}</li>
                              ))}
                            </ol>
                          </div>
                        ) : null}

                        {m.analysis.evidenceTypes.length > 0 ? (
                          <div>
                            <div className="text-slate-500 mb-1">证据类型：</div>
                            <ul className="list-disc pl-5 space-y-1">
                              {m.analysis.evidenceTypes.map((x, i) => (
                                <li key={i}>{x}</li>
                              ))}
                            </ul>
                          </div>
                        ) : null}

                        {m.analysis.risks.length > 0 ? (
                          <div>
                            <div className="text-slate-500 mb-1">风险提示：</div>
                            <ul className="list-disc pl-5 space-y-1">
                              {m.analysis.risks.map((x, i) => (
                                <li key={i}>{x}</li>
                              ))}
                            </ul>
                          </div>
                        ) : null}

                        <div>
                          <span className="text-slate-500">时间预估：</span>
                          <span>{m.analysis.timelineEstimation}</span>
                        </div>

                        {m.analysis.readyForCostEstimation && m.analysis.costEstimation ? (
                          <div className="border rounded-md p-2">
                            <div className="font-medium">费用估算</div>
                            <div className="text-sm mt-1">USDT：{m.analysis.costEstimation.usdtMin} - {m.analysis.costEstimation.usdtMax}</div>
                            <div className="text-sm">誓言币：{m.analysis.costEstimation.oathMin} - {m.analysis.costEstimation.oathMax}</div>
                            <div className="text-sm mt-1 text-slate-600">依据：{m.analysis.costEstimation.basis}</div>
                            {m.analysis.costEstimation.assumptions.length > 0 ? (
                              <ul className="list-disc pl-5 text-sm text-slate-600 mt-1">
                                {m.analysis.costEstimation.assumptions.map((x, i) => (
                                  <li key={i}>{x}</li>
                                ))}
                              </ul>
                            ) : null}
                          </div>
                        ) : (
                          <div className="text-sm text-slate-500">信息不足以估算费用时，将优先引导补充必要要素。</div>
                        )}

                        {idx === messages.length - 1 ? (
                          <div className="flex gap-2 pt-2">
                            <Button size="sm" className="transition-transform active:scale-95" onClick={() => applyToForm(m.analysis!, m.content, lastUserInputRef.current)} disabled={m.analysis.infoSufficiency !== "sufficient"}>Apply to form</Button>
                            <Button size="sm" variant="secondary" className="transition-transform active:scale-95" onClick={() => { saveDraft(); saveSessionSnapshot() }}>Save draft</Button>
                          </div>
                        ) : null}
                      </CardContent>
                    </Card>
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <div className="p-4 border-t space-y-2">
            <div className="flex gap-2">
              <Textarea
                placeholder="Type your oath or details... Enter to send, Shift+Enter for newline"
                rows={2}
                className="resize-none max-h-[40vh]"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onInput={(e: any) => {
                  const t = e.currentTarget as HTMLTextAreaElement
                  t.style.height = "auto"
                  t.style.height = `${t.scrollHeight}px`
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    if (!isSending) void send()
                  }
                }}
              />
              <Button onClick={() => void send()} disabled={isSending}>{isSending ? "Sending..." : "Send"}</Button>
            </div>
            <div className="text-xs text-slate-500">
              Using custom baseURL / API Key / model. Settings are stored locally for demo only.
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
} 
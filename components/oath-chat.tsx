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
}

const LS_KEYS = {
  apiKey: "oathChat.apiKey",
  baseURL: "oathChat.baseURL",
  model: "oathChat.model",
  systemPrompt: "oathChat.systemPrompt",
  draft: "oathChat.draft",
} as const

const DEFAULT_SYSTEM_PROMPT = `你是“誓言 (Oath) DApp”的专业对话式顾问，负责把自然语言誓言分解为可在链上执行与仲裁的结构化方案，并在信息充足时给出费用估算。

严格遵循以下原则：
- 先“结构化理解”，再“引导补充信息”，最后在信息充足时“估算费用”。
- 估算费用包含 USDT 及等量的誓言币 (OATH)；没有足够信息时不得盲目给出数值。
- 清晰区分可验证性：onchain / offchain / hybrid，并给出验证步骤与所需证据。
- 输出时必须同时提供自然语言解释 assistantMessage 以及 oathPlan 结构化对象。

背景要点(供你记忆与参考)：
- 誓言发起人提供抵押，违约将触发清算与赔付；
- 仲裁由 AI 节点 + 人类仲裁员共同完成，AI 负责客观证据预分析，人类做最终投票；
- 典型验证要素：链上交易/合约状态、时间节点、第三方快照、文本/图片/视频证据、签名证明等；
- 费用通常受：誓言复杂度、持续时长、证据采集难度、仲裁可能性、链上交互次数影响；
- 在准备不足时，应先列出缺失信息并给出最小补充清单。

格式要求：
- 你必须返回一个 JSON 对象，包含：
  - assistantMessage: string (给用户的自然语言回复)
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
    }
- assistantMessage 要使用简洁清晰的中文。
- oathPlan 字段必须与给定类型严格匹配。

工作流建议：
1) 初始消息：判断是否可验证；列出需澄清的关键信息；给出建议分类与验证思路。
2) 用户补充后：更新结构化方案，并在 readyForCostEstimation = true 时输出费用估算区间与依据。
3) 始终保证 oathPlan 可被前端直接解析与展示。`

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

  const [apiKey, setApiKey] = useState("")
  const [baseURL, setBaseURL] = useState("")
  const [model, setModel] = useState("gpt-4o-mini")
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT)

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isSending, setIsSending] = useState(false)

  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    try {
      const storedApiKey = localStorage.getItem(LS_KEYS.apiKey) || ""
      const storedBaseURL = localStorage.getItem(LS_KEYS.baseURL) || ""
      const storedModel = localStorage.getItem(LS_KEYS.model) || "gpt-4o-mini"
      const storedSystemPrompt = localStorage.getItem(LS_KEYS.systemPrompt) || DEFAULT_SYSTEM_PROMPT
      const draft = localStorage.getItem(LS_KEYS.draft)
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

  function saveDraft() {
    try {
      localStorage.setItem(LS_KEYS.draft, JSON.stringify({ messages }))
      toast({ description: "已保存到本地草稿" })
    } catch {
      toast({ description: "保存失败：浏览器存储不可用" })
    }
  }

  function applyToForm(analysis: OathStructuredAnalysis) {
    const cat = mapCategoryToEnum(analysis.recommendedCategory)
    let mid = 0
    if (analysis.costEstimation) {
      const a = analysis.costEstimation
      const usdt = typeof a.usdtMin === "number" && typeof a.usdtMax === "number" ? (a.usdtMin + a.usdtMax) / 2 : 0
      const oath = typeof a.oathMin === "number" && typeof a.oathMax === "number" ? (a.oathMin + a.oathMax) / 2 : 0
      mid = Math.round((usdt || oath || 0))
    }
    const amount = mid > 0 ? mid : 100
    window.dispatchEvent(new CustomEvent("oath.applyFromAI", { detail: { category: cat, usdt: amount, oath: amount } }))
    toast({ description: "已将建议金额与类别应用到左侧表单（1:1）" })
  }

  async function send() {
    if (!input.trim()) return
    if (!apiKey || !baseURL) {
      alert("请先在设置中配置 baseURL 与 API Key")
      return
    }

    const userMessage: ChatMessage = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsSending(true)

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }))

      const res = await fetch("/api/ai/oath-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseURL,
          apiKey,
          model,
          systemPrompt,
          history,
          userMessage: userMessage.content,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        const msg = data?.error || `HTTP ${res.status}`
        const hint = data?.hint || data?.detail || ""
        const assistantChat: ChatMessage = {
          role: "assistant",
          content: `调用模型失败：${msg}${hint ? `\n建议：${hint}` : ""}`,
          analysis: null,
        }
        setMessages((prev) => [...prev, assistantChat])
        toast({ description: msg })
        return
      }

      const assistantChat: ChatMessage = {
        role: "assistant",
        content: data.assistantMessage ?? "",
        analysis: data.oathPlan ?? null,
      }

      setMessages((prev) => [...prev, assistantChat])
    } catch (err) {
      const assistantChat: ChatMessage = {
        role: "assistant",
        content: "对不起，AI 服务暂时不可用，请检查网络与设置，稍后再试。",
        analysis: null,
      }
      setMessages((prev) => [...prev, assistantChat])
      // eslint-disable-next-line no-console
      console.error("OathAssistantChat error:", err)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="default">誓言 AI 助手</Button>
        </SheetTrigger>
        <SheetContent className="flex flex-col w-full sm:max-w-xl p-0">
          <SheetHeader className="px-4 pt-4 pb-2">
            <SheetTitle className="flex items-center justify-between">
              <span>誓言 AI 助手</span>
              <div className="flex items-center gap-2">
                <Dialog open={settingsOpen} onOpenChange={(o) => setSettingsOpen(o)}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="secondary">设置</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>模型与系统提示词设置</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 pb-2">
                      <div>
                        <label className="text-sm text-slate-600">系统提示词</label>
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
                        <label className="text-sm text-slate-600">模型</label>
                        <Input value={model} onChange={(e) => setModel(e.target.value)} placeholder="gpt-4o-mini" />
                      </div>
                      <div className="flex justify-end gap-2 sticky bottom-0 bg-white pt-2">
                        <Button variant="secondary" onClick={() => {
                          setSystemPrompt(DEFAULT_SYSTEM_PROMPT)
                        }}>重置默认</Button>
                        <Button onClick={() => { persistSettings(); setSettingsOpen(false) }}>保存</Button>
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
                            <Button size="sm" onClick={() => applyToForm(m.analysis!)}>应用到左侧表单</Button>
                            <Button size="sm" variant="secondary" onClick={saveDraft}>保存对话草稿</Button>
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
              <Input
                placeholder="请输入你的誓言或补充信息..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    if (!isSending) void send()
                  }
                }}
              />
              <Button onClick={() => void send()} disabled={isSending}>{isSending ? "发送中..." : "发送"}</Button>
            </div>
            <div className="text-xs text-slate-500">
              使用自定义 baseURL / API Key / 模型。配置保存在浏览器本地，仅用于演示。
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
} 
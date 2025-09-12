"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { AlertCircle, Shield, Clock, DollarSign, Sparkles } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { OathCategory } from "@/lib/types"

interface OathFormData {
  title: string
  description: string
  category: OathCategory | ""
  collateralAmount: number
  swearAmount: number
  duration: number
  tags: string[]
  deadlineType: "relative" | "absolute" | "permanent"
  deadlineDate: string
  reviewIntervalUnit: "hours" | "days" | "weeks" | "months"
  reviewIntervalValue: number
}

export function OathForm() {
  const [formData, setFormData] = useState<OathFormData>({
    title: "",
    description: "",
    category: "",
    collateralAmount: 100,
    swearAmount: 100,
    duration: 30,
    tags: [],
    deadlineType: "relative",
    deadlineDate: "",
    reviewIntervalUnit: "days",
    reviewIntervalValue: 7,
  })

  const [tagInput, setTagInput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [relativeUnit, setRelativeUnit] = useState<"days" | "weeks" | "months" | "years">("days")

  const categoryOptions = [
    { value: OathCategory.PROJECT_COMMITMENT, label: "Project Commitment", description: "Web3 project maintenance & updates" },
    { value: OathCategory.DELIVERY_SERVICE, label: "Delivery / Service", description: "Food delivery, service provision, etc." },
    { value: OathCategory.BUSINESS_AGREEMENT, label: "Business Agreement", description: "B2B collaboration, commercial agreements" },
    { value: OathCategory.PERSONAL_GOAL, label: "Personal Goal", description: "Personal growth, learning goals" },
    { value: OathCategory.COMMUNITY_SERVICE, label: "Community Service", description: "Community contribution, public good" },
    { value: OathCategory.OTHER, label: "Other", description: "Other commitments" },
  ]

  // Listen to AI assistant "apply to form" event
  useEffect(() => {
    function onApply(e: any) {
      const detail = e?.detail || {}
      setFormData((prev) => ({
        ...prev,
        category: (detail.category as OathCategory) || prev.category,
        collateralAmount: typeof detail.usdt === "number" ? detail.usdt : prev.collateralAmount,
        swearAmount: typeof detail.oath === "number" ? detail.oath : prev.swearAmount,
        // timeline fields
        deadlineType: (detail.deadlineType as any) || prev.deadlineType,
        duration: typeof detail.duration === "number" ? detail.duration : prev.duration,
        deadlineDate: typeof detail.deadlineDate === "string" ? detail.deadlineDate : prev.deadlineDate,
        reviewIntervalUnit: (detail.reviewIntervalUnit as any) || prev.reviewIntervalUnit,
        reviewIntervalValue: typeof detail.reviewIntervalValue === "number" ? detail.reviewIntervalValue : prev.reviewIntervalValue,
      }))
      if (typeof detail.title === "string" || typeof detail.description === "string" || Array.isArray(detail.tags)) {
        setFormData((prev) => ({
          ...prev,
          title: typeof detail.title === "string" && detail.title ? detail.title : prev.title,
          description: typeof detail.description === "string" && detail.description ? detail.description : prev.description,
          tags: Array.isArray(detail.tags) && detail.tags.length > 0 ? Array.from(new Set([...(prev.tags || []), ...detail.tags])) : prev.tags,
        }))
      }
      if (typeof detail.duration === "number") {
        // keep UI unit based on reasonable scale
        if (detail.duration % 365 === 0 && detail.duration / 365 <= 5) setRelativeUnit("years")
        else if (detail.duration % 30 === 0 && detail.duration / 30 <= 24) setRelativeUnit("months")
        else if (detail.duration % 7 === 0 && detail.duration / 7 <= 52) setRelativeUnit("weeks")
        else setRelativeUnit("days")
      }
    }
    window.addEventListener("oath.applyFromAI", onApply as any)
    return () => window.removeEventListener("oath.applyFromAI", onApply as any)
  }, [])

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }))
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // TODO: call smart contract to create oath
      console.log("Creating oath:", formData)

      // simulate API
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // 重置表单
      setFormData({
        title: "",
        description: "",
        category: "",
        collateralAmount: 100,
        swearAmount: 100,
        duration: 30,
        tags: [],
        deadlineType: "relative",
        deadlineDate: "",
      })

      alert("Oath created! Awaiting AI classification and initial verification...")
    } catch (error) {
      console.error("Error creating oath:", error)
      alert("Creation failed, please retry")
    } finally {
      setIsSubmitting(false)
    }
  }

  // 1:1 ratio: keep synchronized
  const syncCollateral = (value: number) => {
    setFormData((prev) => ({ ...prev, collateralAmount: value, swearAmount: value }))
  }

  // Helper to map UI unit to duration(days)
  const uiValueToDays = (value: number, unit: "days" | "weeks" | "months" | "years") => {
    if (unit === "weeks") return value * 7
    if (unit === "months") return value * 30
    if (unit === "years") return value * 365
    return value
  }

  const daysToUi = (days: number) => {
    if (days % 365 === 0) return { value: days / 365, unit: "years" as const }
    if (days % 30 === 0) return { value: days / 30, unit: "months" as const }
    if (days % 7 === 0) return { value: days / 7, unit: "weeks" as const }
    return { value: days, unit: "days" as const }
  }

  const totalCollateral = formData.collateralAmount + formData.swearAmount
  const isFormValid = formData.title && formData.description && formData.category

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="oath-shadow">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <span>Create New Oath</span>
          </CardTitle>
          <CardDescription>Create a credible commitment with over-collateralization and mint a credit SBT when completed.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 基本信息 */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Describe your commitment concisely"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Detailed Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Explain what to achieve, timelines, and verification approach"
                  rows={4}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value as OathCategory }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-sm text-slate-500">{option.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 抵押设置 */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <Label className="text-base font-semibold">Collateral Settings</Label>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="collateral">Stablecoin (USDT) collateral with OATH 1:1</Label>
                  <div className="mt-2">
                    <Input
                      id="collateral"
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step={1}
                      value={formData.collateralAmount}
                      onChange={(e) => {
                        const v = Number(e.target.value || 0)
                        syncCollateral(Number.isFinite(v) ? v : 0)
                      }}
                      className="mb-1"
                    />
                    <div className="text-xs text-slate-500">Any amount is allowed. OATH collateral mirrors 1:1.</div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="oath">OATH token collateral (auto-synced)</Label>
                  <div className="mt-2">
                    <Input
                      id="oath"
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step={1}
                      value={formData.swearAmount}
                      onChange={(e) => {
                        const v = Number(e.target.value || 0)
                        syncCollateral(Number.isFinite(v) ? v : 0)
                      }}
                      className="mb-1"
                    />
                    <div className="text-xs text-slate-500">Mirrored 1:1 with USDT collateral.</div>
                  </div>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Total collateral value: <strong>${totalCollateral}</strong> (over-collateralization improves credibility)
                </AlertDescription>
              </Alert>
            </div>

            {/* 时间设置 */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Clock className="h-5 w-5 text-blue-600" />
                <Label className="text-base font-semibold">Deadline</Label>
              </div>
              <div className="space-y-3">
                <div className="grid md:grid-cols-3 gap-3">
                  <button
                    type="button"
                    className={`border rounded-md px-3 py-2 text-sm ${formData.deadlineType === "relative" ? "border-blue-600 text-blue-700" : "border-slate-200"}`}
                    onClick={() => setFormData((p) => ({ ...p, deadlineType: "relative" }))}
                  >Relative days</button>
                  <button
                    type="button"
                    className={`border rounded-md px-3 py-2 text-sm ${formData.deadlineType === "absolute" ? "border-blue-600 text-blue-700" : "border-slate-200"}`}
                    onClick={() => setFormData((p) => ({ ...p, deadlineType: "absolute" }))}
                  >Exact date/time</button>
                  <button
                    type="button"
                    className={`border rounded-md px-3 py-2 text-sm ${formData.deadlineType === "permanent" ? "border-blue-600 text-blue-700" : "border-slate-200"}`}
                    onClick={() => setFormData((p) => ({ ...p, deadlineType: "permanent" }))}
                  >Permanent</button>
                </div>

                {formData.deadlineType === "relative" ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
                      <Slider
                        value={[daysToUi(formData.duration).value]}
                        onValueChange={([value]) => setFormData((prev) => ({ ...prev, duration: uiValueToDays(value, relativeUnit) }))}
                        max={relativeUnit === "days" ? 365 : relativeUnit === "weeks" ? 52 : relativeUnit === "months" ? 24 : 5}
                        min={1}
                        step={1}
                        className="mb-2"
                      />
                      <select
                        className="border rounded px-2 py-1 text-sm"
                        value={relativeUnit}
                        onChange={(e) => {
                          const unit = e.target.value as typeof relativeUnit
                          setRelativeUnit(unit)
                        }}
                        aria-label="Relative time unit"
                      >
                        <option value="days">days</option>
                        <option value="weeks">weeks</option>
                        <option value="months">months</option>
                        <option value="years">years</option>
                      </select>
                    </div>
                    <div className="flex justify-between text-sm text-slate-500">
                      <span>1 {relativeUnit}</span>
                      <span className="font-medium">{daysToUi(formData.duration).value} {relativeUnit}</span>
                      <span>
                        {relativeUnit === "days" ? 365 : relativeUnit === "weeks" ? 52 : relativeUnit === "months" ? 24 : 5} {relativeUnit}
                      </span>
                    </div>
                  </div>
                ) : null}

                {formData.deadlineType === "absolute" ? (
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <Label>Exact date & time</Label>
                      <Input
                        type="datetime-local"
                        value={formData.deadlineDate}
                        onChange={(e) => setFormData((p) => ({ ...p, deadlineDate: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                ) : null}

                {formData.deadlineType === "permanent" ? (
                  <div className="text-sm text-slate-600">This oath has no fixed deadline. The creator may submit completion at any time with evidence.</div>
                ) : null}
              </div>
            </div>

            {/* 标签 */}
            <div>
              <Label htmlFor="tags">Tags (for discovery)</Label>
              <div className="flex space-x-2 mt-1">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                />
                <Button type="button" variant="outline" onClick={addTag}>Add</Button>
              </div>
              {/* Monitoring review interval */}
              <div className="grid md:grid-cols-2 gap-3 mt-4">
                <div>
                  <Label>Review interval</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="number"
                      min={1}
                      value={formData.reviewIntervalValue}
                      onChange={(e) => setFormData((p) => ({ ...p, reviewIntervalValue: Number(e.target.value || 1) }))}
                      className="w-28"
                    />
                    <select
                      className="border rounded px-2 py-1 text-sm"
                      value={formData.reviewIntervalUnit}
                      onChange={(e) => setFormData((p) => ({ ...p, reviewIntervalUnit: e.target.value as any }))}
                      aria-label="Review interval unit"
                    >
                      <option value="hours">hours</option>
                      <option value="days">days</option>
                      <option value="weeks">weeks</option>
                      <option value="months">months</option>
                    </select>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Arbitrators/AI will automatically review at this interval.</div>
                </div>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* 提交按钮 */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className="w-full oath-gradient text-white hover:opacity-90"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-5 w-5" />
                    Create Oath
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

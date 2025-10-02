"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { ArbitratorCaseCard } from "@/components/arbitrator-case-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Gavel, Users, Clock, DollarSign, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react"
import { type ArbitrationCase, ArbitrationStatus, ArbitrationPriority, OathStatus, OathCategory } from "@/lib/types"
import Link from "next/link"

// Mock arbitrator data
const mockArbitratorStats = {
  totalCases: 45,
  activeCases: 8,
  completedCases: 37,
  successRate: 94,
  averageTime: 18, // hours
  reputation: 4.8,
  totalEarnings: 2450,
}

// Mock case data
const mockCases: ArbitrationCase[] = [
  {
    id: "case-001",
    oathId: "oath-001",
    oath: {
      id: "oath-001",
      title: "Maintain DeFi Project for 2 Years - No Rug Pull",
      description: "We commit to continuously maintain and update our DeFi protocol for the next 2 years without abandoning the project or performing a rug pull.",
      category: OathCategory.PROJECT_COMMITMENT,
      creator: "DeFi Protocol Team",
      creatorAddress: "0x1234567890123456789012345678901234567890",
      collateralAmount: 50000,
      swearAmount: 25000,
      duration: 730,
      status: OathStatus.DISPUTED,
      createdAt: new Date("2024-01-15"),
      expiresAt: new Date("2026-01-15"),
      tags: ["DeFi", "long-term commitment", "project maintenance"],
    },
    status: ArbitrationStatus.ASSIGNED,
    priority: ArbitrationPriority.HIGH,
    createdAt: new Date("2024-12-10"),
    assignedArbitrators: ["0xarbitrator1", "0xarbitrator2"],
    requiredArbitrators: 3,
    evidence: [
      {
        id: "evidence-1",
        type: "text",
        content: "The project team has not updated the codebase for 3 months",
        submittedBy: "0xreporter1",
        submittedAt: new Date("2024-12-09"),
        verified: false,
      },
    ],
    disputeReason: "Project team has not updated code for a long time, suspected to have abandoned project maintenance",
    reportedBy: "0xreporter1",
    decisions: [],
    rewardPool: 500,
  },
  {
    id: "case-002",
    oathId: "oath-002",
    oath: {
      id: "oath-002",
      title: "Complete Smart Contract Security Audit",
      description: "Committed to completing a comprehensive security audit of client smart contracts within 15 days, providing detailed vulnerability reports and remediation suggestions.",
      category: OathCategory.BUSINESS_PROMISE,
      creator: "Security Audit Company",
      creatorAddress: "0x3456789012345678901234567890123456789012",
      collateralAmount: 5000,
      swearAmount: 2500,
      duration: 15,
      status: OathStatus.DISPUTED,
      createdAt: new Date("2024-12-10"),
      expiresAt: new Date("2024-12-25"),
      tags: ["security audit", "smart contract", "professional service"],
    },
    status: ArbitrationStatus.IN_REVIEW,
    priority: ArbitrationPriority.MEDIUM,
    createdAt: new Date("2024-12-12"),
    assignedArbitrators: ["0xarbitrator1", "0xarbitrator3"],
    requiredArbitrators: 2,
    evidence: [
      {
        id: "evidence-2",
        type: "text",
        content: "Audit report has been submitted, but quality does not meet industry standards",
        submittedBy: "0xclient1",
        submittedAt: new Date("2024-12-11"),
        verified: false,
      },
    ],
    aiVerification: {
      status: "disputed",
      confidence: 65,
      reasoning: "The submitted audit report has quality issues, recommend detailed human arbitration review",
      evidenceAnalysis: {
        textEvidence: "Client feedback indicates audit quality is substandard, requires professional arbitrator assessment",
        overallScore: 45,
      },
      recommendations: ["Request professional security audit arbitrator review", "Evaluate quality against industry standards"],
    },
    disputeReason: "Audit report quality does not meet expectations, with multiple omissions",
    reportedBy: "0xclient1",
    decisions: [
      {
        id: "decision-1",
        caseId: "case-002",
        arbitratorAddress: "0xarbitrator1",
        decision: "partial",
        reasoning: "Audit report is basically complete but quality needs improvement",
        evidenceWeight: 70,
        compensationAmount: 1000,
        submittedAt: new Date("2024-12-12"),
        confidence: 75,
      },
    ],
    rewardPool: 200,
  },
]

export default function ArbitratePage() {
  const [cases, setCases] = useState<ArbitrationCase[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 模拟API调用
    setTimeout(() => {
      setCases(mockCases)
      setLoading(false)
    }, 1000)
  }, [])

  const activeCases = cases.filter(
    (c) => c.status === ArbitrationStatus.ASSIGNED || c.status === ArbitrationStatus.IN_REVIEW,
  )
  const pendingCases = cases.filter((c) => c.status === ArbitrationStatus.PENDING)
  const votingCases = cases.filter((c) => c.status === ArbitrationStatus.VOTING)

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading arbitrator dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-slate-900 mb-2">Arbitrator Dashboard</h1>
            <p className="text-slate-600">Fair arbitration, maintaining platform trust</p>
          </div>
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <Badge className="bg-green-100 text-green-800">Reputation: {mockArbitratorStats.reputation}/5.0</Badge>
            <Button asChild variant="outline">
              <Link href="/arbitrate/cases">View All Cases</Link>
            </Button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="oath-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Gavel className="h-8 w-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-slate-900">{mockArbitratorStats.activeCases}</div>
                  <div className="text-sm text-slate-500">Active Cases</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="oath-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-slate-900">{mockArbitratorStats.completedCases}</div>
                  <div className="text-sm text-slate-500">Completed</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="oath-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-8 w-8 text-amber-600" />
                <div>
                  <div className="text-2xl font-bold text-slate-900">{mockArbitratorStats.successRate}%</div>
                  <div className="text-sm text-slate-500">Success Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="oath-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-slate-900">${mockArbitratorStats.totalEarnings}</div>
                  <div className="text-sm text-slate-500">Total Earnings</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 仲裁员状态 */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="oath-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span>Arbitrator Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Reputation Score</span>
                  <span className="font-medium">{mockArbitratorStats.reputation}/5.0</span>
                </div>
                <Progress value={mockArbitratorStats.reputation * 20} className="h-2" />
              </div>
              <div className="text-sm text-slate-600">
                <p>Total Cases: {mockArbitratorStats.totalCases}</p>
                <p>Average Processing Time: {mockArbitratorStats.averageTime} hours</p>
              </div>
            </CardContent>
          </Card>

          <Card className="oath-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <span>Pending Cases</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Assigned to Me</span>
                  <Badge variant="outline">{activeCases.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Awaiting Assignment</span>
                  <Badge variant="outline">{pendingCases.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Voting Phase</span>
                  <Badge variant="outline">{votingCases.length}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="oath-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span>Urgent Cases</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <div className="text-2xl font-bold text-red-600">
                  {cases.filter((c) => c.priority === ArbitrationPriority.URGENT).length}
                </div>
                <div className="text-sm text-slate-500">Require Immediate Attention</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 活跃案例 */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-serif text-2xl font-bold text-slate-900">My Active Cases</h2>
            <Button asChild variant="outline">
              <Link href="/arbitrate/cases">View All</Link>
            </Button>
          </div>

          {activeCases.length === 0 ? (
            <Card className="oath-shadow">
              <CardContent className="text-center py-12">
                <Gavel className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No Active Cases</h3>
                <p className="text-slate-500 mb-4">Currently no cases assigned to you</p>
                <Button asChild variant="outline">
                  <Link href="/arbitrate/cases">Browse Pending Cases</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {activeCases.slice(0, 4).map((case_) => (
                <ArbitratorCaseCard key={case_.id} case={case_} />
              ))}
            </div>
          )}
        </div>

        {/* 快速操作 */}
        <Card className="oath-shadow">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common arbitrator functions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Button asChild variant="outline" className="h-auto p-4 bg-transparent">
                <Link href="/arbitrate/cases?status=pending">
                  <div className="text-center">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <div className="font-medium">Accept New Cases</div>
                    <div className="text-sm text-slate-500">View pending assignments</div>
                  </div>
                </Link>
              </Button>

              <Button asChild variant="outline" className="h-auto p-4 bg-transparent">
                <Link href="/arbitrate/cases?priority=urgent">
                  <div className="text-center">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-600" />
                    <div className="font-medium">Urgent Cases</div>
                    <div className="text-sm text-slate-500">Handle high priority cases</div>
                  </div>
                </Link>
              </Button>

              <Button asChild variant="outline" className="h-auto p-4 bg-transparent">
                <Link href="/arbitrate/history">
                  <div className="text-center">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <div className="font-medium">Arbitration History</div>
                    <div className="text-sm text-slate-500">View historical records</div>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

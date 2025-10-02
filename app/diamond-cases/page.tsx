'use client'

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Filter, Sparkles } from "lucide-react"
import { DiamondCaseCard, DiamondCase } from "@/components/diamond-case-card"

// Create case data for Oath Wall
const diamondCases: DiamondCase[] = [
  // Oath platform case - using the_best_big_diamond.glb
  {
    id: "oath-platform",
    title: "Oath Platform - The Builder of On-Chain Credit",
    description: "Oath platform builds a decentralized credit system through blockchain technology, allowing people to establish trust through oath-making. The platform supports over-collateralization mechanism and displays trust through credit diamond SBTs, achieving a native on-chain credit system.",
    modelPath: "/resouce/diamond/the_best_big_diamond.glb",
    creditValue: 50000,
    category: "Platform Project",
    tags: ["blockchain", "credit system", "decentralized", "oath", "trust"],
    backgroundColor: "#081730",
    lightColor: "#4d7cfe",
    rotationSpeed: 0.005,
    createdAt: new Date("2023-10-01"),
    endorseCount: 1258
  },
  
  // PumpFun Meme Token Creator Oath
  {
    id: "pumpfun-meme-creator",
    title: "PumpFun Meme Creator - No Dump Before Graduation",
    description: "I solemnly swear not to sell any of my meme token allocation before it graduates from PumpFun. This commitment ensures fair price discovery and prevents rug pulls, building trust with early supporters and community members.",
    modelPath: "/resouce/diamond/brilliand_diamond.glb",
    creditValue: 25000,
    category: "DeFi Promise",
    tags: ["PumpFun", "meme token", "no dump", "graduation", "community trust"],
    backgroundColor: "#1a0b2e",
    lightColor: "#9333ea",
    rotationSpeed: 0.01,
    createdAt: new Date("2024-12-15"),
    endorseCount: 892
  },
  
  // Morpho Fund Manager APY Guarantee
  {
    id: "morpho-fund-manager",
    title: "Morpho Fund Manager - 12% Monthly APY Guarantee",
    description: "As a certified fund manager on Morpho protocol, I commit to maintaining a minimum 12% APY for all depositors this month. My strategy involves optimized lending/borrowing across multiple pools with risk management protocols in place.",
    modelPath: "/resouce/diamond/magic_diamond.glb",
    creditValue: 100000,
    category: "DeFi Strategy",
    tags: ["Morpho", "fund management", "APY guarantee", "yield farming", "risk management"],
    backgroundColor: "#001e3c",
    lightColor: "#3b82f6",
    rotationSpeed: 0.015,
    createdAt: new Date("2024-12-20"),
    endorseCount: 234
  },
  
  // Chainlink Oracle Data Provider Reliability Oath
  {
    id: "chainlink-oracle-provider",
    title: "Chainlink Oracle - 99.9% Uptime Commitment",
    description: "As a Chainlink oracle data provider, I pledge to maintain 99.9% uptime and accurate price feeds for the next 6 months. This commitment is crucial for DeFi protocols depending on reliable price data for liquidations and trading.",
    modelPath: "/resouce/diamond/diamond_simple_but_nice2.glb",
    creditValue: 75000,
    category: "Infrastructure",
    tags: ["Chainlink", "oracle", "data reliability", "uptime", "DeFi infrastructure"],
    backgroundColor: "#052e16",
    lightColor: "#22c55e",
    rotationSpeed: 0.02,
    createdAt: new Date("2024-12-18"),
    endorseCount: 456
  },
  
  // Decentralized Notary Service
  {
    id: "decentralized-notary",
    title: "Decentralized Notary Service",
    description: "Providing decentralized notary services through blockchain technology to ensure document authenticity and timestamps. Replacing traditional notary offices with more efficient, transparent services, reducing notarization costs and time.",
    modelPath: "/resouce/diamond/diamond_blue_multi-faceted.glb",
    creditValue: 8000,
    category: "Public Service",
    tags: ["notary", "blockchain", "document verification", "decentralized governance"],
    backgroundColor: "#0c4a6e",
    lightColor: "#0ea5e9",
    rotationSpeed: 0.008,
    createdAt: new Date("2024-05-15"),
    endorseCount: 203
  },
  
  // ID Service Expert
  {
    id: "id-service-expert",
    title: "身份证办理专家",
    description: "提供高效的身份证办理服务，替代传统行政大厅。通过誓言承诺专业、高效的服务，帮助人们更便捷地办理身份证相关业务，节省时间和精力。",
    modelPath: "/resouce/diamond/blue_colored_realistic_diamond_model.glb",
    creditValue: 3500,
    category: "公共服务",
    tags: ["身份证", "政务服务", "高效办理", "去中心化政务"],
    backgroundColor: "#172554",
    lightColor: "#3b82f6",
    rotationSpeed: 0.01,
    createdAt: new Date("2024-06-20"),
    endorseCount: 156
  },
  
  // Decentralized Marriage Registration
  {
    id: "decentralized-marriage",
    title: "Decentralized Marriage Registration",
    description: "Providing blockchain-based marriage registration services to make marriage contracts more transparent and reliable. Recording marriage status through smart contracts, offering more flexible and modern relationship management.",
    modelPath: "/resouce/diamond/rough_diamond_ring.glb",
    creditValue: 7500,
    category: "Marriage Service",
    tags: ["marriage", "blockchain", "smart contract", "decentralized"],
    backgroundColor: "#831843",
    lightColor: "#ec4899",
    rotationSpeed: 0.007,
    createdAt: new Date("2024-02-14"),
    endorseCount: 289
  },
  
  // Community Healthcare Service
  {
    id: "community-healthcare",
    title: "Community Healthcare Service",
    description: "Providing community-based primary healthcare services including health consultation, basic diagnosis and medication guidance. Committed through oath to professional medical services, enabling more people to conveniently access basic healthcare assistance.",
    modelPath: "/resouce/diamond/diamond_green.glb",
    creditValue: 6000,
    category: "Healthcare Service",
    tags: ["healthcare", "community service", "health consultation", "basic diagnosis"],
    backgroundColor: "#064e3b",
    lightColor: "#10b981",
    rotationSpeed: 0.009,
    createdAt: new Date("2024-03-10"),
    endorseCount: 178
  },
  
  // Education Tutoring Expert
  {
    id: "education-tutor",
    title: "Education Tutoring Expert",
    description: "Providing high-quality educational tutoring services to help students improve their academic performance and abilities. Committed through oath to professional and patient teaching, establishing excellent educational reputation.",
    modelPath: "/resouce/diamond/diamond_ordinary.glb",
    creditValue: 2800,
    category: "Education Service",
    tags: ["education", "tutoring", "learning improvement", "knowledge transfer"],
    backgroundColor: "#0f172a",
    lightColor: "#6366f1",
    rotationSpeed: 0.012,
    createdAt: new Date("2024-04-05"),
    endorseCount: 92
  },
  
  // Environmental Project Advocate
  {
    id: "environmental-advocate",
    title: "Environmental Project Advocate",
    description: "Initiating and maintaining environmental projects to promote sustainable community development. Committed through oath to long-term investment in environmental causes, organizing community activities, raising environmental awareness, and achieving greener lifestyle.",
    modelPath: "/resouce/diamond/diamond_rock.glb",
    creditValue: 4500,
    category: "Environmental Project",
    tags: ["environment", "sustainability", "community activities", "green living"],
    backgroundColor: "#14532d",
    lightColor: "#22c55e",
    rotationSpeed: 0.006,
    createdAt: new Date("2024-04-22"),
    endorseCount: 134
  },
  
  // Blockchain Development Expert
  {
    id: "blockchain-developer",
    title: "Blockchain Development Expert",
    description: "Providing professional blockchain development services including smart contract programming, DApp development and blockchain integration. Committed through oath to high-quality development delivery, helping projects implement blockchain technology applications.",
    modelPath: "/resouce/diamond/diamond_simple_but_nice.glb",
    creditValue: 9000,
    category: "Tech Service",
    tags: ["blockchain", "development", "smart contract", "DApp"],
    backgroundColor: "#0f172a",
    lightColor: "#8b5cf6",
    rotationSpeed: 0.01,
    createdAt: new Date("2024-01-05"),
    endorseCount: 215
  },
  
  // Community Governance Participant
  {
    id: "community-governance",
    title: "Community Governance Participant",
    description: "Actively participating in DAO community governance, providing constructive opinions and proposals. Committed through oath to fair and objective governance participation, promoting healthy community development and decision transparency.",
    modelPath: "/resouce/diamond/diamond_simple_but_nice2.glb",
    creditValue: 3200,
    category: "Community Governance",
    tags: ["DAO", "governance", "community decisions", "transparency"],
    backgroundColor: "#1e1b4b",
    lightColor: "#818cf8",
    rotationSpeed: 0.011,
    createdAt: new Date("2024-02-28"),
    endorseCount: 87
  },
  
  // Decentralized Legal Consultation
  {
    id: "decentralized-legal",
    title: "Decentralized Legal Consultation",
    description: "Providing basic legal consultation services to help people understand legal knowledge and rights protection. Committed through oath to professional and accurate legal advice, reducing the barriers and costs of legal services.",
    modelPath: "/resouce/diamond/diamond_simple.glb",
    creditValue: 5500,
    category: "Legal Service",
    tags: ["legal", "consultation", "rights protection", "professional advice"],
    backgroundColor: "#1e293b",
    lightColor: "#f59e0b",
    rotationSpeed: 0.009,
    createdAt: new Date("2024-03-15"),
    endorseCount: 143
  },
  
  // Art Creator Credit
  {
    id: "art-creator",
    title: "Art Creator Credit",
    description: "Committed to original artwork creation, ensuring authenticity and uniqueness of works. Pledged through oath not to infringe on others' intellectual property, providing genuine artistic creation and establishing creator reputation.",
    modelPath: "/resouce/diamond/diamond_simple_3.glb",
    creditValue: 2000,
    category: "Art Creation",
    tags: ["art", "original", "creation", "intellectual property"],
    backgroundColor: "#422006",
    lightColor: "#f59e0b",
    rotationSpeed: 0.014,
    createdAt: new Date("2024-05-01"),
    endorseCount: 76
  },
  
  // Decentralized Real Estate Trading
  {
    id: "decentralized-realestate",
    title: "Decentralized Real Estate Trading",
    description: "Providing blockchain-based real estate trading services to ensure transaction security and transparency. Committed through oath to authentic and reliable property information and trading processes, reducing risks and costs of real estate transactions.",
    modelPath: "/resouce/diamond/5_diamond_combination.glb",
    creditValue: 12000,
    category: "Real Estate Service",
    tags: ["real estate", "blockchain", "trading", "transparency"],
    backgroundColor: "#0f172a",
    lightColor: "#06b6d4",
    rotationSpeed: 0.008,
    createdAt: new Date("2024-01-10"),
    endorseCount: 267
  },
  
  // Community Food Safety Supervision
  {
    id: "food-safety",
    title: "Community Food Safety Supervision",
    description: "Providing community food safety supervision services to ensure food quality and safety. Committed through oath to fair and strict food safety inspections, protecting community residents' health and safety.",
    modelPath: "/resouce/diamond/4_combination_white_diamond.glb",
    creditValue: 4200,
    category: "Safety Service",
    tags: ["food safety", "community supervision", "health protection", "quality inspection"],
    backgroundColor: "#0f766e",
    lightColor: "#14b8a6",
    rotationSpeed: 0.01,
    createdAt: new Date("2024-04-15"),
    endorseCount: 128
  }
];

export default function DiamondCasesPage() {
  const [cases, setCases] = useState<DiamondCase[]>([])
  const [filteredCases, setFilteredCases] = useState<DiamondCase[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("credit_high")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 模拟API调用
    setTimeout(() => {
      setCases(diamondCases)
      setFilteredCases(diamondCases)
      setLoading(false)
    }, 1000)
  }, [])

  useEffect(() => {
    let filtered = cases

    // 搜索过滤
    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // 类别过滤
    if (categoryFilter !== "all") {
      filtered = filtered.filter((c) => c.category === categoryFilter)
    }

    // 排序
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        break
      case "oldest":
        filtered.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        break
      case "credit_high":
        filtered.sort((a, b) => b.creditValue - a.creditValue)
        break
      case "credit_low":
        filtered.sort((a, b) => a.creditValue - b.creditValue)
        break
      case "endorsements":
        filtered.sort((a, b) => (b.endorseCount || 0) - (a.endorseCount || 0))
        break
    }

    setFilteredCases(filtered)
  }, [cases, searchTerm, categoryFilter, sortBy])

  // 获取所有不重复的类别
  const categories = Array.from(new Set(cases.map(c => c.category)))

  // 处理背书
  const handleEndorse = (caseId: string) => {
    console.log(`为案例 ${caseId} 进行背书`)
    // 这里应该有实际的背书逻辑
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading oath wall...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen oath-wall-texture">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* 页面标题和介绍 */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl font-bold text-slate-900 mb-4">Oath Wall</h1>
          <p className="text-xl text-slate-600 mb-6 max-w-3xl mx-auto">
            Explore diverse credit diamond cases in decentralized society, discover how people build trust through oaths and achieve more efficient, transparent collaboration.
          </p>
        </div>

        {/* 搜索和过滤 */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search case name, description or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="credit_high">Credit Value: High to Low</SelectItem>
              <SelectItem value="credit_low">Credit Value: Low to High</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="endorsements">Most Endorsed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 活跃过滤器显示 */}
        {(searchTerm || categoryFilter !== "all") && (
          <div className="flex flex-wrap gap-2 mb-6">
            {searchTerm && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => setSearchTerm("")}>
                Search: {searchTerm} ×
              </Badge>
            )}
            {categoryFilter !== "all" && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => setCategoryFilter("all")}>
                Category: {categoryFilter} ×
              </Badge>
            )}
          </div>
        )}

        {/* 案例网格 */}
        {filteredCases.length === 0 ? (
          <div className="text-center py-12">
            <Filter className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No matching cases found</h3>
            <p className="text-slate-500 mb-4">Try adjusting search criteria</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setCategoryFilter("all")
              }}
            >
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCases.map((diamondCase) => (
              <DiamondCaseCard 
                key={diamondCase.id} 
                diamondCase={diamondCase} 
                onEndorse={handleEndorse}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { CreditDisplay } from "@/components/credit-display"
import { CreditHistory } from "@/components/credit-history"
import { NFTCard } from "@/components/nft-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Settings, ExternalLink, Copy, Check } from "lucide-react"
import type { OathNFT } from "@/lib/types"
import Link from "next/link"

// Mock user data
const mockUser = {
  address: "0x1234567890123456789012345678901234567890",
  creditScore: 2450,
  completedOaths: 12,
  totalStaked: 45000,
  nftCount: 3,
  joinedAt: new Date("2024-01-15"),
  rank: "Expert",
  nextLevelScore: 5000,
}

// Mock credit history data
const mockCreditHistory = [
  {
    id: "1",
    type: "gain" as const,
    amount: 500,
    reason: "Successfully completed oath",
    oathTitle: "DeFi Project Maintenance Commitment",
    timestamp: new Date("2024-12-01"),
    details: "Completed project maintenance on time, received positive user feedback",
  },
  {
    id: "2",
    type: "bonus" as const,
    amount: 100,
    reason: "Consecutive completion bonus",
    timestamp: new Date("2024-11-28"),
    details: "Completed 5 consecutive oaths, received additional reward",
  },
  {
    id: "3",
    type: "gain" as const,
    amount: 200,
    reason: "Service delivery completed",
    oathTitle: "Food Delivery Service",
    timestamp: new Date("2024-11-25"),
    details: "Completed delivery tasks on time, 100% customer satisfaction",
  },
  {
    id: "4",
    type: "loss" as const,
    amount: -50,
    reason: "Minor delay penalty",
    oathTitle: "Smart Contract Audit",
    timestamp: new Date("2024-11-20"),
    details: "Audit report submission slightly delayed",
  },
]

// Using previously defined mock NFT data
const mockNFTs: OathNFT[] = [
  {
    tokenId: "1001",
    oathId: "oath-001",
    creditValue: 15000,
    mintedAt: new Date("2024-01-20"),
    metadata: {
      title: "DeFi Project Maintenance Master",
      description: "Successfully maintained DeFi project for 2 years, demonstrating excellent project management skills and technical expertise",
      image: "/nft/defi-master.png",
      attributes: [
        { trait_type: "Type", value: "Project Commitment" },
        { trait_type: "Duration", value: "730 days" },
        { trait_type: "Collateral Amount", value: "$75,000" },
        { trait_type: "Rarity", value: "Legendary" },
      ],
    },
  },
  {
    tokenId: "1002",
    oathId: "oath-002",
    creditValue: 2500,
    mintedAt: new Date("2024-12-01"),
    metadata: {
      title: "Security Audit Expert",
      description: "High-quality completion of smart contract security audit, ensuring project security",
      image: "/nft/audit-expert.png",
      attributes: [
        { trait_type: "Type", value: "Business Commitment" },
        { trait_type: "Duration", value: "15 days" },
        { trait_type: "Collateral Amount", value: "$7,500" },
        { trait_type: "Rarity", value: "Rare" },
      ],
    },
  },
]

export default function ProfilePage() {
  const [user, setUser] = useState(mockUser)
  const [nfts, setNfts] = useState<OathNFT[]>([])
  const [creditHistory, setCreditHistory] = useState(mockCreditHistory)
  const [loading, setLoading] = useState(true)
  const [addressCopied, setAddressCopied] = useState(false)

  useEffect(() => {
    // 模拟API调用
    setTimeout(() => {
      setNfts(mockNFTs)
      setLoading(false)
    }, 1000)
  }, [])

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(user.address)
      setAddressCopied(true)
      setTimeout(() => setAddressCopied(false), 2000)
    } catch (err) {
      console.error("Copy failed:", err)
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading profile...</p>
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
            <h1 className="font-serif text-3xl font-bold text-slate-900 mb-2">Profile</h1>
            <p className="text-slate-600">Manage your credit records and NFT collection</p>
          </div>
          <Button variant="outline" className="mt-4 md:mt-0 bg-transparent">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>

        {/* 用户基本信息 */}
        <Card className="oath-shadow mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-6 w-6 text-blue-600" />
              <span>Basic Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-slate-500">Wallet Address</p>
                  <div className="flex items-center space-x-2">
                    <code className="text-sm font-mono bg-slate-100 px-2 py-1 rounded">
                      {user.address.slice(0, 10)}...{user.address.slice(-8)}
                    </code>
                    <Button variant="ghost" size="sm" onClick={copyAddress}>
                      {addressCopied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Joined</p>
                  <p className="font-medium">{formatDate(user.joinedAt)}</p>
                </div>
              </div>
              <div className="mt-4 md:mt-0">
                <Badge className="bg-blue-100 text-blue-800">Level: {user.rank}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* 左侧：信用展示 */}
          <div className="lg:col-span-1">
            <CreditDisplay
              creditScore={user.creditScore}
              completedOaths={user.completedOaths}
              totalStaked={user.totalStaked}
              nftCount={user.nftCount}
              rank={user.rank}
              nextLevelScore={user.nextLevelScore}
            />
          </div>

          {/* 右侧：NFT和历史 */}
          <div className="lg:col-span-2 space-y-8">
            {/* 最新NFT */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-serif text-2xl font-bold text-slate-900">Latest NFTs</h2>
                <Button asChild variant="outline">
                  <Link href="/gallery">View All</Link>
                </Button>
              </div>

              {nfts.length === 0 ? (
                <Card className="oath-shadow">
                  <CardContent className="text-center py-12">
                    <User className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No NFTs Yet</h3>
                    <p className="text-slate-500 mb-4">Complete your first oath to earn an NFT</p>
                    <Button asChild>
                      <Link href="/oaths/create">Create Oath</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {nfts.slice(0, 2).map((nft) => (
                    <NFTCard key={nft.tokenId} nft={nft} />
                  ))}
                </div>
              )}
            </div>

            {/* 信用历史 */}
            <CreditHistory entries={creditHistory} />
          </div>
        </div>
      </div>
    </div>
  )
}

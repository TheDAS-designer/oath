"use client"

import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { OathNFT } from "@/lib/types"

export function NFTCard({ nft }: { nft: OathNFT }) {
  const title = nft.metadata?.title || `NFT #${nft.tokenId}`
  const img = nft.metadata?.image || "/placeholder.svg"
  const desc = nft.metadata?.description || ""

  return (
    <Card className="oath-shadow h-full">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="relative w-full aspect-[16/10] overflow-hidden rounded-md bg-slate-100">
          <Image src={img} alt={title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
        </div>
        {desc ? <p className="text-sm text-slate-600 line-clamp-2">{desc}</p> : null}
        {Array.isArray(nft.metadata?.attributes) ? (
          <ul className="grid grid-cols-2 gap-2 text-xs text-slate-600">
            {nft.metadata!.attributes!.slice(0, 4).map((a, i) => (
              <li key={i} className="bg-slate-50 rounded px-2 py-1">
                <span className="text-slate-500">{a.trait_type}：</span>
                <span>{String(a.value)}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </CardContent>
    </Card>
  )
} 
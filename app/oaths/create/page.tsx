import { Navigation } from "@/components/navigation"
import { OathForm } from "@/components/oath-form"
import { OathAssistantChat } from "@/components/oath-chat"

export default function CreateOathPage() {
  return (
    <div className="min-h-screen">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-bold text-slate-900 mb-2">Create a New Oath</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Create a credible commitment with over-collateralization. Our AI will help classify and pre‑verify your oath. Upon completion you will mint a non‑transferable credit SBT.
          </p>
        </div>

        <OathForm />
      </div>

      <OathAssistantChat />
    </div>
  )
}

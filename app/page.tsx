import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Gavel, Trophy, Users, Lock, CheckCircle, ArrowRight } from "lucide-react"

export default function HomePage() {
  const features = [
    {
      icon: Shield,
      title: "Over-collateralized Oaths",
      description: "Create oaths by staking stablecoins and OATH tokens to ensure commitment credibility",
      color: "text-blue-600",
    },
    {
      icon: Gavel,
      title: "AI-Powered Arbitration",
      description: "Combine AI and human arbitration for fair and efficient oath completion verification",
      color: "text-amber-600",
    },
    {
      icon: Trophy,
      title: "Credit SBT Accumulation",
      description: "Earn SBT certificates for completed oaths, build on-chain credit history, reduce future costs",
      color: "text-green-600",
    },
    {
      icon: Users,
      title: "Community Oversight",
      description: "Decentralized reporting and monitoring mechanisms ensure platform fairness and transparency",
      color: "text-purple-600",
    },
  ]

  const stats = [
    { label: "Total Oaths", value: "0", icon: Shield },
    { label: "Success Rate", value: "0%", icon: CheckCircle },
    { label: "Total Collateral", value: "$0", icon: Lock },
    { label: "Active Users", value: "0", icon: Users },
  ]

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-900 to-amber-600 bg-clip-text text-transparent">
              Building Trust Infrastructure
              <br />
              for Decentralized Society
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              Build credit through oaths, making commitments verifiable, quantifiable, and reusable.
              <br />
              Establish genuine trust mechanisms on blockchain, reduce transaction friction, promote integrity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-blue-900 to-teal-700 text-white hover:opacity-90 shadow-xl">
                Create Oath Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-blue-200 text-blue-900 hover:bg-blue-50 bg-transparent shadow-lg"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <Card key={index} className="text-center shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="pt-6">
                    <Icon className="h-8 w-8 mx-auto mb-3 text-blue-600" />
                    <div className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</div>
                    <div className="text-sm text-slate-500">{stat.label}</div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold mb-4 text-slate-900">Core Platform Features</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Build a trusted decentralized credit system through innovative blockchain technology and smart contracts
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card
                  key={index}
                  className="shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-slate-100">
                        <Icon className={`h-6 w-6 ${feature.color}`} />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-slate-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold mb-4 text-slate-900">Use Cases</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              From Web3 projects to daily life, Oath platform applies to various scenarios requiring trust
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Badge className="w-fit mb-2 bg-blue-100 text-blue-800">Web3 Projects</Badge>
                <CardTitle>Project Commitments</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Project teams stake collateral to commit to maintenance periods, earn user trust, and receive credit SBTs upon completion
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Badge className="w-fit mb-2 bg-green-100 text-green-800">Life Services</Badge>
                <CardTitle>Food Delivery</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Delivery workers stake small amounts to commit to timely delivery, verified through multi-sig, building delivery credit
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Badge className="w-fit mb-2 bg-purple-100 text-purple-800">Business Cooperation</Badge>
                <CardTitle>Business Commitments</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Inter-enterprise cooperation commitments, ensure fulfillment through smart contracts and arbitration, build business credit
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-900 to-teal-700 text-white">
        <div className="container mx-auto text-center">
          <h2 className="font-serif text-4xl font-bold mb-6">Start Building Your On-Chain Credit</h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Join the Oath platform, build a trusted digital identity through commitments and fulfillment, gain more opportunities and trust in the decentralized world.
          </p>
          <Button size="lg" variant="secondary" className="bg-white text-blue-900 hover:bg-blue-50 shadow-xl">
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-slate-900 text-white">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-900 to-teal-700">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="font-serif text-xl font-bold">Oath</span>
            </div>
            <div className="text-slate-400 text-sm">© 2025 Oath Platform. Building trust infrastructure for decentralized society.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}

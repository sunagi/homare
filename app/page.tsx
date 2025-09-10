"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import {
  TrendingUp,
  Shield,
  Eye,
  Award,
  Coins,
  Zap,
  Target,
  Trophy,
  Users,
  GitBranch,
  Twitter,
  ArrowUpDown,
  Link2,
  Gamepad2,
  Sparkles,
} from "lucide-react"

export default function HomarePlatform() {
  const [showOnChain, setShowOnChain] = useState(true)

  const campaignTasks = [
    {
      id: 1,
      name: "UniSwap V3 Trading",
      category: "Swap",
      reward: "50 USDC",
      participants: "2,847",
      difficulty: "Easy",
      verified: true,
      description: "Complete 3 swaps on Uniswap V3",
      icon: <ArrowUpDown className="w-6 h-6" />,
      advertiser: "Uniswap Labs",
      timeLeft: "5 days",
    },
    {
      id: 2,
      name: "Cross-Chain Bridge",
      category: "Bridge",
      reward: "75 USDC",
      participants: "1,234",
      difficulty: "Medium",
      verified: true,
      description: "Bridge assets between Ethereum and Polygon",
      icon: <GitBranch className="w-6 h-6" />,
      advertiser: "Polygon Bridge",
      timeLeft: "12 days",
    },
    {
      id: 3,
      name: "Follow & Retweet",
      category: "Social",
      reward: "25 USDC",
      participants: "5,692",
      difficulty: "Easy",
      verified: true,
      description: "Follow @protocol and retweet announcement",
      icon: <Twitter className="w-6 h-6" />,
      advertiser: "DeFi Protocol",
      timeLeft: "3 days",
    },
    {
      id: 4,
      name: "Liquidity Provision",
      category: "DeFi",
      reward: "150 USDC",
      participants: "892",
      difficulty: "Hard",
      verified: true,
      description: "Provide liquidity to ETH/USDC pool",
      icon: <Coins className="w-6 h-6" />,
      advertiser: "Curve Finance",
      timeLeft: "8 days",
    },
  ]

  const userStats = {
    totalEarnings: "2,847 USDC",
    currentRank: 42,
    referralEarnings: "1,234 USDC",
    completedTasks: 23,
    verificationLevel: "Gold Hunter",
    directReferrals: 12,
    indirectReferrals: 38,
  }

  const referralTree = [
    { level: 1, count: 12, earnings: "456 USDC" },
    { level: 2, count: 28, earnings: "234 USDC" },
    { level: 3, count: 10, earnings: "89 USDC" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center glow-primary">
                <span className="text-2xl font-bold text-primary-foreground">誉</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold gradient-text">Homare</h1>
                <p className="text-sm text-muted-foreground">Web3 Affiliate Platform on ØG Chain</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="bg-primary text-primary-foreground border-primary/30 glow-primary">
                <Zap className="w-3 h-3 mr-1" />
                ØG Verified
              </Badge>
              <Badge variant="outline" className="border-accent/30 text-accent">
                <Trophy className="w-3 h-3 mr-1" />
                Gold Hunter
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="campaigns" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-card border border-border">
            <TabsTrigger
              value="campaigns"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Target className="w-4 h-4 mr-2" />
              Campaigns
            </TabsTrigger>
            <TabsTrigger
              value="dashboard"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Award className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger
              value="referrals"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Users className="w-4 h-4 mr-2" />
              Referrals
            </TabsTrigger>
            <TabsTrigger
              value="transparency"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Shield className="w-4 h-4 mr-2" />
              Transparency
            </TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-4xl font-bold gradient-text">Campaign Tasks</h2>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  className="border-primary/30 hover:bg-primary/10 hover:glow-primary bg-transparent"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Sort by Reward
                </Button>
                <Button className="glow-primary">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create Referral Link
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {campaignTasks.map((task) => (
                <Card
                  key={task.id}
                  className="hover:shadow-2xl hover:glow-primary transition-all duration-300 bg-card border-border/50 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/20 to-transparent rounded-bl-full" />
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">{task.icon}</div>
                        <div>
                          <CardTitle className="text-lg text-card-foreground">{task.name}</CardTitle>
                          <CardDescription className="text-muted-foreground">{task.advertiser}</CardDescription>
                        </div>
                      </div>
                      {task.verified && <Shield className="w-5 h-5 text-accent glow-accent" />}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{task.description}</p>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-primary">{task.reward}</p>
                        <p className="text-sm text-muted-foreground">Instant Payout</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-accent">{task.participants}</p>
                        <p className="text-sm text-muted-foreground">Participants</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge
                        variant={
                          task.difficulty === "Easy"
                            ? "secondary"
                            : task.difficulty === "Medium"
                              ? "outline"
                              : "destructive"
                        }
                        className="text-xs"
                      >
                        {task.difficulty}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{task.timeLeft} left</span>
                    </div>

                    <Button className="w-full glow-primary" variant="default">
                      <Gamepad2 className="w-4 h-4 mr-2" />
                      Start Task
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-6">
            <h2 className="text-4xl font-bold gradient-text">Hunter Dashboard</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-card border-border/50 hover:glow-primary transition-all duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Earnings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{userStats.totalEarnings}</div>
                  <p className="text-xs text-muted-foreground mt-1">+12% this week</p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border/50 hover:glow-accent transition-all duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Hunter Rank</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent">#{userStats.currentRank}</div>
                  <p className="text-xs text-muted-foreground mt-1">↑ 5 positions</p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border/50 hover:glow-primary transition-all duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Referral Earnings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-card-foreground">{userStats.referralEarnings}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    From {userStats.directReferrals + userStats.indirectReferrals} referrals
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border/50 hover:glow-accent transition-all duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Completed Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-card-foreground">{userStats.completedTasks}</div>
                  <p className="text-xs text-muted-foreground mt-1">92% success rate</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-accent" />
                  <span className="text-card-foreground">ØG Chain Verification System</span>
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  AI-powered fraud detection and instant USDC payouts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-card-foreground">Hunter Level</span>
                  <Badge variant="secondary" className="bg-accent/20 text-accent border-accent/30">
                    {userStats.verificationLevel}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sybil Resistance Score</span>
                    <span className="text-card-foreground">96/100</span>
                  </div>
                  <Progress value={96} className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Task Completion Rate</span>
                    <span className="text-card-foreground">92/100</span>
                  </div>
                  <Progress value={92} className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Referral Quality</span>
                    <span className="text-card-foreground">88/100</span>
                  </div>
                  <Progress value={88} className="bg-muted" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="referrals" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-4xl font-bold gradient-text">Referral Network</h2>
              <Button className="glow-primary">
                <Link2 className="w-4 h-4 mr-2" />
                Generate Referral Link
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {referralTree.map((level) => (
                <Card
                  key={level.level}
                  className="bg-card border-border/50 hover:glow-primary transition-all duration-300"
                >
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-primary" />
                      <span>Level {level.level} Referrals</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">{level.count}</div>
                      <p className="text-sm text-muted-foreground">Active Referrals</p>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-semibold text-accent">{level.earnings}</div>
                      <p className="text-sm text-muted-foreground">Total Earnings</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <GitBranch className="w-5 h-5 text-accent" />
                  <span>Referral Tree Visualization</span>
                </CardTitle>
                <CardDescription>Multi-level referral structure with automatic revenue distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-8">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto glow-primary">
                      <span className="text-primary-foreground font-bold">YOU</span>
                    </div>
                    <div className="flex items-center justify-center space-x-8">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto">
                          <span className="text-accent font-bold">L1</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">12 refs</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto">
                          <span className="text-accent font-bold">L2</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">28 refs</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto">
                          <span className="text-accent font-bold">L3</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">10 refs</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transparency" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-4xl font-bold gradient-text">ØG Chain Transparency</h2>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-muted-foreground">Off-chain</span>
                <Switch checked={showOnChain} onCheckedChange={setShowOnChain} />
                <span className="text-sm text-muted-foreground">On-chain</span>
              </div>
            </div>

            <Card className="bg-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="w-5 h-5 text-primary" />
                  Data Verification
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {showOnChain ? "On-chain data verification" : "Off-chain data verification"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-card-foreground">Reward Data</h4>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Verified Transactions</span>
                        <span className="text-accent">✓ 23</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Unverified Transactions</span>
                        <span className="text-muted-foreground">0</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-card-foreground">Evaluation Data</h4>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">0G Verified</span>
                        <span className="text-accent">✓ 100%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Updated</span>
                        <span className="text-card-foreground">2 minutes ago</span>
                      </div>
                    </div>
                  </div>
                </div>

                {showOnChain && (
                  <div className="mt-6 p-4 bg-muted/10 rounded-lg border border-primary/20 glow-primary">
                    <h4 className="font-semibold mb-2 flex items-center text-card-foreground">
                      <Coins className="w-4 h-4 mr-2 text-accent" />
                      ØG Chain Verification
                    </h4>
                    <div className="text-sm space-y-1 font-mono text-muted-foreground">
                      <div>Block Height: 3,247,891</div>
                      <div>Transaction Hash: 0x9f2a7b3c...</div>
                      <div>Gas Used: 18,500</div>
                      <div>Confirmation: 15/15</div>
                      <div>Payout Status: Instant ✓</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Data Integrity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Reward Calculation</span>
                      <Badge variant="secondary" className="bg-accent/20 text-accent border-accent/30">
                        ✓ Match
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Ranking</span>
                      <Badge variant="secondary" className="bg-accent/20 text-accent border-accent/30">
                        ✓ Match
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Contribution Score</span>
                      <Badge variant="secondary" className="bg-accent/20 text-accent border-accent/30">
                        ✓ Match
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Audit Log</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Latest Audit</span>
                      <span className="text-card-foreground">1 hour ago</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Audit Result</span>
                      <span className="text-accent">Passed</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Next Audit</span>
                      <span className="text-card-foreground">23 hours</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

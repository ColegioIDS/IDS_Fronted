// src/components/grades/StatsCard.tsx
import { Card, CardContent } from "@/components/ui/card"
import StatCard from "./StatCard"
import AcademicInfo from "./AcademicInfo"

interface Stat {
    title: string
    value: string
    description: string
    icon: React.ComponentType<{ className?: string }>
    gradient: string
    bgGradient: string
    textColor: string
    iconColor: string
}

interface StatsCardProps {
    stats: Stat[]
}

export default function StatsCard({ stats }: StatsCardProps) {
    return (
        <div className="w-full max-w-4xl mx-auto">
            <Card className="bg-white/80 backdrop-blur-md border-0 shadow-2xl shadow-purple-100/50 rounded-2xl overflow-hidden">
                <CardContent className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {stats.map((stat, index) => (
                            <StatCard key={index} stat={stat} />
                        ))}
                    </div>
                    
                    <AcademicInfo />
                </CardContent>
            </Card>
        </div>
    )
}
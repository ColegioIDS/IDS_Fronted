// src/components/grades/StatCard.tsx
import { GraduationCap, Users, BookOpen } from 'lucide-react'

interface StatCardProps {
    stat: {
        title: string
        value: string
        description: string
        icon: React.ComponentType<{ className?: string }>
        gradient: string
        bgGradient: string
        textColor: string
        iconColor: string
    }
}

export default function StatCard({ stat }: StatCardProps) {
    const Icon = stat.icon
    
    return (
        <div
            className={`group relative p-6 bg-gradient-to-br ${stat.bgGradient} rounded-2xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden`}
        >
            <div className={`absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br ${stat.gradient} rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 bg-gradient-to-br ${stat.gradient} rounded-xl shadow-lg`}>
                        <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className={`w-2 h-2 ${stat.iconColor} rounded-full animate-pulse`} />
                </div>

                <h4 className={`font-bold text-lg ${stat.textColor} mb-2`}>
                    {stat.title}
                </h4>

                <div className="mb-3">
                    <p className={`text-4xl font-black ${stat.textColor} leading-none`}>
                        {stat.value}
                    </p>
                </div>

                <p className={`text-sm ${stat.iconColor} font-medium`}>
                    {stat.description}
                </p>
            </div>

            <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
        </div>
    )
}
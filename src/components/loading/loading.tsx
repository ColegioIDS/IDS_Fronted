//src\components\loading\loading.tsx
import { cn } from "@/lib/utils"

interface LoadingProps {
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "spinner" | "dots" | "pulse" | "bars"
  text?: string
  overlay?: boolean
  className?: string
}

export default function Loading({ size = "md", variant = "spinner", text, overlay = false, className }: LoadingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  }

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  }

  const LoadingSpinner = () => (
    <div className={cn("animate-spin rounded-full border-2 border-gray-300 border-t-blue-600", sizeClasses[size])} />
  )

  const LoadingDots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            "bg-blue-600 rounded-full animate-bounce",
            size === "sm" ? "w-2 h-2" : size === "md" ? "w-3 h-3" : size === "lg" ? "w-4 h-4" : "w-5 h-5",
          )}
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: "0.6s",
          }}
        />
      ))}
    </div>
  )

  const LoadingPulse = () => <div className={cn("bg-blue-600 rounded-full animate-pulse", sizeClasses[size])} />

  const LoadingBars = () => (
    <div className="flex space-x-1 items-end">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={cn(
            "bg-blue-600 animate-pulse",
            size === "sm" ? "w-1" : size === "md" ? "w-1.5" : size === "lg" ? "w-2" : "w-3",
          )}
          style={{
            height: `${20 + i * 10}px`,
            animationDelay: `${i * 0.1}s`,
            animationDuration: "1s",
          }}
        />
      ))}
    </div>
  )

  const renderLoader = () => {
    switch (variant) {
      case "dots":
        return <LoadingDots />
      case "pulse":
        return <LoadingPulse />
      case "bars":
        return <LoadingBars />
      default:
        return <LoadingSpinner />
    }
  }

  const content = (
    <div className={cn("flex flex-col items-center justify-center space-y-3", className)}>
      {renderLoader()}
      {text && <p className={cn("text-gray-600 font-medium animate-pulse", textSizeClasses[size])}>{text}</p>}
    </div>
  )

  if (overlay) {
    return (
<div className="fixed inset-0 bg-white/10 dark:bg-black/10 backdrop-blur-sm	  flex items-center justify-center z-[90002]">
  {content}
</div>




    )
  }

  return content
}

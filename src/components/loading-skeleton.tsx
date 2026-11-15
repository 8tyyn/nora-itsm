export function LoadingSkeleton({ height = "h-96", className = "" }: { height?: string; className?: string }) {
  return (
    <div className={`w-full ${height} bg-gradient-to-r from-white/50 via-white/30 to-white/50 rounded-2xl animate-pulse ${className}`} />
  )
}

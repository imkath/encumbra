"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import type { Park } from "@/lib/types"

// Dynamically import map to avoid SSR issues
const InteractiveMap = dynamic(() => import("./interactive-map").then((mod) => ({ default: mod.InteractiveMap })), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-muted" />,
})

interface MapViewProps {
  selectedPark: Park | null
  onSelectPark: (park: Park) => void
  userLocation: { latitude: number; longitude: number } | null
}

export function MapView({ selectedPark, onSelectPark, userLocation }: MapViewProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-full w-full bg-muted" />
  }

  return (
    <div className="relative h-full w-full">
      <InteractiveMap selectedPark={selectedPark} onSelectPark={onSelectPark} userLocation={userLocation} />
    </div>
  )
}

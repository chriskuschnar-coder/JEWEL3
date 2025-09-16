import React, { useState, useRef, useCallback } from 'react'
import { RefreshCw } from 'lucide-react'

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: React.ReactNode
  threshold?: number
  disabled?: boolean
}

export function PullToRefresh({ 
  onRefresh, 
  children, 
  threshold = 80,
  disabled = false 
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [canRefresh, setCanRefresh] = useState(false)
  const startY = useRef(0)
  const currentY = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || isRefreshing) return
    
    const container = containerRef.current
    if (!container || container.scrollTop > 5) return // Increased threshold to prevent accidental triggers
    
    startY.current = e.touches[0].clientY
  }, [disabled, isRefreshing])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (disabled || isRefreshing || startY.current === 0) return
    
    const container = containerRef.current
    if (!container || container.scrollTop > 5) return // Increased threshold
    
    currentY.current = e.touches[0].clientY
    const distance = Math.max(0, currentY.current - startY.current)
    
    // Only prevent default and trigger pull-to-refresh if distance is significant
    if (distance > 20) { // Increased minimum distance threshold
      e.preventDefault()
      const pullDistance = Math.min((distance - 20) * 0.4, threshold * 1.2) // Reduced sensitivity
      setPullDistance(pullDistance)
      setCanRefresh(pullDistance >= threshold)
    }
  }, [disabled, isRefreshing, threshold])

  const handleTouchEnd = useCallback(async () => {
    if (disabled || isRefreshing) return
    
    // Only refresh if user clearly intended to refresh (higher threshold)
    if (canRefresh && pullDistance >= threshold && pullDistance > 40) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } catch (error) {
        console.error('Refresh failed:', error)
      } finally {
        setIsRefreshing(false)
      }
    }
    
    setPullDistance(0)
    setCanRefresh(false)
    startY.current = 0
    currentY.current = 0
  }, [disabled, isRefreshing, canRefresh, pullDistance, threshold, onRefresh])

  const refreshProgress = Math.min(pullDistance / threshold, 1)
  const rotation = refreshProgress * 360

  return (
    <div 
      ref={containerRef}
      className="relative overflow-auto h-full"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ 
        transform: `translateY(${pullDistance}px)`,
        transition: pullDistance === 0 ? 'transform 0.3s ease-out' : 'none'
      }}
    >
      {/* Pull to Refresh Indicator */}
      {(pullDistance > 0 || isRefreshing) && (
        <div 
          className="absolute top-0 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center justify-center"
          style={{ 
            transform: `translateX(-50%) translateY(${Math.max(0, pullDistance - 60)}px)`,
            opacity: Math.min(refreshProgress * 2, 1)
          }}
        >
          <div className={`
            w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-200
            ${canRefresh || isRefreshing 
              ? 'bg-primary-600 shadow-lg' 
              : 'bg-neutral-200'
            }
          `}>
            <RefreshCw 
              className={`w-6 h-6 transition-all duration-200 ${
                canRefresh || isRefreshing 
                  ? 'text-white' 
                  : 'text-neutral-500'
              } ${isRefreshing ? 'animate-spin' : ''}`}
              style={{ 
                transform: isRefreshing ? 'none' : `rotate(${rotation}deg)`
              }}
            />
          </div>
          
          <span className={`text-xs font-medium transition-colors duration-200 ${
            canRefresh || isRefreshing 
              ? 'text-primary-600' 
              : 'text-neutral-500'
          }`}>
            {isRefreshing 
              ? 'Refreshing...' 
              : canRefresh 
                ? 'Release to refresh' 
                : 'Pull to refresh'
            }
          </span>
        </div>
      )}
      
      {/* Content */}
      <div className={pullDistance > 0 ? 'pt-16' : ''}>
        {children}
      </div>
    </div>
  )
}
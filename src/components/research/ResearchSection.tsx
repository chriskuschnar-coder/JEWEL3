import React from 'react'
import { motion } from 'framer-motion'
import { RefreshCw } from 'lucide-react'
import { Button } from '../ui/button'

interface ResearchSectionProps {
  title: string
  subtitle?: string
  icon: React.ReactNode
  children: React.ReactNode
  onRefresh?: () => void
  loading?: boolean
  updateCount?: number
  className?: string
}

export function ResearchSection({
  title,
  subtitle,
  icon,
  children,
  onRefresh,
  loading = false,
  updateCount,
  className = ''
}: ResearchSectionProps) {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className={`space-y-6 ${className}`}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center space-x-3"
        >
          <div className="w-10 h-10 bg-white/10 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/20 shadow-lg">
            {icon}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-white/70 text-lg">
                {subtitle}
              </p>
            )}
          </div>
        </motion.div>
        
        {onRefresh && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="flex items-center space-x-3"
          >
            {updateCount && (
              <div className="text-sm text-white/60">
                Update #{updateCount}
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
              className="text-white/70 hover:text-white hover:bg-white/10 backdrop-blur-sm"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </motion.div>
        )}
      </div>
      
      {/* Section Content */}
      <motion.div
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
              delayChildren: 0.1
            }
          }
        }}
      >
        {children}
      </motion.div>
    </motion.section>
  )
}
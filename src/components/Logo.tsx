import React from 'react'

interface LogoProps {
  size?: 'xs' | 'small' | 'medium' | 'large' | 'xl'
  className?: string
  showText?: boolean
  variant?: 'default' | 'white' | 'dark'
}

export function Logo({ 
  size = 'medium', 
  className = '', 
  showText = false,
  variant = 'default' 
}: LogoProps) {
  const [imageError, setImageError] = React.useState(false)

  const sizeClasses = {
    xs: 'h-5',
    small: 'h-6',
    medium: 'h-8', 
    large: 'h-10',
    xl: 'h-12'
  }

  const handleImageError = () => {
    console.warn('Logo image failed to load at /logo.png, showing fallback')
    setImageError(true)
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {!imageError ? (
        <img
          src="/logo.png"
          alt="GMC Logo"
          className={`${sizeClasses[size]} w-auto select-none object-contain transition-opacity duration-200`}
          loading="eager"
          onError={handleImageError}
          onLoad={() => console.log('✅ Logo loaded successfully from /logo.png')}
        />
      ) : (
        <div 
          className={`${sizeClasses[size]} bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-xs aspect-square shadow-lg`}
        >
          GMC
        </div>
      )}
      
      {showText && (
        <span className="font-serif text-xl font-bold text-navy-900 dark:text-white">
          GMC
        </span>
      )}
    </div>
  )
}
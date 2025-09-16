import * as React from "react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white text-gray-600 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        
        {/* Slogan */}
        <div className="text-xl md:text-2xl font-semibold text-gray-700 mb-8 text-center">
          Empowering Smarter Trades Through AI & Data-Driven Insights
        </div>

        {/* Divider */}
        <div className="border-t border-gray-300 w-full mb-8"></div>

        {/* Footer Content */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Copyright */}
          <div className="text-sm text-gray-500 mb-6 md:mb-0">
            © {currentYear} Global Markets Consulting. All rights reserved.
          </div>
          
          {/* Navigation Links */}
          <nav className="flex flex-wrap justify-center md:justify-end gap-6 md:gap-8 text-sm">
            <a 
              href="/terms" 
              className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              Terms of Use
            </a>
            <a 
              href="/privacy" 
              className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              Privacy Policy
            </a>
            <a 
              href="/notices" 
              className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              Notices
            </a>
            <a 
              href="/disclosures" 
              className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              Disclosures
            </a>
            <a 
              href="/contact" 
              className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              Contact
            </a>
          </nav>
        </div>
      </div>
    </footer>
  )
}
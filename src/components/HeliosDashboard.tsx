import React from 'react';
import { Zap, ExternalLink, Activity, BarChart3, TrendingUp, DollarSign, Target, RefreshCw, Maximize2, Minimize2 } from 'lucide-react';
import TickerTape from './TickerTape';
import { HeliosTradingTerminal } from './trading/HeliosTradingTerminal';
import { useState } from 'react';
import { Logo } from './Logo';

const HeliosDashboard: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showExternalLink, setShowExternalLink] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0e1a] p-3 md:p-4 max-w-7xl mx-auto">
      {/* Integrated Trading Terminal */}
      <div className="bg-[#161b26] rounded-2xl border border-gray-700/30 shadow-lg">
        {/* Terminal Header */}
        <div className="p-4 md:p-6 border-b border-gray-700/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 md:w-10 md:h-10">
                <Logo size="medium" />
              </div>
              <div>
                <h1 className="text-lg md:text-2xl font-bold text-white">Helios Terminal</h1>
                <div className="flex items-center space-x-2 md:space-x-4 text-xs md:text-sm text-gray-300">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>Live MT5 Connection</span>
                  </div>
                  <span className="hidden md:inline">•</span>
                  <span className="hidden md:inline">Real-time Data</span>
                  <span className="hidden md:inline">•</span>
                  <span className="hidden md:inline">Automated Terminal</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1.5 md:p-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors"
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4 md:w-5 md:h-5 text-white" />
                ) : (
                  <Maximize2 className="w-4 h-4 md:w-5 md:h-5 text-white" />
                )}
              </button>
              
              <button
                onClick={() => setShowExternalLink(!showExternalLink)}
                className="p-1.5 md:p-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors"
                title="Open in New Tab"
              >
                <ExternalLink className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </button>
            </div>
          </div>
          
          {showExternalLink && (
            <div className="mt-3 md:mt-4 p-3 md:p-4 bg-blue-600/10 border border-blue-500/30 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-sm md:text-base text-blue-300">Open Helios in separate tab for advanced features</span>
                <button
                  onClick={() => window.open('https://helios.luminarygrow.com/', '_blank')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Open External Terminal
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Embedded Terminal */}
        <div className={`p-4 md:p-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-[#161b26]' : ''}`}>
          <HeliosTradingTerminal isFullscreen={isFullscreen} />
        </div>
      </div>
    </div>
  );
};

export default HeliosDashboard;
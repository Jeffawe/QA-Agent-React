import React, { useState, useEffect } from 'react';

const LandingPage: React.FC = () => {
  const [titleVisible, setTitleVisible] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    const titleTimer = setTimeout(() => {
      setTitleVisible(true);
    }, 500);

    const contentTimer = setTimeout(() => {
      setContentVisible(true);
    }, 1200);

    return () => {
      clearTimeout(titleTimer);
      clearTimeout(contentTimer);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 flex items-center justify-center px-6">
      <div className="text-center max-w-4xl mx-auto">
        {/* Animated Title */}
        <h1
          className={`text-6xl md:text-8xl font-bold text-white mb-8 transition-all duration-1000 ease-out ${titleVisible
              ? 'opacity-100 transform translate-y-0'
              : 'opacity-0 transform translate-y-8'
            }`}
          style={{
            textShadow: '0 4px 20px rgba(0,0,0,0.3)',
            background: 'linear-gradient(135deg, #ffffff 0%, #e3f2fd 50%, #bbdefb 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          QA Agent
        </h1>

        {/* Animated Content */}
        <div
          className={`transition-all duration-1000 ease-out delay-300 ${contentVisible
              ? 'opacity-100 transform translate-y-0'
              : 'opacity-0 transform translate-y-8'
            }`}
        >
          <p className="text-xl md:text-2xl text-blue-100 mb-6 leading-relaxed">
            AI-powered website analysis that detects bugs and delivers actionable insights.
          </p>

          <p className="text-lg text-blue-200 opacity-90 leading-relaxed">
            Built using Puppeteer and Node.js, this agent helps developers improve their site's
            quality through automation.
          </p>

          <p className="text-lg text-blue-200 opacity-90 leading-relaxed">
            Click <a href="/help" className="text-teal-300 hover:underline">here</a> for Help to start using the agent.
          </p>
        </div>

        {/* Floating Animation Dots */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white opacity-30 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
          <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-blue-200 opacity-40 rounded-full animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
          <div className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-white opacity-20 rounded-full animate-bounce" style={{ animationDelay: '2s', animationDuration: '5s' }}></div>
          <div className="absolute bottom-1/4 right-1/3 w-1.5 h-1.5 bg-blue-100 opacity-30 rounded-full animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '3.5s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
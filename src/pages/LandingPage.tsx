import React, { useState, useEffect } from 'react';
import { ArrowRight, Zap, Code, BarChart3, CheckCircle } from 'lucide-react';
import problemStatementImage from '../assets/qa-agent-image.png';
import beforeImage from '../assets/before.png';
import afterImage from '../assets/after.png';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const [titleVisible, setTitleVisible] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const titleTimer = setTimeout(() => setTitleVisible(true), 500);
    const contentTimer = setTimeout(() => setContentVisible(true), 1200);
    return () => {
      clearTimeout(titleTimer);
      clearTimeout(contentTimer);
    };
  }, []);

  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Visual Testing",
      description: "Automatically test UI elements, buttons, and visual components without manual interaction"
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: "API Validation",
      description: "Test endpoints and validate API responses"
    },
    {
      icon: <CheckCircle className="w-8 h-8" />,
      title: "No Scripts Required",
      description: "Define goals and let AI handle the testing logic automatically"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Instant Reports",
      description: "Get comprehensive insights in real-time with AI-generated reports"
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Input",
      description: "Pass your website URL, testing goal, and api key (or use the free key) to the agent"
    },
    {
      number: "02",
      title: "Processing",
      description: "AI navigates your site, interacts with elements, and calls your APIs"
    },
    {
      number: "03",
      title: "Analysis",
      description: "Detects visual bugs, broken links, slow responses, and regressions"
    },
    {
      number: "04",
      title: "Report",
      description: "Receive detailed results in real-time, including logs and insights"
    }
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 flex items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white opacity-30 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
          <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-blue-200 opacity-40 rounded-full animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
          <div className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-white opacity-20 rounded-full animate-bounce" style={{ animationDelay: '2s', animationDuration: '5s' }}></div>
          <div className="absolute bottom-1/4 right-1/3 w-1.5 h-1.5 bg-blue-100 opacity-30 rounded-full animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '3.5s' }}></div>
        </div>

        <div className="text-center max-w-4xl mx-auto relative z-10">
          <h1
            className={`text-6xl md:text-8xl font-bold text-white mb-8 transition-all duration-500 ease-out ${titleVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'
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

          <div
            className={`transition-all duration-500 ease-out delay-100 ${contentVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'
              }`}
          >
            <p className="text-2xl md:text-3xl text-blue-100 mb-8 font-semibold">
              Automated Visual & API Testing Without Writing Test Scripts
            </p>
            <button className="bg-teal-400 hover:bg-teal-500 text-blue-900 font-bold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-2 mx-auto mb-4"
              onClick={() => navigate("/updates")}>
              Start Testing
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Problem Statement Section */}
      <section className="py-20 md:py-32 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">The Problem</h2>
              <p className="text-lg text-gray-700 mb-4 leading-relaxed">
                Manual QA testing is repetitive, time-consuming, and error-prone. Writing test scripts for every UI change wastes developer resources and slows down your release cycle.
              </p>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                You need faster feedback on your website's visual health and API stability, without the overhead of maintaining complex test suites.
              </p>
              <button className="bg-teal-400 hover:bg-teal-500 text-blue-900 font-bold py-3 px-6 rounded-lg transition-all duration-200"
                onClick={() => navigate('/updates')}>
                Automate Your Testing
              </button>
            </div>
            <div className="rounded-lg h-80 flex items-center justify-center">
              <img src={problemStatementImage} alt="Problem Statement" className="max-w-full max-h-full" />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-32 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">How It Works</h2>
          <p className="text-lg text-gray-600 text-center mb-16 max-w-2xl mx-auto">
            Here's how we automate testing for your site
          </p>

          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-blue-50 rounded-lg p-8 h-full border border-blue-100">
                  <div className="text-5xl font-bold text-teal-400 mb-4">{step.number}</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-700 leading-relaxed">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-8 h-8 text-teal-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20 md:py-32 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">Key Features</h2>
          <p className="text-lg text-gray-600 text-center mb-16 max-w-2xl mx-auto">
            Powerful capabilities built for modern development teams
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-lg p-8 border border-gray-200 hover:border-teal-300 hover:shadow-lg transition-all duration-200">
                <div className="text-teal-400 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-700 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Example Section */}
      <section className="py-20 md:py-32 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-16 text-center">See It In Action</h2>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">What You Pass In</h3>
              <div className="bg-gray-900 rounded-lg p-6 font-mono text-sm text-gray-100 overflow-auto">
                <img src={beforeImage} alt="Example Code" className="max-w-full max-h-full" />
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">What You Get</h3>
              <div className="bg-gray-900 rounded-lg p-6 font-mono text-sm text-gray-100 overflow-auto">
                <img src={afterImage} alt="Example Code" className="max-w-full max-h-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 px-6 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">Ready to Automate Your Testing?</h2>
          <p className="text-xl text-blue-100 mb-10">
            Start testing your website and APIs without writing a single test script.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-teal-400 hover:bg-teal-500 text-blue-900 font-bold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105"
              onClick={() => navigate('/updates')}>
              Get Started Now
            </button>
            <button className="bg-white hover:bg-gray-100 text-blue-900 font-bold py-4 px-8 rounded-lg transition-all duration-200"
              onClick={() => navigate('/docs')}>
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Video Section
      <section className="py-20 md:py-32 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">See the Agent in Action</h2>
          <p className="text-lg text-gray-600 text-center mb-12">
            Watch a quick demo of how QA Agent works
          </p>

          <div className="aspect-video bg-gray-300 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-0 h-0 border-l-12 border-r-0 border-t-8 border-b-8 border-l-red-500 border-t-transparent border-b-transparent ml-1"></div>
              </div>
              <p className="text-gray-600 text-lg">YouTube Video Will Go Here</p>
              <p className="text-gray-500 text-sm mt-2">Replace with your YouTube embed</p>
            </div>
          </div>
        </div>
      </section> */}

      {/* Footer CTA */}
      <section className="py-12 px-6 bg-gray-50 border-t border-gray-200">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-700 mb-6">
            Questions? Check out our <a href="/docs" className="text-teal-400 hover:underline">documentation</a> or <a href="/docs/feedback" className="text-teal-400 hover:underline">contact us</a>
          </p>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
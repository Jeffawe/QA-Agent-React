import React from 'react';
import { Link } from 'react-router-dom';
import BetaWarning from '../../BetaWarning';

const betaMessage: string = `QA Agent Testing Program is currently accepting new beta testers. Join our community of early adopters and help shape the future of automated QA testing.`;

const TestingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold mb-8 text-gray-800">Join Our Beta Testing Program</h2>

        <BetaWarning message={betaMessage} />

        {/* Hero Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-200">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Become a QA Agent Beta Tester</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Join our exclusive beta testing program and get early access to QA Agent with a shared Gemini API key. 
                Help us identify edge cases, validate functionality, and improve the overall user experience before our public launch.
              </p>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  <span>Free access to beta features</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  <span>Shared Gemini API key included</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  <span>Direct feedback channel</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  <span>Priority support</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* What We're Looking For */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">What We're Testing</h3>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold text-gray-800 mb-1">User Acceptance Testing (UAT)</h4>
              <p className="text-gray-600 text-sm">Validate that QA Agent meets real-world testing requirements and user expectations.</p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <h4 className="font-semibold text-gray-800 mb-1">Regression Testing</h4>
              <p className="text-gray-600 text-sm">Ensure new features don't break existing functionality across different website types.</p>
            </div>
            <div className="border-l-4 border-orange-500 pl-4">
              <h4 className="font-semibold text-gray-800 mb-1">Exploratory Testing</h4>
              <p className="text-gray-600 text-sm">Discover edge cases and unexpected behaviors through creative testing scenarios.</p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold text-gray-800 mb-1">Performance Testing</h4>
              <p className="text-gray-600 text-sm">Evaluate crawling speed, memory usage, and overall system performance under various loads.</p>
            </div>
          </div>
        </div>

        {/* How to Join */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">How to Join the Beta Program</h3>
          
          <div className="space-y-6">
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Option 1: Fill Out Our Beta Application Form
              </h4>
              <p className="text-blue-700 mb-4">
                Complete our beta tester application to help us understand your testing background and use cases.
              </p>
              <a 
                href="https://forms.gle/hVQZCrochGCFnEd28" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Apply for Beta Access
              </a>
            </div>

            <div className="bg-green-50 rounded-lg p-6 border border-green-200">
              <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Option 2: Connect on LinkedIn
              </h4>
              <p className="text-green-700 mb-4">
                Reach out to me directly on LinkedIn for personalized onboarding and immediate access to the beta program.
              </p>
              <a 
                href="https://www.linkedin.com/in/jeffery-ozoekweawagu" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                Connect on LinkedIn
              </a>
            </div>
          </div>
        </div>

        {/* What Happens Next */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">What Happens After You Apply</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">1</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Application Review</h4>
                <p className="text-gray-600 text-sm">We'll review your application within 48 hours and send you a confirmation email.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">2</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Access Credentials</h4>
                <p className="text-gray-600 text-sm">You'll receive your shared Gemini API key and detailed testing instructions.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">3</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Start Testing</h4>
                <p className="text-gray-600 text-sm">Begin your testing journey with our comprehensive onboarding guide and test cases.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">4</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Provide Feedback</h4>
                <p className="text-gray-600 text-sm">Share your findings, suggestions, and bug reports through our dedicated feedback channels.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">Ready to Shape the Future of QA Testing?</h3>
          <p className="mb-6 text-blue-100">
            Join our community of beta testers and help us build the most powerful automated QA tool in the market.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/help" 
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-200"
            >
              Learn More About QA Agent
            </Link>
            <a 
              href="https://forms.gle/hVQZCrochGCFnEd28" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-blue-500 hover:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Apply Now
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestingPage;
import React from 'react'

const GettingStarted: React.FC = () => {
    return (
        <div className="space-y-12">
            <div>
                <h1 className="text-4xl font-bold mb-4 text-gray-800">Getting Started</h1>
                <p className="text-lg text-gray-600">Getting started with QA Agent</p>
            </div>

            {/* Explanation Box */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">How QA Agent Works</h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            QA Agent is a powerful automated testing tool built with TypeScript and Playwright that crawls through your website, 
                            analyzes each page, and identifies potential bugs, UI issues, and accessibility problems. It can also 
                            test complex user flows like customer login sequences, checkout processes, and multi-step forms.
                        </p>
                        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700 mb-6">
                            <div className="flex items-center space-x-2">
                                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                <span>Automated page crawling</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                <span>AI-powered bug detection</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                <span>User flow testing</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                <span>Accessibility analysis</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                <span>Detailed reporting</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                <span>Custom goal setting</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Two Ways to Run */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Two Ways to Run QA Agent</h2>
                
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Web Version */}
                    <div className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800">Web Version</h3>
                        </div>
                        <p className="text-gray-600 mb-4">
                            Use our web interface to quickly run QA Agent. Simply enter your website URL, 
                            set your testing goals, and get instant analysis results.
                        </p>
                        <div className="space-y-2 text-sm text-gray-700 mb-4">
                            <div className="flex items-center space-x-2">
                                <span className="text-green-500">✓</span>
                                <span>No installation required</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-green-500">✓</span>
                                <span>Instant results</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-green-500">✓</span>
                                <span>Easy to use interface</span>
                            </div>
                        </div>
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                            <p className="text-xs text-amber-700">
                                <strong>Note:</strong> Server space is limited and may be full upon request. 
                                Consider the local version for guaranteed availability.
                            </p>
                        </div>
                    </div>

                    {/* Local Version */}
                    <div className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800">NPM Package</h3>
                        </div>
                        <p className="text-gray-600 mb-4">
                            Download and install QA Agent locally on your system via npm. 
                            Perfect for CI/CD integration and unlimited testing.
                        </p>
                        <div className="space-y-2 text-sm text-gray-700 mb-4">
                            <div className="flex items-center space-x-2">
                                <span className="text-green-500">✓</span>
                                <span>Full control and customization</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-green-500">✓</span>
                                <span>No server limitations</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-green-500">✓</span>
                                <span>CI/CD integration ready</span>
                            </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                            <code className="text-sm text-gray-800">npm install qa-agent</code>
                        </div>
                    </div>
                </div>
            </div>

            {/* Flow Testing Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg p-8 border border-blue-100">
                <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">Advanced Flow Testing</h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            QA Agent goes beyond simple page crawling. It can simulate complex user journeys 
                            and test multi-step processes to ensure your entire user experience works flawlessly.
                        </p>
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                            <div className="bg-white rounded-lg p-4 border border-blue-100">
                                <h4 className="font-medium text-gray-800 mb-2">Login Flows</h4>
                                <p className="text-gray-600">Test user authentication, password resets, and account creation processes.</p>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-blue-100">
                                <h4 className="font-medium text-gray-800 mb-2">E-commerce Flows</h4>
                                <p className="text-gray-600">Validate shopping cart, checkout, and payment processing workflows.</p>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-blue-100">
                                <h4 className="font-medium text-gray-800 mb-2">Form Submissions</h4>
                                <p className="text-gray-600">Test complex multi-step forms, validation, and data submission processes.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default GettingStarted
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
                            QA Agent is a powerful automated testing tool that crawls through your website, analyzes each page,
                            and identifies potential bugs, UI issues, and accessibility problems. Simply provide your website URL,
                            set your testing goals, and let the AI do the heavy lifting.
                        </p>
                        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
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
        </div>
    )
}

export default GettingStarted

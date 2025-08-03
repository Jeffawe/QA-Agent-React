import React, { useEffect, useState } from 'react';

const TestingGuide: React.FC = () => {
    const [isLatestFeaturesExpanded, setIsLatestFeaturesExpanded] = useState(false);

    useEffect(() => {
        fetch('https://qa-node-backend.onrender.com/health')
            .then(() => console.log('Backend is waking up...'))
            .catch(err => console.error('Wake-up ping failed:', err));
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="max-w-4xl mx-auto">

                {/* Welcome Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 mb-8 text-center text-white">
                    <h1 className="text-4xl font-bold mb-4">Welcome, Tester! 🎉</h1>
                    <p className="text-xl text-blue-100">
                        Thank you for helping me test QA Agent. I really appreciate it.
                    </p>
                </div>

                {/* Latest Features Bar */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg mb-6 text-white">
                    <button
                        onClick={() => setIsLatestFeaturesExpanded(!isLatestFeaturesExpanded)}
                        className="w-full p-6 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-xl"
                    >
                        <h3 className="text-lg font-semibold mb-3 flex items-center justify-center md:justify-start">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            🆕 Latest Features Added
                            <svg
                                className={`w-5 h-5 ml-2 transform transition-transform duration-200 ${isLatestFeaturesExpanded ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </h3>
                        {!isLatestFeaturesExpanded && (
                            <p className="text-blue-100 text-sm text-center md:text-left">
                                Click to see the newest features available for testing...
                            </p>
                        )}
                    </button>
                    {isLatestFeaturesExpanded && (
                        <div className="px-6 pb-6">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-blue-400 bg-opacity-30 rounded-lg p-4 border border-blue-300">
                                    <h4 className="font-semibold mb-2 flex items-center">
                                        <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
                                        Crawl the Entire Page
                                    </h4>
                                    <p className="text-blue-100 text-sm">
                                        Can Crawl through and provide UI/UX and visual bug analysis for all the pages that make up a website.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Steps to Test */}
                <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-200">
                    <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center">
                        <svg className="w-8 h-8 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Steps to Test
                    </h2>

                    <div className="space-y-8">
                        {/* Step 1 */}
                        <div className="border-l-4 border-blue-500 pl-6">
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-blue-600 font-bold text-lg">1</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Fill in the Testing Registration Form</h3>
                                    <p className="text-gray-600 mb-4">
                                        Start by completing our testing registration form. This helps me understand your testing background
                                        and assign you the appropriate testing credentials.
                                    </p>
                                    <a
                                        href="https://forms.gle/hVQZCrochGCFnEd28"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 font-medium"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Complete Registration Form
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="border-l-4 border-green-500 pl-6">
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                    <span className="text-green-600 font-bold text-lg">2</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Receive Your Testing Credentials</h3>
                                    <p className="text-gray-600 mb-4">
                                        After you fill the form, I'll add you to the database with all necessary testing details and information.
                                        You'll receive an email or message from me with a unique testing key.
                                    </p>
                                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                        <div className="flex items-center space-x-2 text-green-800">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v-2H7v-2H4a1 1 0 01-1-1v-1a6 6 0 016-6z" />
                                            </svg>
                                            <span className="font-medium">Your testing key allows API calls but is limited on a monthly basis.</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="border-l-4 border-purple-500 pl-6">
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                    <span className="text-purple-600 font-bold text-lg">3</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Start Testing QA Agent</h3>
                                    <p className="text-gray-600 mb-4">
                                        Once you receive your testing key, you can start testing! Go to the help page and run the agent
                                        with your testing credentials.
                                    </p>
                                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-200 mb-4">
                                        <h4 className="font-semibold text-purple-800 mb-2">Testing Configuration:</h4>
                                        <ul className="text-purple-700 space-y-1 text-sm">
                                            <li>• Set test mode to <code className="bg-purple-200 px-2 py-1 rounded">true</code></li>
                                            <li>• Use your unique testing key as the API key</li>
                                        </ul>
                                    </div>
                                    <a
                                        href="/help"
                                        className="inline-flex items-center bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 font-medium"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Go to Help Page
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Step 4 */}
                        <div className="border-l-4 border-orange-500 pl-6">
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                    <span className="text-orange-600 font-bold text-lg">4</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Optional: Use Your Own API Key</h3>
                                    <p className="text-gray-600 mb-4">
                                        If you wish, you can also use your own generated Gemini API key at rates you prefer.
                                        This won't be limited by me and gives you full control over your testing experience.
                                    </p>
                                    <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                                        <div className="flex items-center space-x-2 text-orange-800">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="font-medium">This option provides unlimited testing at your own expense.</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 5 */}
                        <div className="border-l-4 border-red-500 pl-6">
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                    <span className="text-red-600 font-bold text-lg">5</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Share Your Feedback</h3>
                                    <p className="text-gray-600 mb-4">
                                        After testing, please share your experience and any feedback you have. Your insights are invaluable
                                        for improving QA Agent!
                                    </p>
                                    <a
                                        href="https://forms.gle/DqRV53s4uujvpf7j7"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 font-medium"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z" />
                                        </svg>
                                        Submit Feedback Form
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-200">
                    <h3 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center">
                        <svg className="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Need Help? Get in Touch
                    </h3>

                    <p className="text-gray-600 mb-6">
                        Feel free to reach out to me directly if you have any questions, issues, or additional feedback during your testing journey.
                    </p>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                            <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Email Me
                            </h4>
                            <p className="text-blue-700 mb-4">Send me a direct email for any questions or detailed feedback.</p>
                            <a
                                href="mailto:awagujeffery@gmail.com"
                                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                            >
                                awagujeffery@gmail.com
                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>
                        </div>

                        <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                            <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                                Connect on LinkedIn
                            </h4>
                            <p className="text-green-700 mb-4">Connect with me for professional networking and quick communication.</p>
                            <a
                                href="https://www.linkedin.com/in/jeffery-ozoekweawagu"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
                            >
                                Jeffery Ozoekwe-Awagu
                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Thank You Footer */}
                <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl shadow-lg p-8 text-center text-white">
                    <h3 className="text-2xl font-bold mb-4">Thank You for Being Part of This Journey! 🙏</h3>
                    <p className="text-lg text-green-100">
                        Your testing efforts and feedback are helping shape the future of automated QA testing.
                        Together, we're building something amazing!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TestingGuide;
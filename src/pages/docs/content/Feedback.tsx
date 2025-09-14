import React, { useState } from 'react'

const FeedbackPage: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        feedback: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState('')
    const [rateLimitEnd, setRateLimitEnd] = useState<Date | null>(null)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const isRateLimited = () => {
        return rateLimitEnd && new Date() < rateLimitEnd
    }

    const validateForm = () => {
        if (!formData.name.trim()) return 'Name is required'
        if (!formData.email.trim()) return 'Email is required'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Please enter a valid email'
        if (!formData.subject.trim()) return 'Subject is required'
        if (!formData.feedback.trim()) return 'Feedback is required'
        if (formData.feedback.length < 10) return 'Feedback must be at least 10 characters'
        return null
    }

    const sendToDiscord = async (data: typeof formData) => {
        const webhookUrl = import.meta.env.VITE_DISCORD_WEBHOOK_URL
        
        if (!webhookUrl) {
            throw new Error('Discord webhook URL not configured')
        }

        const embed = {
            title: "New Feedback Received",
            color: 0x3b82f6, // Blue color
            fields: [
                { name: "Name", value: data.name, inline: true },
                { name: "Email", value: data.email, inline: true },
                { name: "Subject", value: data.subject, inline: false },
                { name: "Feedback", value: data.feedback, inline: false }
            ],
            timestamp: new Date().toISOString(),
            footer: { text: "QA Agent Feedback System" }
        }

        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                embeds: [embed]
            })
        })

        if (!response.ok) {
            throw new Error('Failed to send feedback')
        }
    }

    const handleSubmit = async (e: React.MouseEvent) => {
        e.preventDefault()
        
        if (isRateLimited()) {
            return
        }

        const validationError = validateForm()
        if (validationError) {
            setError(validationError)
            return
        }

        setIsSubmitting(true)
        setError('')

        try {
            await sendToDiscord(formData)
            
            // Set rate limit (5 minutes)
            const rateLimitDuration = 5 * 60 * 1000 // 5 minutes in milliseconds
            setRateLimitEnd(new Date(Date.now() + rateLimitDuration))
            
            setSubmitted(true)
            setFormData({ name: '', email: '', subject: '', feedback: '' })
            
            // Reset submission state after rate limit
            setTimeout(() => {
                setSubmitted(false)
                setRateLimitEnd(null)
            }, rateLimitDuration)
            
        } catch {
            setError('Failed to send feedback. Please try again later.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const getRemainingTime = () => {
        if (!rateLimitEnd) return 0
        return Math.max(0, Math.ceil((rateLimitEnd.getTime() - Date.now()) / 1000))
    }

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = seconds % 60
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    }

    const remainingTime = getRemainingTime()

    if (submitted && isRateLimited()) {
        return (
            <div className="space-y-12">
                <div>
                    <h1 className="text-4xl font-bold mb-4 text-gray-800">Feedback</h1>
                    <p className="text-lg text-gray-600">Thank you for your feedback!</p>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-lg p-8 border border-green-100">
                    <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-semibold text-gray-800 mb-3">Feedback Submitted Successfully!</h2>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                Thank you for taking the time to share your feedback with us. Your input is valuable 
                                and helps us improve QA Agent. We'll review your message and get back to you if needed.
                            </p>
                            <div className="bg-white rounded-lg p-4 border border-green-100">
                                <p className="text-sm text-gray-600 mb-2">
                                    To prevent spam, you can submit another feedback in:
                                </p>
                                <div className="text-2xl font-bold text-green-600">
                                    {formatTime(remainingTime)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-12">
            <div>
                <h1 className="text-4xl font-bold mb-4 text-gray-800">Feedback</h1>
                <p className="text-lg text-gray-600">Help us improve QA Agent with your feedback</p>
            </div>

            {/* Introduction */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">We Value Your Input</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Your feedback helps us make QA Agent better for everyone. Whether you've found a bug, 
                            have a feature request, or just want to share your experience, we'd love to hear from you.
                        </p>
                    </div>
                </div>
            </div>

            {/* Feedback Form */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Send Us Your Feedback</h2>
                
                <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                Name *
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="Your full name"
                                disabled={isSubmitting}
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email *
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="your.email@example.com"
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                            Subject *
                        </label>
                        <input
                            type="text"
                            id="subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="Brief description of your feedback"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div>
                        <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
                            Feedback *
                        </label>
                        <textarea
                            id="feedback"
                            name="feedback"
                            value={formData.feedback}
                            onChange={handleInputChange}
                            rows={6}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical"
                            placeholder="Please share your detailed feedback, suggestions, or report any issues you've encountered..."
                            disabled={isSubmitting}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Minimum 10 characters required
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center space-x-2">
                                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-red-700">{error}</p>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            * Required fields
                        </p>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isSubmitting || isRateLimited() || formData.feedback.length < 10}
                            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center space-x-2">
                                    <svg className="animate-spin w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    <span>Sending...</span>
                                </span>
                            ) : (
                                'Send Feedback'
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Contact Info */}
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl shadow-lg p-8 border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Other Ways to Reach Us</h2>
                <div className="grid md:grid-cols-2 gap-6 text-sm">
                    <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <span className="text-gray-600">For urgent issues, email us directly</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <span className="text-gray-600">We typically respond within 24 hours</span>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <span className="text-gray-600">Rate limited to prevent spam (5 min cooldown)</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <span className="text-gray-600">All feedback is sent securely to our team</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FeedbackPage
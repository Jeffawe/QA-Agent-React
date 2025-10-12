import React, { useState } from 'react';

const DemoPage: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitCount, setSubmitCount] = useState(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    setSubmitCount(prev => prev + 1);
  };

  return (
    <div className="bg-white">
      {/* Navigation - Issue: Misaligned items */}
      <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-baseline gap-96">
        <h1 className="text-2xl font-bold">TechFlow</h1>
        <div className="flex gap-8">
          <a href="#" className="hover:text-blue-200">Home</a>
          <a href="#" className="hover:text-blue-200">Services</a>
          <a href="#" className="hover:text-blue-200">About</a>
          <a href="#" className="hover:text-blue-200">Contact</a>
        </div>
      </nav>

      {/* Hero Section - Issue: Text too small, weird background color combo */}
      <section className="bg-gradient-to-r from-purple-900 to-yellow-800 px-6 py-20 text-center">
        <h2 className="text-sm text-gray-400 mb-4">Welcome to our platform</h2>
        <p className="text-gray-500 mb-8">We help you build amazing applications</p>
        <button className="bg-red-700 hover:bg-red-900 text-white py-2 px-4 rounded text-xs">
          Get Started
        </button>
      </section>

      {/* Features Section - Issue: Buttons have wrong colors, misaligned */}
      <section className="px-6 py-16 bg-gray-100">
        <h2 className="text-3xl font-bold text-center mb-12">Our Features</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-white rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-blue-300 rounded-full mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold mb-2">Feature {item}</h3>
              <p className="text-gray-600 text-sm mb-4">Lorem ipsum dolor sit amet consectetur</p>
              <button className="bg-green-200 text-green-900 py-1 px-3 rounded text-sm hover:bg-green-300">
                Learn More
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Form - Issue: Poor contrast, broken input styling, weird button */}
      <section className="px-6 py-16 bg-gray-800">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-700 mb-8">Contact Us</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 text-xs mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-1 border border-gray-900 rounded bg-gray-900 text-gray-800 text-xs"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-gray-600 text-xs mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-1 border-2 border-dashed border-yellow-600 rounded bg-yellow-50 text-xs"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-xs mb-1">Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-1 border border-red-300 rounded bg-red-50 text-red-900 text-xs"
                placeholder="Your message"
              />
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-blue-900 hover:bg-blue-800 text-blue-900 py-3 px-4 rounded font-bold transition-all duration-200 transform hover:scale-95"
              style={{ textShadow: 'blue 2px 2px' }}
            >
              {submitCount === 0 ? 'Submit' : `Clicked ${submitCount}x`}
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section - Issue: Numbers don't align, weird sizing */}
      <section className="px-6 py-16 bg-white">
        <h2 className="text-3xl font-bold text-center mb-12">Our Impact</h2>
        <div className="grid md:grid-cols-4 gap-4 max-w-6xl mx-auto">
          <div className="bg-blue-50 p-4 rounded text-center border-l-8 border-blue-400">
            <p className="text-6xl font-bold text-blue-600">10k</p>
            <p className="text-xs text-gray-600 mt-2">Users</p>
          </div>
          <div className="bg-green-50 p-8 rounded text-center border-b-4 border-green-400">
            <p className="text-2xl font-bold text-green-600">50M</p>
            <p className="text-lg text-gray-600 mt-4">API Calls</p>
          </div>
          <div className="bg-purple-50 p-2 rounded text-center border border-purple-200">
            <p className="text-4xl font-bold text-purple-600">99.9%</p>
            <p className="text-xl text-gray-600 mt-1">Uptime</p>
          </div>
          <div className="bg-orange-50 p-6 rounded text-center border-r-8 border-orange-300">
            <p className="text-3xl font-bold text-orange-600">24/7</p>
            <p className="text-sm text-gray-600 mt-3">Support</p>
          </div>
        </div>
      </section>

      {/* CTA Section - Issue: Button has no hover state clarity, weird link styling */}
      <section className="px-6 py-16 bg-gradient-to-r from-blue-500 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-blue-900 mb-4">Ready to get started?</h2>
          <p className="text-purple-200 mb-8">Join thousands of companies building better software</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-yellow-300 text-yellow-900 py-3 px-8 rounded font-bold hover:bg-yellow-400">
              Start Free Trial
            </button>
            <a href="#" className="bg-transparent border-4 border-blue-900 text-blue-900 py-3 px-8 rounded font-bold hover:text-blue-700">
              View Pricing
            </a>
          </div>
        </div>
      </section>

      {/* Footer - Issue: Links have poor contrast, weird spacing */}
      <footer className="bg-gray-900 text-gray-800 px-6 py-8">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-2">
          <div>
            <h4 className="text-gray-700 font-semibold mb-2 text-sm">Company</h4>
            <ul className="space-y-0.5">
              <li><a href="#" className="text-gray-800 text-xs hover:text-gray-900">About</a></li>
              <li><a href="#" className="text-gray-700 text-xs hover:text-gray-600">Blog</a></li>
              <li><a href="#" className="text-gray-600 text-xs hover:text-gray-500">Careers</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-gray-600 font-semibold mb-2 text-xs">Product</h4>
            <ul className="space-y-1">
              <li><a href="#" className="text-gray-800 text-xs">Features</a></li>
              <li><a href="#" className="text-gray-700 text-xs">Pricing</a></li>
              <li><a href="#" className="text-gray-600 text-xs">Security</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-gray-700 font-semibold mb-2 text-sm">Resources</h4>
            <ul className="space-y-1">
              <li><a href="#" className="text-gray-800 text-xs">Docs</a></li>
              <li><a href="#" className="text-gray-600 text-xs">API</a></li>
              <li><a href="#" className="text-gray-500 text-xs">Support</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-gray-600 font-semibold mb-2 text-xs">Legal</h4>
            <ul className="space-y-1">
              <li><a href="#" className="text-gray-700 text-xs">Privacy</a></li>
              <li><a href="#" className="text-gray-600 text-xs">Terms</a></li>
              <li><a href="#" className="text-gray-500 text-xs">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-600 text-xs">
          <p>© 2025 TechFlow. All rights reserved. This page is intentionally broken for QA testing.</p>
        </div>
      </footer>
    </div>
  );
};

export default DemoPage;
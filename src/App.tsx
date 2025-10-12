import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import UpdatesPage from './pages/UpdatesPage';
import { Analytics } from "@vercel/analytics/react";
import TestingPage from './pages/docs/content/TestingPage';
import TestingGuide from './pages/TestingGuide';
import DocsPage from './pages/docs/DocsPage';
import AdminHealthDashboard from './pages/HealthTab';
import DemoPage from './pages/DemoPage';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50">
        {/* Navbar */}
        <header className="bg-gray-900 text-white shadow">
          <div className="container mx-auto px-4 py-4">
            {/* Mobile responsive layout */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
              {/* Logo section */}
              <h1 className="text-xl font-semibold flex justify-center sm:justify-start">
                <Link to="/" className="flex items-center space-x-2">
                  <span className='text-2xl'>QA Agent</span>
                  <span className="relative">
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  </span>
                </Link>
              </h1>
              
              {/* Navigation section */}
              <nav className="flex justify-center sm:justify-end space-x-4">
                <Link to="/" className="hover:text-teal-300">Home</Link>
                <Link to="/docs" className="hover:text-teal-300">Docs</Link>
                <Link to="/updates" className="hover:text-teal-300">Updates</Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/testing" element={<TestingPage />} />
            <Route path="/updates" element={<UpdatesPage />} />
            <Route path="/test" element={<TestingGuide />} />
            <Route path="/docs" element={<DocsPage />} />
            <Route path="/docs/*" element={<DocsPage />} />
            <Route path="/health" element={<AdminHealthDashboard />} />
            <Route path="/demo" element={<DemoPage />} />
            {/* Add more routes as needed */}
          </Routes>
        </main>

        {/* Footer (optional) */}
        <footer className="bg-gray-900 text-center text-sm py-4 text-white mt-auto">
          Built by <a href="https://www.jeffawe.com" className="text-teal-600">Jeffery Ozoekwe-Awagu</a>
        </footer>
        <Analytics />
      </div>
    </Router>
  );
};

export default App;
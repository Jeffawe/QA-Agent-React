import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import HelpPage from './pages/HelpPage';
import UpdatesPage from './pages/UpdatesPage';
import { Analytics } from "@vercel/analytics/react";
import TestingPage from './pages/TestingPage';
import TestingGuide from './pages/TestingGuide';


const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50">
        {/* Navbar */}
        <header className="bg-gray-900 text-white shadow">

          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold flex items-center space-x-2">
              <Link to="/" className="flex items-center space-x-2">
                <span className='text-2xl'>QA Agent</span>
                <span className="relative">
                  <span className="bg-gradient-to-r bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-bold tracking-wide shadow-md border border-amber-300">
                    BETA
                  </span>
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                </span>
              </Link>
            </h1>
            <nav className="space-x-4">
              <Link to="/" className="hover:text-teal-300">Home</Link>
              <Link to="/help" className="hover:text-teal-300">Help</Link>
              <Link to="/guide" className="hover:text-teal-300">Testing</Link>
              <Link to="/updates" className="hover:text-teal-300">Updates</Link>
            </nav>
          </div>
        </header>

        {/* Page Content */}
        <main className="">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/guide" element={<TestingPage />} />
            <Route path="/updates" element={<UpdatesPage />} />
            <Route path="/test" element={<TestingGuide />} />
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

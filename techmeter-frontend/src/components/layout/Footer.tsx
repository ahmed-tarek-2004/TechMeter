import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <Link to="/" className="flex items-center">
              <BookOpen className="h-8 w-8 text-indigo-400" />
              <span className="ml-2 text-xl font-bold text-white">TechMeter</span>
            </Link>
            <p className="mt-4 text-gray-400 text-sm">
              Empowering learners worldwide with quality tech education. Learn from industry experts and advance your career.
            </p>
            <div className="mt-6 flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24,12.073c0,-6.627 -5.373,-12 -12,-12s-12,5.373 -12,12c0,5.99 4.388,10.954 10.125,11.854v-8.385H7.078v-3.47h3.047V9.43c0,-3.007 1.792,-4.669 4.533,-4.669 1.312,0 2.686,0.235 2.686,0.235v2.953H15.83c-1.491,0 -1.956,0.925 -1.956,1.874v2.25h3.328l-0.532,3.47h-2.796v8.385C19.612,23.027 24,18.062 24,12.073z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953,4.57a10,10,0,0,1-2.825.775,4.958,4.958,0,0,0,2.163-2.723c-.951.555-2.005.959-3.127,1.184a4.92,4.92,0,0,0-8.384,4.482C7.69,8.095,4.067,6.13,1.64,3.162a4.822,4.822,0,0,0-.666,2.475c0,1.71.87,3.213,2.188,4.096a4.904,4.904,0,0,1-2.228-.616v.06a4.923,4.923,0,0,0,3.946,4.827,4.996,4.996,0,0,1-2.212.085,4.936,4.936,0,0,0,4.604,3.417,9.867,9.867,0,0,1-6.102,2.105c-.39,0-.779-.023-1.17-.067a13.995,13.995,0,0,0,7.557,2.209c9.053,0,13.998-7.496,13.998-13.985,0-.21,0-.42-.015-.63A9.935,9.935,0,0,0,24,4.59z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447,20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853,0-2.136,1.445-2.136,2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9,1.637-1.85,3.37-1.85,3.601,0,4.267,2.37,4.267,5.455v6.286zM5.337,7.433c-1.144,0-2.063-.926-2.063-2.065,0-1.138.92-2.063,2.063-2.063,1.14,0,2.064.925,2.064,2.063,0,1.139-.925,2.065-2.064,2.065zm1.782,13.019H3.555V9h3.564v11.452zM22.225,0H1.771C.792,0,0,.774,0,1.729v20.542C0,23.227.792,24,1.771,24h20.451C23.2,24,24,23.227,24,22.271V1.729C24,.774,23.2,0,22.222,0h.003z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/courses" className="text-gray-400 hover:text-white text-sm">
                  Browse Courses
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-gray-400 hover:text-white text-sm">
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/providers" className="text-gray-400 hover:text-white text-sm">
                  Become a Provider
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white text-sm">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">
              Support
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white text-sm">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-400 hover:text-white text-sm">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-400 hover:text-white text-sm">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-white text-sm">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">
              Contact Info
            </h3>
            <ul className="mt-4 space-y-4">
              <li className="flex items-center text-gray-400 text-sm">
                <MapPin className="h-5 w-5 mr-3 text-indigo-400" />
                123 Tech Street, Cairo, Egypt
              </li>
              <li className="flex items-center text-gray-400 text-sm">
                <Phone className="h-5 w-5 mr-3 text-indigo-400" />
                +20 123 456 7890
              </li>
              <li className="flex items-center text-gray-400 text-sm">
                <Mail className="h-5 w-5 mr-3 text-indigo-400" />
                support@techmeter.com
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-800 pt-8">
          <p className="text-gray-400 text-sm text-center">
            © {new Date().getFullYear()} TechMeter. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, MessageSquare } from 'lucide-react';

const Contact: React.FC = () => {
  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      value: 'support@techmeter.com',
      link: 'mailto:support@techmeter.com',
    },
    {
      icon: Phone,
      title: 'Phone',
      value: '+20 123 456 7890',
      link: 'tel:+201234567890',
    },
    {
      icon: MapPin,
      title: 'Address',
      value: '123 Tech Street, Cairo, Egypt',
      link: 'https://maps.google.com',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Contact Us</h1>
          <p className="mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Reach out to us through any of the following channels.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {contactInfo.map((info) => (
            <div key={info.title} className="bg-white dark:bg-gray-900 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-800 p-6 text-center transition hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900/50">
              <div className="mx-auto w-12 h-12 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl flex items-center justify-center">
                <info.icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="mt-4 text-sm font-bold text-gray-900 dark:text-white">{info.title}</h3>
              <a
                href={info.link}
                className="mt-2 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 block transition-colors"
                target={info.title === 'Address' ? '_blank' : undefined}
                rel={info.title === 'Address' ? 'noopener noreferrer' : undefined}
              >
                {info.value}
              </a>
            </div>
          ))}
        </div>

        {/* Chat Section */}
        <div className="mt-12 bg-white dark:bg-gray-900 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 p-8 text-center">
          <div className="mx-auto w-14 h-14 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl flex items-center justify-center mb-4">
            <MessageSquare className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">Live Chat & Support</h2>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Need immediate assistance? Connect with our team directly through our in-app messaging system.
          </p>
          <Link
            to="/messages"
            className="mt-6 inline-flex items-center px-6 py-2.5 border border-transparent text-xs font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition"
          >
            Start Conversation
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Contact;

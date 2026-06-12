import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white pt-12 pb-8 mt-12 border-t border-gray-700">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {/* About us */}
          <div>
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-3xl">📖</span>
              <h3 className="text-2xl font-bold text-gray-100 uppercase tracking-wide">
                About us
              </h3>
            </div>
            <p className="text-gray-300 leading-relaxed max-w-md mx-auto text-base">
              Testeate is a platform to prepare for your official exams with resources, tests, and much more.
            </p>
          </div>

          {/* Contact */}
          <div>
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-3xl">📧</span>
              <h3 className="text-2xl font-bold text-gray-100 uppercase tracking-wide">
                Contact
              </h3>
            </div>
            <p className="text-gray-300 leading-relaxed text-base">
              Email:{" "}
              <a 
                href="mailto:contact@testeate.com" 
                className="text-blue-400 hover:text-blue-300 hover:underline transition-colors duration-200"
              >
                contact@testeate.com
              </a>
            </p>
            <p className="text-gray-300 leading-relaxed text-base mt-1">
              Phone:{" "}
              <a 
                href="tel:+34123456789" 
                className="text-blue-400 hover:text-blue-300 hover:underline transition-colors duration-200"
              >
                +34 123 456 789
              </a>
            </p>
          </div>

          {/* Work with us */}
          <div>
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-3xl">🤝</span>
              <h3 className="text-2xl font-bold text-gray-100 uppercase tracking-wide">
                Work with us
              </h3>
            </div>
            <p className="text-gray-300 leading-relaxed max-w-md mx-auto text-base">
              We collaborate with academies to offer tailored tests and monitor student progress.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 my-6"></div>

        {/* Copyright */}
        <div className="text-center">
          <p className="text-gray-400 text-sm font-medium select-none">
            © 2025 Test yourself. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
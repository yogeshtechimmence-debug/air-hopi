import { Camera, Earth, X } from "lucide-react";
import React from "react";

const Footer = () => {
  return (
    <footer className="border-t bg-white">
      {/* Top section */}
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-10 text-sm text-gray-700">
        {/* Support */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
          <ul className="space-y-3">
            <li>Help Centre</li>
            <li>Get help with a safety issue</li>
            <li>AirCover</li>
          </ul>
        </div>

        {/* Hosting */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Hosting</h3>
          <ul className="space-y-3">
            <li>airhopi your home</li>
            <li>airhopi your experience</li>
            <li>airhopi your service</li>
          </ul>
        </div>

        {/* airhopi */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">airhopi</h3>
          <ul className="space-y-3">
            <li>2025 Summer Release</li>
            <li>Newsroom</li>
            <li>Careers</li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between text-sm text-gray-600 gap-4">
          {/* Left */}
          <div className="flex flex-wrap items-center gap-2">
            <span>© 2026 airhopi, Inc.</span>
            <span>·</span>
            <span>Privacy</span>
            <span>·</span>
            <span>Terms</span>
            <span>·</span>
            <span>Company details</span>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;

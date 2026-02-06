"use client";

import * as React from "react";

export function Footer() {
  return (
    <footer className="py-12 px-4 bg-teal-50 border-t border-teal-200">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="h-6 w-6 rounded-full bg-teal-500"></div>
              <span className="font-bold text-teal-600">Ubukwe</span>
            </div>
            <p className="text-sm text-gray-600">
              Connecting Rwandan couples with authentic wedding service providers to celebrate love and cultural
              heritage.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-teal-600">Services</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="hover:text-teal-600 transition-colors cursor-pointer">Traditional Dancers</li>
              <li className="hover:text-teal-600 transition-colors cursor-pointer">Master of Ceremonies</li>
              <li className="hover:text-teal-600 transition-colors cursor-pointer">Decorations</li>
              <li className="hover:text-teal-600 transition-colors cursor-pointer">Catering</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-teal-600">For Providers</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="hover:text-teal-600 transition-colors cursor-pointer">Join Platform</li>
              <li className="hover:text-teal-600 transition-colors cursor-pointer">Provider Dashboard</li>
              <li className="hover:text-teal-600 transition-colors cursor-pointer">Manage Bookings</li>
              <li className="hover:text-teal-600 transition-colors cursor-pointer">Payment System</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-teal-600">Support</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="hover:text-teal-600 transition-colors cursor-pointer">Help Center</li>
              <li className="hover:text-teal-600 transition-colors cursor-pointer">Contact Us</li>
              <li className="hover:text-teal-600 transition-colors cursor-pointer">Cultural Guidelines</li>
              <li className="hover:text-teal-600 transition-colors cursor-pointer">Terms of Service</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-teal-200 mt-8 pt-8 text-center text-sm text-gray-600">
          <p>&copy; 2024 Ubukwe. Celebrating Rwandan wedding traditions with pride.</p>
        </div>
      </div>
    </footer>
  );
}


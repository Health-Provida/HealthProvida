import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Phone, Mail, MapPin } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import logo from '../components/ui/logo.png'

const Footer = () => {

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              {/* <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">HealthProvida</span> */}
              <img src={logo}
                style={{ width: "10rem" }} alt='logo' />
            </Link>
            <p className="text-gray-400 text-sm">
              Find trusted providers near you, check their availability, and book appointments in just a few taps—no stress, no delays
            </p>
          </div>

          <div>
            <span className="font-semibold text-lg mb-4 block">Quick Links</span>
            <div className="space-y-2">
              <Link to="/" className="block text-gray-400 hover:text-white transition-colors">Find Clinics</Link>
              <Link to="/services" className="block text-gray-400 hover:text-white transition-colors">Services</Link>
              <Link to="/about" className="block text-gray-400 hover:text-white transition-colors">About Us</Link>
              <a href="https://www.healthsquare.africa" target="_blank" rel="noopener noreferrer" className="block text-gray-400 hover:text-white transition-colors">
                Health Resources
              </a>
            </div>
          </div>


          <div>
            <span className="font-semibold text-lg mb-4 block">Support</span>
            <div className="space-y-2">
              <Link to="/contact" className="block text-gray-400 hover:text-white transition-colors">Contact Us</Link>
              <button className="block text-gray-400 hover:text-white transition-colors">Privacy Policy</button>
              <button className="block text-gray-400 hover:text-white transition-colors">Terms of Service</button>
            </div>
          </div>

          <div>
            <span className="font-semibold text-lg mb-4 block">Contact Info</span>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-gray-400">
                <Phone className="w-4 h-4" />
                <span className="text-sm">+2348111557302</span>
              </div>
              {/* <div className="flex items-center space-x-2 text-gray-400">
                <Mail className="w-4 h-4" />
                <span className="text-sm">support@healthprovida.com</span>
              </div> */}
              <div className="flex items-center space-x-2 text-gray-400">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">Serving Sub-Saharan Africa</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 HealthProvida. All rights reserved. | Revolutionizing healthcare access in Sub-Saharan Africa.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
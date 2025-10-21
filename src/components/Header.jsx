import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import { Heart, Menu, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import searchRef from '@/components/SearchSection';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import { useLocation } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  // const location = useLocation();
  // const currentPagePath = location.pathname;

  // // Handle scrolling to search after navigation
  // useEffect(() => {
  //   if (shouldScroll && currentPagePath === '/' && searchRef.current) {
  //     // Small delay to ensure page is rendered
  //     setTimeout(() => {
  //       searchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  //       setTimeout(() => searchRef.current?.focus(), 500);
  //       setShouldScroll(false);
  //     }, 100);
  //   }
  // }, [currentPagePath, shouldScroll]);

   const handleSearchClick = () => {
    // Navigate to home page with state to trigger scroll
    navigate('/', { state: { scrollToSearch: true } });
  };

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2"
            >
              <img src={"/src/components/ui/logo.png"}  style ={{width: "10rem"}} alt='logo' />
            </motion.div>
          </Link>
          <nav className="hidden md:flex items-center space-x-8">
            <NavLink
              to="/"
              className={({ isActive, isPending }) => {
                let baseClass="nav-link text-gray-700 hover:text-blue-600 transition-colors font-medium"
                if (isActive) return `${baseClass} active`;
                return baseClass;
              }}
            >
              Home
            </NavLink>
            <NavLink 
              to="/services"
              className={({ isActive, isPending }) => {
                let baseClass="nav-link text-gray-700 hover:text-blue-600 transition-colors font-medium"
                if (isActive) return `${baseClass} active`;
                return baseClass;
              }}
            >
              Services
            </NavLink>
            <NavLink 
              to="/about"
              className={({ isActive, isPending }) => {
                let baseClass="nav-link text-gray-700 hover:text-blue-600 transition-colors font-medium"
                if (isActive) return `${baseClass} active`;
                return baseClass;
              }}
            >
              About
            </NavLink>
          </nav>

          <div className="flex items-center space-x-4">
            {/* <Button 
              variant="ghost" 
              size="sm"
              onClick={handleMenuClick}
              className="hidden md:flex"
            >
              <User className="w-4 h-4 mr-2" />
              Sign In
            </Button> */}
            <NavLink 
              // to="/#"
              to="/join-provider"
              className={({ isActive, isPending }) => {
                let baseClass="nav-link text-gray-700 hover:text-blue-600 transition-colors font-medium"
                if (isActive) return `${baseClass} active`;
                return baseClass;
              }}
            >
              Join as a Provider
            </NavLink>
            <Button 
              size="sm"
              // onClick={handleMenuClick}
              onClick={handleSearchClick}
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
            >
              Find a Provider
            </Button>
            {/* <Button 
              variant="ghost" 
              size="icon"
              // onClick={handleMenuClick}  
              className="md:hidden"
            >
              <Menu className="w-5 h-5" />
            </Button> */}
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;

import { Link, useLocation } from 'react-router-dom';
import { Home, UserPlus } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
           <div className="w-10 h-10 bg-gradient-to-br from-conference-maroon to-conference-navy rounded-full flex items-center justify-center overflow-hidden">
                <img
                src="images.jpeg"
                alt="Profile"
                className="w-full h-full object-cover" />
            </div>

            <span className="text-conference-navy font-bold text-xl">RGC Heavens Gate</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex space-x-8">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${
                location.pathname === '/' 
                  ? 'text-conference-maroon bg-conference-lightGrey' 
                  : 'text-gray-700 hover:text-conference-maroon hover:bg-gray-50'
              }`}
            >
              <Home size={18} />
              <span>Home</span>
            </Link>
            <Link
              to="/register"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${
                location.pathname === '/register' 
                  ? 'text-conference-maroon bg-conference-lightGrey' 
                  : 'text-gray-700 hover:text-conference-maroon hover:bg-gray-50'
              }`}
            >
              <UserPlus size={18} />
              <span>Register</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

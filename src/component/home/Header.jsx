import { Link } from 'react-router-dom';
import logo from '../../../public/logo.webp';
import { useContext, useState } from 'react';
import { AuthContext } from '../../context/Authcontext';

const Header = () => {
  const { users, logout } = useContext(AuthContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSignOut = () => {
    logout()
      .then(() => {
        console.log('User signed out successfully');
        setIsDropdownOpen(false);
      })
      .catch(error => {
        console.error('Sign out error:', error);
      });
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <header className="bg-white py-5 px-[115px] shadow-2xl sticky top-0 z-50">
      <div className="flex justify-between items-center  mx-auto">
        {/* Logo + Title */}
        <Link to="/" className="flex items-center gap-3 group">
          <img 
            src={logo} 
            alt="Logo" 
            className="h-12 w-12 transition-transform duration-300 group-hover:scale-110" 
          />
          <h1 className="text-2xl font-bold text-[#008E48] bg-gradient-to-r from-[#008E48] to-[#00C853] bg-clip-text text-transparent">
            Health And Sanitation Platform
          </h1>
        </Link>

        {/* Navigation + User Section */}
        <div className="flex items-center gap-6">
          {/* Donation Button */}
          <button className="bg-[#008E48] hover:bg-[#00753e] text-white px-6 py-2 rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-[#008E48]/30">
            Donation
          </button>

          {/* User Section */}
          {users ? (
            <div className="relative">
              <button 
                onClick={toggleDropdown}
                className="flex items-center gap-2 focus:outline-none"
              >
                <div className="h-10 w-10 rounded-full bg-[#008E48] flex items-center justify-center text-white font-bold">
                  {users.email.charAt(0).toUpperCase()}
                </div>
                <svg 
                  className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-100">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{users.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    My Profile
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to={'signin'}>
              <button className="bg-[#008E48] hover:bg-[#00753e] text-white px-6 py-2 rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-[#008E48]/30">
                Sign In
              </button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
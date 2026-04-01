import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { 
  HomeIcon, 
  ShoppingBagIcon, 
  ShoppingCartIcon, 
  UserIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { getTotalItems } = useCart();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout(); 
    setIsMenuOpen(false);
    navigate('/'); 
  };

  const NavLink = ({ to, children, onClick }) => (
    <Link
      to={to}
      onClick={onClick}
      className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center"
    >
      {children}
    </Link>
  );

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">F2H</span>
              </div>
              <span className="text-xl font-bold text-green-600">Farm2Home</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <NavLink to="/">
              <HomeIcon className="w-5 h-5 mr-1" /> Home
            </NavLink>
            
            {user && user.userType === 'customer' && (
              <>
                <NavLink to="/marketplace">
                  <ShoppingBagIcon className="w-5 h-5 mr-1" /> Marketplace
                </NavLink>
                <NavLink to="/cart">
                  <div className="relative flex items-center">
                    <ShoppingCartIcon className="w-5 h-5 mr-1" />
                    Cart
                    {getTotalItems() > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                        {getTotalItems()}
                      </span>
                    )}
                  </div>
                </NavLink>
              </>
            )}

            {user ? (
              <div className="flex items-center space-x-4">
                {user.userType === 'farmer' && (
                  <NavLink to="/farmer-dashboard">Dashboard</NavLink>
                )}
                <NavLink to="/profile">
                  <UserIcon className="w-5 h-5 mr-1" /> Profile
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <NavLink to="/login">Login</NavLink>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-700 p-2">
              {isMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 pb-3">
            <div className="px-2 pt-2 space-y-1">
              <NavLink to="/" onClick={() => setIsMenuOpen(false)}>
                <HomeIcon className="w-5 h-5 mr-2" /> Home
              </NavLink>
              
              {user && user.userType === 'customer' && (
                <>
                  <NavLink to="/marketplace" onClick={() => setIsMenuOpen(false)}>
                    <ShoppingBagIcon className="w-5 h-5 mr-2" /> Marketplace
                  </NavLink>
                  <NavLink to="/cart" onClick={() => setIsMenuOpen(false)}>
                    <ShoppingCartIcon className="w-5 h-5 mr-2" /> Cart ({getTotalItems()})
                  </NavLink>
                </>
              )}

              {user ? (
                <>
                  {user.userType === 'farmer' && (
                    <NavLink to="/farmer-dashboard" onClick={() => setIsMenuOpen(false)}>Dashboard</NavLink>
                  )}
                  <NavLink to="/profile" onClick={() => setIsMenuOpen(false)}>
                    <UserIcon className="w-5 h-5 mr-2" /> Profile
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium w-full text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/login" onClick={() => setIsMenuOpen(false)}>Login</NavLink>
                  <NavLink to="/register" onClick={() => setIsMenuOpen(false)}>Register</NavLink>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
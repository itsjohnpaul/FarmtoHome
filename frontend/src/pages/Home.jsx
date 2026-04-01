import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  // Fresh vegetables background image
  const backgroundImageUrl = 'https://images.pexels.com/photos/4551832/pexels-photo-4551832.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'; 

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative text-white overflow-hidden">
        {/* Background Image Layer */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${backgroundImageUrl})`,
            opacity: 6.9 // Adjust this value for lower/higher opacity
          }}
        />
        
        {/* Gradient Overlay Layer */}
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-green-400 to-green-500 opacity-90" />

        {/* Content Layer */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Farm2Home 🌿
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Connect directly with local farmers. Fresh vegetables at fixed rates, 
              no middlemen, fair prices for everyone.
            </p>
            <div className="space-x-4">
              <Link
                to="/marketplace"
                className="bg-white text-green-400 hover:bg-gray-100 px-8 py-3 rounded-lg text-lg font-semibold transition-colors duration-200 inline-block"
              >
                Shop Now
              </Link>
              {!user && (
                <Link
                  to="/register"
                  className="bg-green-500 hover:bg-green-400 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors duration-200 inline-block"
                >
                  Join as Farmer
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Farm2Home?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're revolutionizing the way fresh produce reaches your table
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg bg-green-50 hover:bg-green-100 transition-colors duration-200">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚜</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Direct from Farmers</h3>
              <p className="text-gray-600">
                Buy directly from local farmers, ensuring freshness and supporting local agriculture
              </p>
            </div>

            <div className="text-center p-6 rounded-lg bg-green-50 hover:bg-green-100 transition-colors duration-200">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Fixed Fair Prices</h3>
              <p className="text-gray-600">
                Transparent, fixed pricing that's fair for both farmers and customers
              </p>
            </div>

            <div className="text-center p-6 rounded-lg bg-green-50 hover:bg-green-100 transition-colors duration-200">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🥬</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Fresh & Organic</h3>
              <p className="text-gray-600">
                Get the freshest vegetables delivered straight from the farm to your home
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">500+</div>
              <div className="text-gray-600">Happy Farmers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">10K+</div>
              <div className="text-gray-600">Satisfied Customers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">50+</div>
              <div className="text-gray-600">Vegetable Varieties</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">24/7</div>
              <div className="text-gray-600">Fresh Delivery</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Get Fresh Vegetables?
          </h2>
          <p className="text-xl mb-8">
            Join thousands of customers who trust Farm2Home for their daily vegetable needs
          </p>
          <Link
            to="/marketplace"
            className="bg-white text-green-600 hover:bg-gray-100 px-8 py-3 rounded-lg text-lg font-semibold transition-colors duration-200 inline-block"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
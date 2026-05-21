import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import axios from 'axios';

const url = 'https://farmtohome-14jo.onrender.com';

const Marketplace = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  // Fixed prices for vegetables (per kg)
  const fixedPrices = {
    tomato: 40,
    onion: 30,
    potato: 25,
    carrot: 35,
    cabbage: 20,
    cauliflower: 45,
    spinach: 50,
    broccoli: 60,
    cucumber: 30,
    capsicum: 55,
    eggplant: 35,
    okra: 40
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${url}/api/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.farmer.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    setFilteredProducts(filtered);
  };

  const handleAddToCart = (product) => {
    if (!user) {
      alert('Please login to add items to cart');
      return;
    }
    addToCart(product, 1);
  };

  const categories = [
    { value: 'all', label: 'All Vegetables' },
    { value: 'tomato', label: 'Tomatoes' },
    { value: 'onion', label: 'Onions' },
    { value: 'potato', label: 'Potatoes' },
    { value: 'carrot', label: 'Carrots' },
    { value: 'cabbage', label: 'Cabbage' },
    { value: 'cauliflower', label: 'Cauliflower' },
    { value: 'spinach', label: 'Spinach' },
    { value: 'broccoli', label: 'Broccoli' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading fresh vegetables...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Fresh Vegetables Marketplace 🥬
          </h1>
          <p className="text-gray-600">
            Discover fresh vegetables directly from local farmers at fixed fair prices
          </p>
        </div>

    
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search vegetables or farmers
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for vegetables or farmer names..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

       
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🥬</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No vegetables found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or category filter
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard
                key={product._id || product.id}
                product={product}
                onAddToCart={handleAddToCart}
                showAddToCart={user && user.userType === 'customer'}
              />
            ))}
          </div>
        )}

     
        <div className="mt-12 bg-green-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800 mb-4">
            Our Fixed Price System 💰
          </h3>
          <p className="text-green-700 mb-4">
            We maintain transparent, fixed prices for all vegetables to ensure fairness for both farmers and customers.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {Object.entries(fixedPrices).map(([vegetable, price]) => (
              <div key={vegetable} className="flex justify-between">
                <span className="capitalize">{vegetable}:</span>
                <span className="font-semibold">₹{price}/kg</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;

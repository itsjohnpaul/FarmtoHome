import React from 'react';
import { MapPinIcon, UserIcon } from '@heroicons/react/24/outline';
const url = 'http://localhost:3000';

const ProductCard = ({ product, onAddToCart, showAddToCart = true }) => {
  const productImage = product.image
    ? product.image.startsWith('http')
      ? product.image
      : `${url}${product.image}`
    : 'https://via.placeholder.com/400x300?text=No+Image';

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="relative">
        <img
          src={productImage}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
          ₹{product.price}/kg
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {product.name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3">
          {product.description}
        </p>
        
        <div className="flex items-center mb-3">
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3">
            {product.farmer.avatar}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {product.farmer.name}
            </p>
            <div className="flex items-center text-xs text-gray-500">
              <MapPinIcon className="w-3 h-3 mr-1" />
              {product.farmer.location}
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Available:</span> {product.quantity} kg
          </div>
          <div className="text-lg font-bold text-green-600">
            ₹{product.price}/kg
          </div>
        </div>
        
        {showAddToCart && (
          <button
            onClick={() => onAddToCart(product)}
            disabled={product.quantity === 0}
            className={`w-full py-2 px-4 rounded-md font-medium transition-colors duration-200 ${
              product.quantity === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {product.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
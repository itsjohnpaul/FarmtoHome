import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { TrashIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const url = 'http://localhost:3000';

const Cart = () => {
  const { user, token } = useAuth();
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  if (!user) {
    return <Navigate to="/login" />;
  }

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    setIsCheckingOut(true);

    try {
      // Group items by farmer
      const ordersByFarmer = {};
      
      cartItems.forEach(item => {
        const farmerId = item.farmer?.id || item.farmerId || item.farmer?._id;
        const farmerName = item.farmer?.name || item.farmerName;
        const itemId = item._id || item.id;

        if (!ordersByFarmer[farmerId]) {
          ordersByFarmer[farmerId] = {
            items: [],
            farmerName: farmerName,
            totalPrice: 0
          };
        }
        
        ordersByFarmer[farmerId].items.push({
          id: itemId,
          name: item.name,
          category: item.category,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        });
        
        ordersByFarmer[farmerId].totalPrice += item.price * item.quantity;
      });

      // Place orders for each farmer
      const orderPromises = Object.entries(ordersByFarmer).map(([farmerId, orderData]) =>
        axios.post(`${url}/api/orders`, {
          items: orderData.items,
          totalPrice: orderData.totalPrice,
          farmerId: farmerId,
          farmerName: orderData.farmerName
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      );

      await Promise.all(orderPromises);

      // Clear cart
      clearCart();
      setOrderPlaced(true);
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Checkout failed. Please try again. ' + (error.response?.data?.message || error.message));
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Order Placed Successfully!
            </h2>
            <p className="text-gray-600 mb-2">
              Your order has been sent to the farmer.
            </p>
            <p className="text-gray-600 mb-6">
              Waiting for farmer confirmation. You'll see updates in your profile.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/marketplace')}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition-colors duration-200"
              >
                Continue Shopping
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md transition-colors duration-200"
              >
                View Order Status
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Shopping Cart 🛒
          </h1>
          <p className="text-gray-600">
            Review your items and proceed to checkout
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Your cart is empty
            </h3>
            <p className="text-gray-600 mb-6">
              Add some fresh vegetables to get started
            </p>
            <button
              onClick={() => navigate('/marketplace')}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md transition-colors duration-200"
            >
              Shop Now
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Cart Items ({cartItems.length})
                  </h2>
                </div>
                
                <div className="divide-y">
                  {cartItems.map(item => {
                    const cartImage = item.image
                      ? item.image.startsWith('http')
                        ? item.image
                          : `${url}${item.image}`
                      : 'https://via.placeholder.com/100x100?text=No+Image';
                    const itemId = item._id || item.id;

                    return (
                      <div key={itemId} className="p-6 flex items-center space-x-4">
                        <img
                          src={cartImage}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                        
                        <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-600">
                          by {item.farmer.name}
                        </p>
                        <p className="text-sm font-medium text-green-600">
                          ₹{item.price}/kg
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleQuantityChange(item._id || item.id, item.quantity - 1)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <MinusIcon className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item._id || item.id, item.quantity + 1)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <PlusIcon className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          ₹{item.price * item.quantity}
                        </p>
                        <button
                          onClick={() => removeFromCart(item._id || item.id)}
                          className="text-red-500 hover:text-red-700 mt-1"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )})}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Order Summary
                </h2>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{getTotalPrice()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery</span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold">Total</span>
                      <span className="text-lg font-semibold">₹{getTotalPrice()}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleCheckout}
                    disabled={isCheckingOut || cartItems.length === 0}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-md font-medium transition-colors duration-200"
                  >
                    {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}
                  </button>
                  
                  <button
                    onClick={() => navigate('/marketplace')}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md transition-colors duration-200"
                  >
                    Continue Shopping
                  </button>
                </div>

                <div className="mt-6 p-4 bg-green-50 rounded-md">
                  <h3 className="font-medium text-green-800 mb-2">
                    Delivery Information
                  </h3>
                  <p className="text-sm text-green-700">
                    Free delivery to: {user.address}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    Estimated delivery: 1-2 days
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
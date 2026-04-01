import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import AddProductModal from '../components/AddProductModal';
import ProductCard from '../components/ProductCard';
import { PlusIcon, PencilIcon, TrashIcon, CheckIcon, XMarkIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const FarmerDashboard = () => {
  const { user, token } = useAuth();
  const [products, setProducts] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmingOrderId, setConfirmingOrderId] = useState(null);
  const [rejectingOrderId, setRejectingOrderId] = useState(null);
  const [showClearHistoryModal, setShowClearHistoryModal] = useState(false);

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
    if (user?._id && token) {
      setLoading(true);
      loadFarmerData();
    }
  }, [user?._id, token]);

  const loadFarmerData = async () => {
    try {
      // Load products and orders sequentially to ensure proper state updates
      await loadFarmerProducts();
      await loadFarmerOrders();
    } catch (error) {
      console.error('Error loading farmer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFarmerProducts = async () => {
    if (!user?._id || !token) {
      console.warn('Missing user ID or token for products fetch');
      return [];
    }

    try {
      const response = await axios.get(`http://localhost:3000/api/products/farmer/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setProducts(response.data);
      return response.data;
    } catch (error) {
      console.error('Error loading farmer products:', error);
      // Fallback to localStorage if API fails
      try {
        const allProducts = JSON.parse(localStorage.getItem('farm2home_products') || '[]');
        const farmerProducts = allProducts.filter(product => 
          product.farmer?.id === user._id || product.farmerId === user._id
        );
        setProducts(farmerProducts);
        return farmerProducts;
      } catch (e) {
        console.error("Fallback product load error", e);
        setProducts([]);
        return [];
      }
    }
  };

  const loadFarmerOrders = async () => {
    if (!user?._id || !token) {
      console.warn('Missing user ID or token for orders fetch');
      return { pending: [], all: [] };
    }

    try {
      // Get pending orders
      const pendingResponse = await axios.get(`http://localhost:3000/api/orders/farmer/${user._id}/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Get all orders
      const allResponse = await axios.get(`http://localhost:3000/api/orders/farmer/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setPendingOrders(pendingResponse.data);
      setAllOrders(allResponse.data);
      
      return { pending: pendingResponse.data, all: allResponse.data };
    } catch (error) {
      console.error('Error loading farmer orders:', error);
      // Fallback to localStorage if API fails
      try {
        const allOrders = JSON.parse(localStorage.getItem('farm2home_orders') || '[]');
        const farmerOrders = allOrders.filter(order => 
          order.farmerId === user._id
        );
        const pending = farmerOrders.filter(order => order.status === 'pending');
        const all = farmerOrders;
        
        setPendingOrders(pending);
        setAllOrders(all);
        
        return { pending, all };
      } catch (e) {
        console.error("Fallback farmer order load error", e);
        setPendingOrders([]);
        setAllOrders([]);
        return { pending: [], all: [] };
      }
    }
  };

  const handleAddProduct = async (productData) => {
    try {
      await axios.post('http://localhost:3000/api/products', productData, {
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type for FormData - let browser set it automatically
        }
      });

      await loadFarmerProducts();
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Could not add product. Please try again.');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowAddModal(true);
  };

  const handleUpdateProduct = async (productData) => {
    if (!editingProduct) return;

    try {
      await axios.put(`http://localhost:3000/api/products/${editingProduct._id || editingProduct.id}`, productData, {
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type for FormData - let browser set it automatically
        }
      });

      await loadFarmerProducts();
      setShowAddModal(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Could not update product. Please try again.');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await axios.delete(`http://localhost:3000/api/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      await loadFarmerProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Could not delete product. Please try again.');
    }
  };

  const handleConfirmOrder = async (orderId) => {
    setConfirmingOrderId(orderId);
    try {
      await axios.put(`http://localhost:3000/api/orders/${orderId}/confirm`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Reload orders
      await loadFarmerOrders();
      alert('Order confirmed successfully!');
    } catch (error) {
      console.error('Error confirming order:', error);
      alert('Could not confirm order. Please try again.');
    } finally {
      setConfirmingOrderId(null);
    }
  };

  const handleRejectOrder = async (orderId) => {
    setRejectingOrderId(orderId);
    const reason = prompt('Why are you rejecting this order?', 'Product out of stock');
    
    if (reason === null) {
      setRejectingOrderId(null);
      return;
    }

    try {
      await axios.put(`http://localhost:3000/api/orders/${orderId}/cancel`, 
        { notes: reason },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Reload orders
      await loadFarmerOrders();
      alert('Order rejected.');
    } catch (error) {
      console.error('Error rejecting order:', error);
      alert('Could not reject order. Please try again.');
    } finally {
      setRejectingOrderId(null);
    }
  };

  const clearHistory = () => {
    // Clear localStorage data
    localStorage.removeItem('farm2home_orders');
    localStorage.removeItem('farm2home_products');
    
    // Clear state
    setPendingOrders([]);
    setAllOrders([]);
    setProducts([]);
    
    // Reload data from server
    loadFarmerData();
    
    setShowClearHistoryModal(false);
    alert('History cleared successfully!');
  };

  if (!user || user.userType !== 'farmer') {
    return <Navigate to="/login" />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user.name}! 🚜
            </h1>
            <p className="text-gray-600">
              Manage your vegetables and track your orders
            </p>
          </div>
          <button 
            onClick={() => setShowClearHistoryModal(true)}
            className="flex items-center text-orange-600 hover:bg-orange-50 px-4 py-2 rounded-lg transition-colors text-sm font-semibold border border-transparent hover:border-orange-100"
          >
            <TrashIcon className="w-5 h-5 mr-2" /> Clear History
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">🥬</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{products.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-yellow-400">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-2xl">⏳</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingOrders.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">📦</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{allOrders.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{allOrders
                    .filter(o => o.status === 'confirmed' || o.status === 'shipped' || o.status === 'delivered')
                    .reduce((total, order) => total + order.totalPrice, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* My Products Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Products</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors duration-200"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Add Product</span>
            </button>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <div className="text-6xl mb-4">🥬</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No products yet
              </h3>
              <p className="text-gray-600 mb-4">
                Start by adding your first vegetable to the marketplace
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md"
              >
                Add Your First Product
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map(product => (
                <div key={product._id || product.id} className="relative">
                  <ProductCard product={product} showAddToCart={false} />
                  <div className="absolute top-2 left-2 flex space-x-1">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-1 rounded-full"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product._id)}
                      className="bg-red-600 hover:bg-red-700 text-white p-1 rounded-full"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Orders Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            ⏳ Pending Orders ({pendingOrders.length})
          </h2>
          
          {pendingOrders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                All caught up!
              </h3>
              <p className="text-gray-600">
                No pending orders. New orders will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingOrders.map(order => (
                <div key={order._id} className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-yellow-400">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Order Details</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-gray-600">Order ID:</span> <span className="font-medium">{order._id.toString().slice(-8)}</span></p>
                        <p><span className="text-gray-600">Customer:</span> <span className="font-medium">{order.customerName}</span></p>
                        <p><span className="text-gray-600">Email:</span> <span className="font-medium">{order.customerEmail}</span></p>
                        <p><span className="text-gray-600">Address:</span> <span className="font-medium">{order.customerAddress}</span></p>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Items</h3>
                      <div className="space-y-2 text-sm">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span>{item.name} × {item.quantity}kg</span>
                            <span className="font-medium">₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                        <div className="border-t pt-2 flex justify-between font-semibold">
                          <span>Total</span>
                          <span className="text-green-600">₹{order.totalPrice}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4 border-t">
                    <button
                      onClick={() => handleConfirmOrder(order._id)}
                      disabled={confirmingOrderId === order._id}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-md font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                      <CheckIcon className="w-5 h-5" />
                      <span>{confirmingOrderId === order._id ? 'Confirming...' : 'Confirm Order'}</span>
                    </button>
                    <button
                      onClick={() => handleRejectOrder(order._id)}
                      disabled={rejectingOrderId === order._id}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-md font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                      <XMarkIcon className="w-5 h-5" />
                      <span>{rejectingOrderId === order._id ? 'Rejecting...' : 'Reject'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order History Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Order History</h2>
          
          {allOrders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No orders yet
              </h3>
              <p className="text-gray-600">
                Orders will appear here when customers purchase your vegetables
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Items
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {allOrders.map(order => {
                      const statusColors = {
                        pending: 'bg-yellow-100 text-yellow-800',
                        confirmed: 'bg-blue-100 text-blue-800',
                        shipped: 'bg-purple-100 text-purple-800',
                        delivered: 'bg-green-100 text-green-800',
                        cancelled: 'bg-red-100 text-red-800'
                      };
                      
                      return (
                        <tr key={order._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{order._id.toString().slice(-6)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.customerName}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {order.items.map(item => `${item.name} (${item.quantity}kg)`).join(', ')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ₹{order.totalPrice}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[order.status]}`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Fixed Prices Info */}
        <div className="mt-8 bg-green-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800 mb-4">
            Fixed Price System 💰
          </h3>
          <p className="text-green-700 mb-4">
            All vegetables are sold at system-defined fixed prices to ensure fairness.
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

      {/* Add/Edit Product Modal */}
      {showAddModal && (
        <AddProductModal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setEditingProduct(null);
          }}
          onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}
          product={editingProduct}
          fixedPrices={fixedPrices}
        />
      )}

      {/* Clear History Confirmation Modal */}
      {showClearHistoryModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[100]">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowClearHistoryModal(false)}></div>
          <div className="bg-white rounded-2xl p-8 w-full max-w-sm text-center relative z-10 shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Clear History?</h2>
            <p className="text-gray-600 mb-6 text-sm">
              This will clear all your local order and product history data. This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button onClick={() => setShowClearHistoryModal(false)} className="flex-1 px-4 py-3 bg-gray-100 rounded-xl">Cancel</button>
              <button onClick={clearHistory} className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-xl">Clear History</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerDashboard;
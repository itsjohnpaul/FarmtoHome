import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { 
  UserIcon, 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  CameraIcon,
  ArrowLeftOnRectangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

const url = 'https://farmtohome-14jo.onrender.com';

const Profile = () => {
  const { user, token, setUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showClearHistoryModal, setShowClearHistoryModal] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user && token) {
      loadUserProfile();
      loadUserOrders();
    } else {
      setLoading(false);
    }
  }, [token, user?._id]);

  const loadUserProfile = async () => {
    try {
      const response = await axios.get(`${url}/api/users/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const userData = response.data.user;
      setUser(userData);
      localStorage.setItem('farm2home_user', JSON.stringify(userData));
      if (userData.profilePhoto) {
        setPhotoPreview(`${url}${userData.profilePhoto}`);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      if (error.response?.status === 401) logout();
    } finally {
      setLoading(false);
    }
  };

  const loadUserOrders = async () => {
    try {
      const response = await axios.get(`${url}/api/orders/customer/${user._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setOrders(response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      console.error('Error loading user orders:', error);
      // Fallback to localStorage if API fails
      try {
        const allOrders = JSON.parse(localStorage.getItem('farm2home_orders') || '[]');
        const userOrders = allOrders.filter(order => order.customerId === user?._id);
        setOrders(userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } catch (e) {
        console.error("Fallback order load error", e);
        setOrders([]);
      }
    }
  };

  const confirmLogout = () => {
    logout(); 
    setShowLogoutModal(false);
    navigate('/', { replace: true });
  };

  const clearHistory = () => {
    // Clear localStorage data
    localStorage.removeItem('farm2home_orders');
    localStorage.removeItem('farm2home_products');
    localStorage.removeItem('farm2home_cart');
    
    // Clear state
    setOrders([]);
    
    // Optionally clear database data (commented out for safety)
    // You can uncomment these if you want to also clear database records
    
    // Clear user's orders from database
    // try {
    //   await axios.delete(`${url}/api/orders/clear-history`, {
    //     headers: { 'Authorization': `Bearer ${token}` }
    //   });
    // } catch (error) {
    //   console.error('Error clearing database history:', error);
    // }
    
    setShowClearHistoryModal(false);
    alert('History cleared successfully!');
  };

  const handlePhotoChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('profilePhoto', file);
    try {
      const response = await axios.post(`${url}/api/users/upload-photo`, formData, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      const updatedUser = { ...user, profilePhoto: response.data.photoUrl };
      setUser(updatedUser);
      setPhotoPreview(`${url}${response.data.photoUrl}`);
      alert('Photo updated!');
    } catch (error) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (!user && !loading) return <Navigate to="/login" />;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8">
            <div className="relative">
              <div className="w-28 h-28 bg-green-100 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
                {uploading ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                ) : photoPreview ? (
                  <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-green-700">{user?.name?.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <label className="absolute bottom-1 right-1 bg-green-600 hover:bg-green-700 text-white p-2 rounded-full cursor-pointer shadow-lg transition-all transform hover:scale-110">
                <CameraIcon className="w-4 h-4" />
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" disabled={uploading} />
              </label>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-extrabold text-gray-900">{user?.name}</h1>
              <p className="text-green-600 font-medium capitalize mb-4">{user?.userType}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
                <div className="flex items-center justify-center md:justify-start">
                  <EnvelopeIcon className="w-4 h-4 mr-2 text-gray-400" /> {user?.email}
                </div>
                <div className="flex items-center justify-center md:justify-start">
                  <PhoneIcon className="w-4 h-4 mr-2 text-gray-400" /> {user?.phone}
                </div>
                <div className="flex items-center justify-center md:justify-start sm:col-span-2">
                  <MapPinIcon className="w-4 h-4 mr-2 text-gray-400" /> {user?.address}
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <button onClick={() => setShowLogoutModal(true)} className="flex items-center text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors text-sm font-semibold border border-transparent hover:border-red-100">
                <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-2" /> Logout
              </button>
              <button onClick={() => setShowClearHistoryModal(true)} className="flex items-center text-orange-600 hover:bg-orange-50 px-4 py-2 rounded-lg transition-colors text-sm font-semibold border border-transparent hover:border-orange-100">
                <TrashIcon className="w-5 h-5 mr-2" /> Clear History
              </button>
            </div>
          </div>
        </div>

        {/* Order History / Requests */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">
              Order History
            </h2>
          </div>

          <div className="max-h-[600px] overflow-y-auto">
            {orders.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <p className="text-lg">📦 No orders yet</p>
                <p className="text-sm italic">Your orders will appear here</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {orders.map(order => {
                  const getStatusColor = (status) => {
                    switch(status) {
                      case 'pending': return 'bg-yellow-100 text-yellow-700';
                      case 'confirmed': return 'bg-blue-100 text-blue-700';
                      case 'shipped': return 'bg-purple-100 text-purple-700';
                      case 'delivered': return 'bg-green-100 text-green-700';
                      case 'cancelled': return 'bg-red-100 text-red-700';
                      default: return 'bg-gray-100 text-gray-700';
                    }
                  };

                  const getStatusEmoji = (status) => {
                    switch(status) {
                      case 'pending': return '⏳';
                      case 'confirmed': return '✅';
                      case 'shipped': return '🚚';
                      case 'delivered': return '📦';
                      case 'cancelled': return '❌';
                      default: return '📦';
                    }
                  };

                  return (
                    <div key={order._id} className="p-8 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-bold text-gray-900">Order #{order._id.toString().slice(-6)}</h3>
                            <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${getStatusColor(order.status)}`}>
                              {getStatusEmoji(order.status)} {order.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString()}</p>
                          {order.status === 'pending' && (
                            <p className="text-sm text-yellow-600 font-medium mt-1">⏳ Waiting for farmer confirmation...</p>
                          )}
                          {order.status === 'confirmed' && (
                            <p className="text-sm text-blue-600 font-medium mt-1">✅ Farmer confirmed! Preparing shipment...</p>
                          )}
                          {order.status === 'shipped' && (
                            <p className="text-sm text-purple-600 font-medium mt-1">🚚 On the way to you!</p>
                          )}
                          {order.status === 'delivered' && (
                            <p className="text-sm text-green-600 font-medium mt-1">📦 Delivered!</p>
                          )}
                          {order.status === 'cancelled' && (
                            <p className="text-sm text-red-600 font-medium mt-1">❌ Order cancelled</p>
                          )}
                        </div>

                        <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-bold">
                          ₹{order.totalPrice}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm text-gray-600 font-medium mb-2">Items:</p>
                        {order.items.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm text-gray-600 ml-2">
                            <span>{item.name} <span className="text-gray-400">× {item.quantity}kg</span></span>
                            <span className="font-medium text-gray-800">₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-gray-200 text-sm text-gray-600">
                        <strong>Delivery to:</strong> {order.customerAddress}
                      </div>
                      <div className="mt-2 text-sm text-gray-500">
                        <strong>Farmer:</strong> {order.farmerName}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[100]">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowLogoutModal(false)}></div>
          <div className="bg-white rounded-2xl p-8 w-full max-w-sm text-center relative z-10 shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Logout?</h2>
            <div className="flex space-x-3">
              <button onClick={() => setShowLogoutModal(false)} className="flex-1 px-4 py-3 bg-gray-100 rounded-xl">Cancel</button>
              <button onClick={confirmLogout} className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl">Logout</button>
            </div>
          </div>
        </div>
      )}

      {/* Clear History Confirmation Modal */}
      {showClearHistoryModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[100]">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowClearHistoryModal(false)}></div>
          <div className="bg-white rounded-2xl p-8 w-full max-w-sm text-center relative z-10 shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Clear History?</h2>
            <p className="text-gray-600 mb-6 text-sm">
              This will clear all your local order history and cart data. This action cannot be undone.
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

export default Profile;

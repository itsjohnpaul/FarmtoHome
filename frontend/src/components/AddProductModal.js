import React, { useState, useEffect } from 'react';
import { XMarkIcon, CameraIcon } from '@heroicons/react/24/outline';
const url = 'http://localhost:3000';

const AddProductModal = ({ isOpen, onClose, onSubmit, product, fixedPrices }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'tomato',
    quantity: '',
    description: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        category: product.category,
        quantity: product.quantity,
        description: product.description
      });
      // Set image preview if product has an image
      if (product.image) {
        setImagePreview(product.image.startsWith('http') ? product.image : `${url}${product.image}`);
      }
    } else {
      setFormData({
        name: '',
        category: 'tomato',
        quantity: '',
        description: ''
      });
      setSelectedImage(null);
      setImagePreview(null);
    }
  }, [product]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setUploading(true);

    if (!formData.name || !formData.quantity || !formData.description) {
      setError('Please fill in all required fields');
      setUploading(false);
      return;
    }

    if (formData.quantity <= 0) {
      setError('Quantity must be greater than 0');
      setUploading(false);
      return;
    }

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('category', formData.category);
      submitData.append('price', fixedPrices[formData.category]);
      submitData.append('quantity', parseInt(formData.quantity));
      submitData.append('description', formData.description);

      if (selectedImage) {
        submitData.append('image', selectedImage);
      }

      await onSubmit(submitData);
      onClose();
    } catch (error) {
      setError('Failed to save product. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const categories = [
    { value: 'tomato', label: 'Tomato' },
    { value: 'onion', label: 'Onion' },
    { value: 'potato', label: 'Potato' },
    { value: 'carrot', label: 'Carrot' },
    { value: 'cabbage', label: 'Cabbage' },
    { value: 'cauliflower', label: 'Cauliflower' },
    { value: 'spinach', label: 'Spinach' },
    { value: 'broccoli', label: 'Broccoli' },
    { value: 'cucumber', label: 'Cucumber' },
    { value: 'capsicum', label: 'Capsicum' },
    { value: 'eggplant', label: 'Eggplant' },
    { value: 'okra', label: 'Okra' }
  ];



  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
              placeholder="e.g., Fresh Tomatoes"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              id="category"
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label} - ₹{fixedPrices[category.value]}/kg
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
              Available Quantity (kg) *
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              required
              min="1"
              value={formData.quantity}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
              placeholder="e.g., 50"
            />
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
              Product Image
            </label>
            <div className="space-y-2">
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    className="w-32 h-32 object-cover rounded-md border"
                  />
                </div>
              )}
              <p className="text-xs text-gray-500">
                Upload an image or leave empty to use default image for the selected category
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
              placeholder="Describe your product..."
            />
          </div>

          <div className="bg-green-50 p-4 rounded-md">
            <p className="text-sm text-green-700">
              <strong>Fixed Price:</strong> ₹{fixedPrices[formData.category]}/kg
            </p>
            <p className="text-xs text-green-600 mt-1">
              Prices are fixed by the system to ensure fairness for all users.
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
            >
              {product ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
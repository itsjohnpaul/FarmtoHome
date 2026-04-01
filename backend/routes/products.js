const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Product = require('../models/Product');
const { authenticateToken, requireFarmer } = require('../middleware/auth');

// Configure multer for product image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/products/"); // Save product images to uploads/products directory
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, "product-" + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  }
});

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error fetching products' });
  }
});

// Get single product by id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server error fetching product' });
  }
});

// Create new product (farmers only)
router.post('/', authenticateToken, requireFarmer, upload.single('image'), async (req, res) => {
  try {
    const { name, category, price, quantity, description } = req.body;
    if (!name || !category || !price || quantity == null || !description) {
      return res.status(400).json({ message: 'Missing required product fields' });
    }

    // Use uploaded file path or default image
    let imageUrl;
    if (req.file) {
      imageUrl = `/uploads/products/${req.file.filename}`;
    } else {
      // Fallback to default image based on category
      const defaultImages = {
        tomato: 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=400',
        onion: 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=400',
        potato: 'https://images.pexels.com/photos/144248/potatoes-vegetables-erdfrucht-bio-144248.jpeg?auto=compress&cs=tinysrgb&w=400',
        carrot: 'https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg?auto=compress&cs=tinysrgb&w=400',
        cabbage: 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=400',
        cauliflower: 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=400',
        spinach: 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=400',
        broccoli: 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=400',
        cucumber: 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=400',
        capsicum: 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=400',
        eggplant: 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=400',
        okra: 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=400'
      };
      imageUrl = defaultImages[category] || defaultImages.tomato;
    }

    const farmer = {
      id: req.user._id,
      name: req.user.name,
      location: req.user.address,
      avatar: req.user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    };

    const newProduct = new Product({
      name,
      category,
      price,
      quantity,
      image: imageUrl,
      description,
      farmer
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Server error creating product' });
  }
});

// Update product by id (farmers only - own products)
router.put('/:id', authenticateToken, requireFarmer, upload.single('image'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Check if the product belongs to the authenticated farmer
    if (String(product.farmer.id) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Access denied. You can only edit your own products.' });
    }

    const updates = { ...req.body };

    // If a new image was uploaded, update the image path
    if (req.file) {
      updates.image = `/uploads/products/${req.file.filename}`;
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error updating product' });
  }
});

// Delete product by id (farmers only - own products)
router.delete('/:id', authenticateToken, requireFarmer, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Check if the product belongs to the authenticated farmer
    if (String(product.farmer.id) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Access denied. You can only delete your own products.' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error deleting product' });
  }
});

// Get products by farmer (for farmer dashboard)
router.get('/farmer/:farmerId', authenticateToken, async (req, res) => {
  try {
    // Allow farmers to see their own products, or customers to see any farmer's products
    if (req.user.userType === 'farmer' && String(req.params.farmerId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Access denied. Farmers can only view their own products.' });
    }

    const products = await Product.find({ 'farmer.id': req.params.farmerId }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error('Error fetching farmer products:', error);
    res.status(500).json({ message: 'Server error fetching farmer products' });
  }
});

module.exports = router;
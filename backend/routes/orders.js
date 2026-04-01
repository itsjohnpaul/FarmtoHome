const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { authenticateToken } = require('../middleware/auth');

// Place a new order (customer)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { items, totalPrice, farmerId, farmerName } = req.body;

    if (!items || !totalPrice || !farmerId || !farmerName) {
      return res.status(400).json({ message: 'Missing required order fields' });
    }

    const newOrder = new Order({
      customerId: req.user._id,
      customerName: req.user.name,
      customerEmail: req.user.email,
      customerAddress: req.user.address,
      farmerId,
      farmerName,
      items,
      totalPrice,
      status: 'pending'
    });

    const savedOrder = await newOrder.save();
    res.status(201).json({
      message: 'Order placed successfully. Waiting for farmer confirmation.',
      order: savedOrder
    });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ message: 'Error placing order' });
  }
});

// Get customer's orders
router.get('/customer/:customerId', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.params.customerId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// Get farmer's pending orders (orders waiting for confirmation)
router.get('/farmer/:farmerId/pending', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ 
      farmerId: req.params.farmerId,
      status: 'pending'
    }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching farmer pending orders:', error);
    res.status(500).json({ message: 'Error fetching pending orders' });
  }
});

// Get all farmer's orders (including history)
router.get('/farmer/:farmerId', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ farmerId: req.params.farmerId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching farmer orders:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// Confirm order (farmer)
router.put('/:orderId/confirm', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending orders can be confirmed' });
    }

    order.status = 'confirmed';
    order.confirmedAt = new Date();

    const updatedOrder = await order.save();
    res.json({
      message: 'Order confirmed successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error confirming order:', error);
    res.status(500).json({ message: 'Error confirming order' });
  }
});

// Reject/Cancel order (farmer)
router.put('/:orderId/cancel', authenticateToken, async (req, res) => {
  try {
    const { notes } = req.body;
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending orders can be cancelled' });
    }

    order.status = 'cancelled';
    order.notes = notes || 'Order cancelled by farmer';

    const updatedOrder = await order.save();
    res.json({
      message: 'Order cancelled',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ message: 'Error cancelling order' });
  }
});

// Mark order as shipped (farmer)
router.put('/:orderId/shipped', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'confirmed') {
      return res.status(400).json({ message: 'Only confirmed orders can be shipped' });
    }

    order.status = 'shipped';
    const updatedOrder = await order.save();
    res.json({
      message: 'Order marked as shipped',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error shipping order:', error);
    res.status(500).json({ message: 'Error shipping order' });
  }
});

// Mark order as delivered (farmer or system)
router.put('/:orderId/delivered', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = 'delivered';
    order.deliveredAt = new Date();
    const updatedOrder = await order.save();
    res.json({
      message: 'Order marked as delivered',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error delivering order:', error);
    res.status(500).json({ message: 'Error delivering order' });
  }
});

module.exports = router;

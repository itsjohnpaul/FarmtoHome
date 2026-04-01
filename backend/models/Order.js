const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  customerId: { type: String, required: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerAddress: { type: String, required: true },
  farmerId: { type: String, required: true },
  farmerName: { type: String, required: true },
  items: [{
    id: String,
    name: String,
    category: String,
    price: Number,
    quantity: Number,
    image: String
  }],
  totalPrice: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  notes: String,
  createdAt: { type: Date, default: Date.now },
  confirmedAt: Date,
  deliveredAt: Date
});

module.exports = mongoose.model('Order', OrderSchema);

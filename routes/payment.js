const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const connectDB = require('../config/database');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const User = require('../models/User');

// Ensure DB connection for serverless
router.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Payment route DB error:', error);
    next(error);
  }
});

// Lazy Razorpay initialization (for serverless)
let razorpayInstance = null;
function getRazorpay() {
  if (!razorpayInstance) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay credentials not configured');
    }
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  }
  return razorpayInstance;
}

// Create payment order
router.post('/create-order', auth, async (req, res) => {
  try {
    // Log environment check
    console.log('ENV CHECK - RAZORPAY_KEY_ID exists:', !!process.env.RAZORPAY_KEY_ID);
    console.log('ENV CHECK - RAZORPAY_KEY_SECRET exists:', !!process.env.RAZORPAY_KEY_SECRET);
    
    // Check if Razorpay is configured
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ 
        success: false, 
        message: 'Payment service not configured. Missing credentials.' 
      });
    }

    // Create Razorpay instance directly (avoid caching issues in serverless)
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    
    const amount = 500; // ₹5.00 (amount in paise)
    
    const options = {
      amount: amount,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      notes: {
        userId: req.user._id.toString()
      }
    };

    console.log('Creating Razorpay order...');
    const order = await razorpay.orders.create(options);
    console.log('Razorpay order created:', order.id);
    
    // Save payment record
    const payment = new Payment({
      userId: req.user._id,
      razorpayOrderId: order.id,
      amount: amount,
      status: 'pending'
    });
    await payment.save();

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Payment error:', error);
    // Return detailed error for debugging
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Unknown error',
      error: error.error ? error.error.description : undefined
    });
  }
});

// Verify payment
router.post('/verify', auth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    if (generatedSignature === razorpay_signature) {
      // Payment verified - update user and payment records
      const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
      
      if (payment && payment.userId.toString() === req.user._id.toString()) {
        payment.razorpayPaymentId = razorpay_payment_id;
        payment.razorpaySignature = razorpay_signature;
        payment.status = 'completed';
        await payment.save();

        const user = await User.findById(req.user._id);
        user.paymentCompleted = true;
        user.paymentId = razorpay_payment_id;
        await user.save();

        return res.json({ success: true, message: 'Payment verified successfully' });
      }
      
      return res.status(400).json({ success: false, message: 'Payment record not found' });
    } else {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ success: false, message: 'Error verifying payment' });
  }
});

// Check payment status
router.get('/status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ 
      paymentCompleted: user.paymentCompleted,
      paymentId: user.paymentId 
    });
  } catch (error) {
    console.error('Payment status error:', error);
    res.status(500).json({ success: false, message: 'Error checking payment status' });
  }
});

module.exports = router;


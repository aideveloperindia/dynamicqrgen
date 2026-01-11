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
    console.error('Payment route DB error:', error.message);
    // Don't crash - continue anyway, routes will handle DB errors individually
    next();
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

// Get UPI payment URL - simple, no amount (user enters any amount)
router.get('/upi-url', auth, async (req, res) => {
  try {
    const upiId = process.env.UPI_ID || 'nad.nandagiri-3@okicici';
    const payeeName = process.env.UPI_PAYEE_NAME || 'QR Connect';
    // No amount - user enters any amount they want
    const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&cu=INR`;
    
    res.json({ 
      success: true, 
      upiUrl: upiUrl 
    });
  } catch (error) {
    console.error('UPI URL error:', error);
    res.status(500).json({ success: false, message: 'Error getting UPI URL' });
  }
});

// Simplified payment - mark as paid (for testing, will integrate Razorpay later)
router.post('/pay', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (user.subscriptionActive && new Date(user.subscriptionEndDate) > new Date()) {
      return res.status(400).json({ 
        success: false, 
        message: 'You already have an active subscription' 
      });
    }

    // Mark payment as completed and activate subscription
    const now = new Date();
    const oneYearLater = new Date(now);
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

    user.paymentCompleted = true;
    user.subscriptionActive = true;
    user.subscriptionStartDate = now;
    user.subscriptionEndDate = oneYearLater;
    user.subscriptionAmount = 999; // ₹999/year
    user.paymentId = `manual_${Date.now()}`; // Temporary ID

    await user.save();

    // Save payment record (optional - don't fail if Payment model has issues)
    try {
      const payment = new Payment({
        userId: user._id,
        razorpayOrderId: user.paymentId,
        amount: 99900, // ₹999 in paise
        status: 'completed',
        razorpayPaymentId: user.paymentId,
        razorpaySignature: 'manual_payment'
      });
      await payment.save();
    } catch (paymentError) {
      // Log but don't fail the payment if Payment record save fails
      console.warn('Payment record save failed (non-critical):', paymentError.message);
    }

    res.json({
      success: true,
      message: 'Payment successful! Your subscription is active for 1 year.',
      subscriptionEndDate: oneYearLater,
      subscriptionStartDate: now
    });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Payment processing failed: ' + error.message
    });
  }
});

// Create payment order (for future Razorpay integration)
router.post('/create-order', auth, async (req, res) => {
  try {
    // Check if Razorpay is configured
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      // Fallback to manual payment
      return res.status(200).json({ 
        success: true,
        useManualPayment: true,
        message: 'Use /payment/pay endpoint for now'
      });
    }

    // Create Razorpay instance directly (avoid caching issues in serverless)
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    
    const amount = 99900; // ₹999.00 (amount in paise)
    
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

// Check payment/subscription status
router.get('/status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const now = new Date();
    const isActive = user.subscriptionActive && new Date(user.subscriptionEndDate) > now;
    
    res.json({ 
      paymentCompleted: user.paymentCompleted,
      subscriptionActive: isActive,
      subscriptionEndDate: user.subscriptionEndDate,
      paymentId: user.paymentId 
    });
  } catch (error) {
    console.error('Payment status error:', error);
    res.status(500).json({ success: false, message: 'Error checking payment status' });
  }
});

module.exports = router;


import Razorpay from "razorpay";
import crypto from "crypto";
import { PLANS } from "../config/plan.js";
import userModel from "../models/user.model.js";

console.log(
  "RAZORPAY_KEY_ID from env:",
  process.env.RAZORPAY_KEY_ID ? "✅ Loaded" : "❌ Undefined",
);
console.log(
  "RAZORPAY_KEY_SECRET from env:",
  process.env.RAZORPAY_KEY_SECRET ? "✅ Loaded" : "❌ Undefined",
);

// Initialize Razorpay - Simple & Correct for your case
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Order
export const createOrder = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res
        .status(401)
        .json({ success: false, message: "User authentication failed" });
    }
    const { amount, currency = "INR", planType } = req.body;
    const userId = req.user?._id;

    if (!amount || !planType) {
      return res.status(400).json({
        success: false,
        message: "Amount and planType are required",
      });
    }

    // Get plan from your PLANS config
    const selectedPlan = PLANS[planType];

    if (!selectedPlan) {
      return res.status(400).json({
        success: false,
        message: `Invalid plan type: ${planType}`,
      });
    }

    const options = {
      amount: Number(amount) * 100,
      currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: userId?.toString() || "guest",
        planType: planType,
        planName: selectedPlan.plan || selectedPlan.name,
        credits: selectedPlan.credits,
      },
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      order,
      plan: selectedPlan,
    });
  } catch (error) {
    console.error("Razorpay Order Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create payment order",
      error: error.message,
    });
  }
};

// Verify Payment
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
    const userId = req.user?._id;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment details",
      });
    }

    // Verify Razorpay signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid signature - Payment verification failed",
      });
    }

    // Fetch order to get credits amount from notes
    const order = await razorpay.orders.fetch(razorpay_order_id);
    const creditsToAdd = parseInt(order.notes?.credits) || 0;

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "User not authenticated" });
    }

    // Update user's credits
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { $inc: { credits: creditsToAdd } }, // Increment credits safely
      { new: true },
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    console.log(
      `✅ Credits added: ${creditsToAdd} | New total: ${updatedUser.credits}`,
    );

    res.status(200).json({
      success: true,
      message: "Payment verified and credits updated successfully",
      creditsAdded: creditsToAdd,
      totalCredits: updatedUser.credits,
    });
  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({
      success: false,
      message: "Error processing payment verification",
      error: error.message,
    });
  }
};
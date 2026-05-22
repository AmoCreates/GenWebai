import express from 'express';
import { createOrder, verifyPayment } from '../controllers/paymentController.js';
import isLoggedIn from '../middlewares/isLoggedIn.js';

const paymentRouter = express.Router();

// Create Order
paymentRouter.post('/create-order', isLoggedIn, createOrder);
// Verify Payment
paymentRouter.post('/verify-payment',isLoggedIn, verifyPayment);

export default paymentRouter;
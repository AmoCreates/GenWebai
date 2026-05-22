// Import Libraries
import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser';
import cors from 'cors';
import 'dotenv/config';
dotenv.config({path: './.env'});

// Import Database Connection and Routes
import dbConnection from './config/db.js';
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRouter.js';
import websiteRouter from './routes/websiteRouter.js';
import paymentRouter from './routes/paymentRouter.js';


// Initialize Express App
const app = express();
const port = process.env.PORT || 10000;

// Middleware Configuration
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"]
}))

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/website', websiteRouter);
app.use('/api/payment', paymentRouter);

// Start Server and Connect to Database
app.listen(port, async ()=> {
    await dbConnection();
    console.log(`server ready, listening at ${port}`)
})
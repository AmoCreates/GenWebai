// Import express and middleware
import express from "express";
import isLoggedIn from "../middlewares/isLoggedIn.js";
import { getCurrentUser } from "../controllers/userController.js";

// Initialize user router
const userRouter = express.Router();

// Protected route to get current user info
userRouter.get("/me", isLoggedIn, getCurrentUser);

export default userRouter;
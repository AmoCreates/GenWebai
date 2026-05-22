// Import express framework
import express from "express";
// Import auth controller functions
import { googleAuth, logout } from "../controllers/authController.js";

// Initialize auth router
const authRouter = express.Router();

// Define routes for signup and logout
authRouter.post("/signup", googleAuth);
authRouter.get("/logout", logout);

export default authRouter;
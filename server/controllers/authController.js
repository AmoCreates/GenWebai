// Import models and utilities
import userModel from "../models/user.model.js";
import bcrypt from 'bcrypt'
import generateToken from "../utils/generateToken.js";
import Joi from "joi"

// Google Auth Controller (Signup/Login)
export const googleAuth = async (req, res) => {
    // Define validation schema
    const schema = Joi.object({
        name: Joi.string().min(3).max(30).required(),
        email: Joi.string().email().required(),
        avatar: Joi.string(),
    });

    // Validate request body
    const { error } = schema.validate(req.body);
    
    if (error) {
        return res.status(400).json({ message: error.message });
    }

    try {
        const {name, email, avatar} = req.body;

        // Check if user exists, if not create new user
        let user = await userModel.findOne({ email });
        if(!user) {
            user = await userModel.create({
                name,
                email,
                avatar,
            });
        } 

        // Generate JWT Token and set Cookie
        const token = await generateToken(user._id);
        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 3600 * 1000
        });

        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({message: `authentication error ${error}`})
    }
}

// Logout Controller
export const logout = async (req, res) => {
   try {
        // Clear the auth cookie
        res.clearCookie('token', {
            httpOnly: true,
            sameSite: "none",
            secure: true
        });
        return res.status(200).json({message: "log out successfully"})
    } catch (error) {
        return res.status(500).json({message: `something went wrong!! try again ${error}`})
    }
}

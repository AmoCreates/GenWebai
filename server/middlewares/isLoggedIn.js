import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";

const isLoggedIn = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token)
    return res
      .status(401)
      .json({ message: "Token not found! you need to login first" });

  try {
    const decode = jwt.verify(token, process.env.JWT_KEY);
    req.user = await userModel.findById(decode.userId).select("-password");
    if (!req.user) return res.status(401).json({ message: "user not found" });
    next();
  } catch (error) {
    return res.status(401).json({ message: "not authorized" });
  }
};

export default isLoggedIn;
import userModel from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
// import { transporter } from "../forgetpasswordemail.js";

dotenv.config();
export const userRegister = async (req, res) => {
  try {
    const { fullname, username, email, phone, password, role, secretKey } =
      req.body;

    // Check if the role is admin and validate the secret key
    if (role === "admin" && secretKey !== process.env.ADMIN_SECRET_KEY) {
      return res
        .status(401)
        .json({ message: "Invalid secret key for admin registration" });
    }

    const oldUser = await userModel.findOne({ username });
    if (oldUser) {
      return res
        .status(401)
        .json({ message: "Registration Number already exists" });
    }

    const hashPassword = await bcrypt.hash(password, 12);
    const newUser = await userModel.create({
      fullname,
      username,
      email,
      phone,
      password: hashPassword,
      role,
    });

    res
      .status(201)
      .json({ message: "Student registered successfully.", newUser });
  } catch (error) {
    res.status(400).json({ message: "Error registering User.", error });
  }
};
export const login = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const secret = process.env.JWT_SECRET;

    const oldUser = await userModel.findOne({ username });
    if (!oldUser) {
      return res.status(401).json({ message: "Wrong Username" });
    }
    if (oldUser.role !== role) {
      return res.status(401).json({ message: "Invalid role" });
    }

    const checkPassword = await bcrypt.compare(password, oldUser.password);
    if (!checkPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: oldUser._id, role: oldUser.role }, secret, {
      expiresIn: "1h",
    });
    const formattedResult = {
      id: oldUser._id,
      username: oldUser.username,
      fullname: oldUser.fullname,
      role: oldUser.role,
    };

    res.status(200).json({ result: formattedResult, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const findUsers = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      const searchRegex = new RegExp(search, "i");
      query = {
        $or: [
          { userId: searchRegex },
          { fullname: searchRegex },
          { username: searchRegex },
          { email: searchRegex },
        ],
      };
    }

    const users = await userModel.find(query, "userId fullname username email");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users.", error });
  }
};

export const getUserDashboard = async (req, res) => {
  try {
    const userId = req.params.userId; // Assuming you're using middleware to attach user info to req
    const user = await userModel.findById(userId).select("-password"); // Exclude the password field

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const userLikedSavedPosts = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the user and populate liked and saved posts
    const user = await userModel
      .findById(userId)
      .populate("likedPosts")
      .populate("savedPosts");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send liked and saved posts back to client
    res.json({
      likedPosts: user.likedPosts,
      savedPosts: user.savedPosts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

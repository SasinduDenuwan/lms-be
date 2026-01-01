import { User } from "../models/user.model";
import { Role } from "../models/user.model";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { AUTHRequest } from "../middleware/auth.middleware";
import cloudinary from "../config/cloudinary.config";

export const addStudent = async (req: Request, res: Response) => {
  try {
    const { email, password, firstname, lastname } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email exists" });
    }

    const hash = await bcrypt.hash(password, 10);

    //   new User()
    const user = await User.create({
      email,
      password: hash,
      firstname,
      lastname,
      roles: [Role.USER],
    });

    res.status(201).json({
      message: "User registed",
      data: { email: user.email, roles: user.roles },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Internal; server error",
    });
  }
};

export const getStudents = async (req: Request, res: Response) => {
  try {
    const users = await User.find({ roles: Role.USER, isActive: true }).select("-password");
    res.status(200).json({
      message: "success",
      data: users,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};  

export const updateStudent = async (req: Request, res: Response) => {
  try {
    const { email, password, firstname, lastname } = req.body;
    const user = await User.findById(req.params.studentId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    if (email) user.email = email;
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      user.password = hash;
    }
    if (firstname) user.firstname = firstname;
    if (lastname) user.lastname = lastname;

    await user.save();
    res.status(200).json({
      message: "User updated",
      data: user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getUserProfile = async (req: AUTHRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(req.user.sub).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User profile fetched successfully",
      data: user,
    });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const updateUserProfile = async (req: AUTHRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { firstname, lastname } = req.body;
    
    // Find user
    const user = await User.findById(req.user.sub);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    let imageUrl = user.profilePicLink;

    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      const cldRes = await cloudinary.uploader.upload(dataURI, {
        folder: "students",
      });
      imageUrl = cldRes.secure_url;
    }

    // Update fields
    if (firstname) user.firstname = firstname;
    if (lastname) user.lastname = lastname;
    if (imageUrl) user.profilePicLink = imageUrl;

    await user.save();

    res.status(200).json({
      message: "User profile updated successfully",
      data: user,
    });
  } catch (err) {
    console.error("Error updating user profile:", err);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const changeUserPassword = async (req: AUTHRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" });
    }

    const user = await User.findById(req.user.sub);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // specific check for current password
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return res.status(400).json({ message: "Invalid current password" });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    user.password = hash;
    await user.save();

    res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (err) {
    console.error("Error changing user password:", err);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.studentId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.isActive = false;
    await user.save();
    res.status(200).json({
      message: "User deleted",
      data: user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};
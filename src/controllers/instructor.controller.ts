import { AUTHRequest } from "../middleware/auth.middleware";
import { Response } from "express";
import { Instructor } from "../models/instructor.model";
import cloudinary from "../config/cloudinary.config";

export const getInstructors = async (req: AUTHRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ code: 401, message: "Unauthorized" });
    }

    const instructors = await Instructor.find({ isActive: true });

    return res.status(200).json({
      code: 200,
      message: "All instructors fetched successfully",
      data: instructors,
    });
  } catch (error) {
    console.error("Error fetching instructors:", error);
    return res.status(500).json({ code: 500, message: "Server Error" });
  }
};

export const addInstructor = async (req: AUTHRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ code: 401, message: "Unauthorized" });
    }
    const { name, role, experience, students, courses, bio } = req.body;
    let imageUrl = "";

    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      const cldRes = await cloudinary.uploader.upload(dataURI, {
        folder: "instructors",
      });
      imageUrl = cldRes.secure_url;
    }

    const newInstructor = new Instructor({
      name,
      role,
      experience,
      students,
      courses,
      image: imageUrl,
      bio,
    });
    const savedInstructor = await newInstructor.save();

    return res.status(201).json({
      code: 201,
      message: "Instructor added successfully",
      data: savedInstructor,
    });
  } catch (error) {
    console.error("Error adding instructor:", error);
    return res.status(500).json({ code: 500, message: "Server Error" });
  }
};

export const updateInstructor = async (req: AUTHRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ code: 401, message: "Unauthorized" });
    }
    const { instructorId } = req.params;
    const { name, role, experience, students, courses, bio } = req.body;

    const instructor = await Instructor.findById(instructorId);
    if (!instructor) {
      return res.status(404).json({ code: 404, message: "Instructor not found" });
    }

    let imageUrl = instructor.image;

    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      const cldRes = await cloudinary.uploader.upload(dataURI, {
        folder: "instructors",
      });
      imageUrl = cldRes.secure_url;
    }

    instructor.name = name || instructor.name;
    instructor.role = role || instructor.role;
    instructor.experience = experience || instructor.experience;
    instructor.students = students || instructor.students;
    instructor.courses = courses || instructor.courses;
    instructor.image = imageUrl;
    instructor.bio = bio || instructor.bio;

    const updatedInstructor = await instructor.save();

    return res.status(200).json({
      code: 200,
      message: "Instructor updated successfully",
      data: updatedInstructor,
    });
  } catch (error) {
    console.error("Error updating instructor:", error);
    return res.status(500).json({ code: 500, message: "Server Error" });
  }
};

export const deleteInstructor = async (req: AUTHRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ code: 401, message: "Unauthorized" });
    }
    const { instructorId } = req.params;

    const instructor = await Instructor.findById(instructorId);
    if (!instructor) {
      return res.status(404).json({ code: 404, message: "Instructor not found" });
    }

    instructor.isActive = false;
    await instructor.save();

    return res.status(200).json({
      code: 200,
      message: "Instructor deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting instructor:", error);
    return res.status(500).json({ code: 500, message: "Server Error" });
  }
};
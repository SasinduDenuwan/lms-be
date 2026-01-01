import { AUTHRequest } from "../middleware/auth.middleware";
import { Response } from "express";
import { Course } from "../models/course.model";
import { CourseVideo } from "../models/course_video.model";
import { CourseResource } from "../models/course_resource.model";
import { StudentCourse } from "../models/student_courses";
import cloudinary from "../config/cloudinary.config";
import { Instructor } from "../models/instructor.model";

export const getAllCourses = async (req: AUTHRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ code: 401, message: "Unauthorized" });
    }

    const courses = await Course.find({}).populate("instructor", "name _id image role experience");

    return res.status(200).json({
      code: 200,
      message: "All courses fetched successfully",
      data: courses,
    });

  } catch (error) {
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
}

export const addCourse = async (req: AUTHRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ code: 401, message: "Unauthorized" });
    }

    let imageUrl = "";

    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      const cldRes = await cloudinary.uploader.upload(dataURI, {
        folder: "courses",
      });
      imageUrl = cldRes.secure_url;
    }

    const courseData = {
      ...req.body,
      image: imageUrl,
    };


    console.log(courseData);

    const course = await Course.create(courseData);

    if (course.instructor) {
      await Instructor.findByIdAndUpdate(course.instructor, { $inc: { courses: 1 } });
    }

    // Parse and save videos
    if (req.body.videos) {
      let videos = [];
      try {
        videos = JSON.parse(req.body.videos);
      } catch (e) {
        console.error("Error parsing videos JSON", e);
      }

      if (Array.isArray(videos) && videos.length > 0) {
        const videoDocs = videos.map((v: any) => ({
          ...v,
          course_id: course._id,
        }));
        await CourseVideo.insertMany(videoDocs);
      }
    }

    // Parse and save resources
    if (req.body.resources) {
      let resources = [];
      try {
        resources = JSON.parse(req.body.resources);
      } catch (e) {
        console.error("Error parsing resources JSON", e);
      }

      if (Array.isArray(resources) && resources.length > 0) {
        const resourceDocs = resources.map((r: any) => ({
          ...r,
          course_id: course._id,
        }));
        await CourseResource.insertMany(resourceDocs);
      }
    }

    return res.status(201).json({
      code: 201,
      message: "Course added successfully",
      data: course,
    });

  } catch (error) {
    console.error("Error adding course:", error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
} 

export const deleteCourse = async (req: AUTHRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ code: 401, message: "Unauthorized" });
    }

    const course = await Course.findByIdAndDelete(req.params.courseId);

    return res.status(200).json({
      code: 200,
      message: "Course deleted successfully",
      data: course,
    });

  } catch (error) {
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
} 

export const updateCourse = async (req: AUTHRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ code: 401, message: "Unauthorized" });
    }

    const { courseId } = req.params;
    const existingCourse = await Course.findById(courseId);

    if (!existingCourse) {
      return res.status(404).json({ code: 404, message: "Course not found" });
    }

    let imageUrl = existingCourse.image; // Keep existing image by default

    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      const cldRes = await cloudinary.uploader.upload(dataURI, {
        folder: "courses",
      });
      imageUrl = cldRes.secure_url;
    }

    const updateData = {
      ...req.body,
      image: imageUrl,
    };

    console.log(updateData);

    const course = await Course.findByIdAndUpdate(courseId, updateData, { new: true });

    // Handle videos update (Delete all and re-insert)
    if (req.body.videos) {
      let videos = [];
      try {
        videos = JSON.parse(req.body.videos);
      } catch (e) {
        console.error("Error parsing videos JSON", e);
      }

      if (Array.isArray(videos)) {
        await CourseVideo.deleteMany({ course_id: courseId });
        if (videos.length > 0) {
          const videoDocs = videos.map((v: any) => ({
            ...v,
            course_id: courseId,
          }));
          await CourseVideo.insertMany(videoDocs);
        }
      }
    }

    // Handle resources update (Delete all and re-insert)
    if (req.body.resources) {
      let resources = [];
      try {
        resources = JSON.parse(req.body.resources);
      } catch (e) {
        console.error("Error parsing resources JSON", e);
      }

      if (Array.isArray(resources)) {
        await CourseResource.deleteMany({ course_id: courseId });
        if (resources.length > 0) {
          const resourceDocs = resources.map((r: any) => ({
            ...r,
            course_id: courseId,
          }));
          await CourseResource.insertMany(resourceDocs);
        }
      }
    }

    return res.status(200).json({
      code: 200,
      message: "Course updated successfully",
      data: course,
    });

  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
}

export const getAllCoursesAdmin = async (req: AUTHRequest, res: Response) =>{
  try {
    if (!req.user) {
      return res.status(401).json({ code: 401, message: "Unauthorized" });
    }

    const courses = await Course.find({})
      .populate("instructor")
      .populate("videos")
      .populate("resources");

    return res.status(200).json({
      code: 200,
      message: "All courses fetched successfully",
      data: courses,
    });
    
  } catch (error) {
    console.log(error)
    res.status(500).json({ code: 500, message: "Internal Server Error" });
    
  }
}

export const getCoursesUser = async (req: AUTHRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ code: 401, message: "Unauthorized" });
    }

    const userId = req.params.userId;

    const studentCourses = await StudentCourse.find({ user_id: userId });
    const courseIds = studentCourses.map(sc => sc.course_id);

    const courses = await Course.find({ _id: { $in: courseIds } })
      .populate("instructor", "name _id image role experience")
      .populate("videos")
      .populate("resources");

    return res.status(200).json({
      code: 200,
      message: "User courses fetched successfully",
      data: courses,
    });
    
  } catch (error) {
    console.log(error)
    res.status(500).json({ code: 500, message: "Internal Server Error" });
    
  }
}
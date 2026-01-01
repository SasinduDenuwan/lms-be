import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { addCourse, getAllCourses, updateCourse, deleteCourse, getAllCoursesAdmin, getCoursesUser } from "../controllers/course.controller";
import { requireRole } from "../middleware/role.middleware";
import { Role } from "../models/user.model";
import { upload } from "../middleware/upload.middleware";

const router = Router();

router.post("/add-course", authenticate, requireRole([Role.ADMIN, Role.USER]), upload.single("image"), addCourse);
router.get("/get-all-courses", authenticate, requireRole([Role.ADMIN, Role.USER]), getAllCourses);
router.put("/update-course/:courseId", authenticate, requireRole([Role.ADMIN]), upload.single("image"), updateCourse);
router.delete("/delete-course/:courseId", authenticate, requireRole([Role.ADMIN]), deleteCourse);
router.get("/get-all-courses-admin", authenticate, requireRole([Role.ADMIN, Role.USER]), getAllCoursesAdmin)
router.get("/get-courses-user/:userId", authenticate, requireRole([Role.USER, Role.ADMIN]), getCoursesUser)

export default router;
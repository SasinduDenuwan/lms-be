import { Router } from "express";
import { addStudent, getStudents, updateStudent, deleteStudent, getUserProfile, updateUserProfile, changeUserPassword } from "../controllers/student.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { Role } from "../models/user.model";
import { upload } from "../middleware/upload.middleware";

const router = Router();

router.post("/add-student", authenticate, requireRole([Role.ADMIN, Role.USER]), addStudent);

router.get("/get-all-students", authenticate, requireRole([Role.ADMIN, Role.USER]), getStudents);

router.put("/update-student/:studentId", authenticate, requireRole([Role.ADMIN, Role.USER]), updateStudent);

router.delete("/delete-student/:studentId", authenticate, requireRole([Role.ADMIN, Role.USER]), deleteStudent);

// Profile Routes
router.get("/profile", authenticate, requireRole([Role.ADMIN, Role.USER, Role.STUDENT]), getUserProfile);
router.put("/profile", authenticate, requireRole([Role.ADMIN, Role.USER, Role.STUDENT]), upload.single("profilePic"), updateUserProfile);
router.put("/change-password", authenticate, requireRole([Role.ADMIN, Role.USER, Role.STUDENT]), changeUserPassword);

export default router;
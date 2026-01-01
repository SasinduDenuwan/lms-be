import { Router } from "express";
import { addInstructor, getInstructors, updateInstructor, deleteInstructor } from "../controllers/instructor.controller";
import { authenticate } from "../middleware/auth.middleware";
import { upload } from "../middleware/upload.middleware";

const router = Router();

router.post("/add-instructor", authenticate, upload.single("image"), addInstructor);

router.get("/get-all-instructors", authenticate, getInstructors);

router.put("/update-instructor/:instructorId", authenticate, upload.single("image"), updateInstructor);

router.delete("/delete-instructor/:instructorId", authenticate, deleteInstructor);

export default router;
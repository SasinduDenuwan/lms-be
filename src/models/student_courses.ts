import mongoose, { Document, Schema } from "mongoose";

export interface IStudentCourse extends Document {
    _id: mongoose.Types.ObjectId;
    user_id: mongoose.Schema.Types.ObjectId;
    course_id: mongoose.Schema.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}   

const studentCourseSchema = new Schema<IStudentCourse>(
    {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    }, { 
        timestamps: true 
    }
);

export const StudentCourse = mongoose.model<IStudentCourse>("StudentCourse", studentCourseSchema);
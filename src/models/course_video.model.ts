import mongoose, { Document, Schema } from "mongoose";

export interface ICourseVideo extends Document {
  _id: mongoose.Types.ObjectId;
  course_id: mongoose.Schema.Types.ObjectId;
  video_title: string;
  video_url: string;
  video_order: number;
  createdAt: Date;
  updatedAt: Date;
}

const courseVideoSchema = new Schema<ICourseVideo>(
  {
    course_id: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    video_title: { type: String },
    video_url: { type: String },
    video_order: { type: Number },
  },
  {
    timestamps: true,
  }
);

export const CourseVideo = mongoose.model<ICourseVideo>(
  "CourseVideo",
  courseVideoSchema
);

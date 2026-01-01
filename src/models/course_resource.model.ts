import mongoose, { Document, Schema } from "mongoose";

export interface ICourseResource extends Document {
  _id: mongoose.Types.ObjectId;
  course_id: mongoose.Schema.Types.ObjectId;
  resource_title: string;
  resource_url: string;
  resource_order: number;
  createdAt: Date;
  updatedAt: Date;
}

const courseResourceSchema = new Schema<ICourseResource>(
  {
    course_id: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    resource_title: { type: String },
    resource_url: { type: String },
    resource_order: { type: Number },
  },
  {
    timestamps: true,
  }
);

export const CourseResource = mongoose.model<ICourseResource>(
  "CourseResource",
  courseResourceSchema
);
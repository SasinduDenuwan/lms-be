  import mongoose, { Document, Schema } from "mongoose";

  export enum Course_Level {
    BEGINNER = "BEGINNER",
    INTERMEDIATE = "INTERMEDIATE",
    ADVANCED = "ADVANCED",
  }

  export enum Course_Category {
    DEVELOPMENT = "DEVELOPMENT",
    DESIGN = "DESIGN",
    BUSINESS = "BUSINESS",
    MARKETING = "MARKETING",
    IT_AND_SOFTWARE = "IT & SOFTWARE",
    PERSONAL_DEVELOPMENT = "PERSONAL DEVELOPMENT",
    MUSIC = "MUSIC",
    PHOTOGRAPHY = "PHOTOGRAPHY",
    GENERAL = "GENERAL",
  }

  export interface ICourse extends Document {
    _id: mongoose.Types.ObjectId;
    title: string;
    description: string;
    level: Course_Level;
    category: Course_Category;
    image: string;
    students: number;
    instructor: mongoose.Types.ObjectId; // updated
    price: number;
    lessons: number;
    duration: number;
    createdAt: Date;
    updatedAt: Date;
  }

  const courseSchema = new Schema<ICourse>(
    {
      title: { type: String, required: true },
      description: { type: String },

      level: {
        type: String,
        enum: Object.values(Course_Level),
        default: Course_Level.BEGINNER,
      },

      category: {
        type: String,
        enum: Object.values(Course_Category),
        default: Course_Category.GENERAL,
      },

      image: { type: String },

      students: { type: Number, default: 0 },

      // ⭐ NEW: Instructor has ObjectId reference
      instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Instructor",
        required: true,
      },

      price: { type: Number, required: true },

      lessons: { type: Number, default: 0 },

      duration: { type: Number },
    },
    {
      timestamps: true,
    }
  );

  // Virtual populate
  courseSchema.virtual("videos", {
    ref: "CourseVideo",
    localField: "_id",
    foreignField: "course_id",
  });

  courseSchema.virtual("resources", {
    ref: "CourseResource",
    localField: "_id",
    foreignField: "course_id",
  });

  courseSchema.set("toJSON", { virtuals: true });
  courseSchema.set("toObject", { virtuals: true });

  export const Course = mongoose.model<ICourse>("Course", courseSchema);